import { Badge, Button, Group, Progress, Stack, Text, Title } from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import {
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerSkipForward,
  IconPlayerStop,
  IconRefresh,
} from '@tabler/icons-react'
import { getRouteApi, useLocation } from '@tanstack/react-router'
import type { InferSelectModel } from 'drizzle-orm'
import { useEffect, useRef, useState } from 'react'
import type { habits } from '~/db/schema'
import type { PomodoroPhase, PomodoroSettings } from '~/features/root/types/stopwatch'
import { showPhaseCompleteNotification } from '~/features/root/utils/notifications'
import {
  determineNextPhase,
  getCurrentPhaseDuration,
  getPhaseColor,
  getPhaseLabel,
  getStartButtonLabel,
} from '~/features/root/utils/pomodoro'
import { convertSecondsToMinutes } from '~/features/root/utils/stopwatch-utils'

const MILLISECONDS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const STOPWATCH_UPDATE_INTERVAL_MS = 100
const TIME_DISPLAY_PADDING = 2

type PomodoroTimerProps = {
  habitId: InferSelectModel<typeof habits>['id'] | null
  phase: PomodoroPhase
  currentSet: number
  completedPomodoros: number
  accumulatedTime: number
  settings: PomodoroSettings
  isRunning: boolean
  startTime: number | null
  pausedElapsed: number
  isSettingsValid: boolean
  onPhaseChange: (phase: PomodoroPhase) => void
  onSetChange: (set: number) => void
  onCompletedPomodorosChange: (count: number) => void
  onAccumulatedTimeChange: (time: number) => void
  onFinish: () => void
}

export function PomodoroTimer({
  habitId,
  phase,
  currentSet,
  completedPomodoros,
  accumulatedTime,
  settings,
  isRunning,
  startTime,
  pausedElapsed,
  isSettingsValid,
  onPhaseChange,
  onSetChange,
  onCompletedPomodorosChange,
  onAccumulatedTimeChange,
  onFinish,
}: PomodoroTimerProps) {
  const routeApi = getRouteApi('__root__')
  const navigate = routeApi.useNavigate()
  const location = useLocation()

  const [displayTime, setDisplayTime] = useState(pausedElapsed)

  const phaseTransitionHandledRef = useRef(false)

  // 状態値の最新の参照を保持
  const stateRef = useRef({
    phase,
    currentSet,
    completedPomodoros,
    accumulatedTime,
  })

  // 状態値が変更されたら更新
  useEffect(() => {
    stateRef.current = {
      phase,
      currentSet,
      completedPomodoros,
      accumulatedTime,
    }
  })

  // コールバック関数の最新の参照を保持（依存配列の問題を回避）
  const callbacksRef = useRef({
    onPhaseChange,
    onSetChange,
    onCompletedPomodorosChange,
    onAccumulatedTimeChange,
  })

  // コールバック関数が変更されたら更新
  useEffect(() => {
    callbacksRef.current = {
      onPhaseChange,
      onSetChange,
      onCompletedPomodorosChange,
      onAccumulatedTimeChange,
    }
  })

  // フェーズの時間設定（分→秒変換）
  const phaseDuration = getCurrentPhaseDuration(phase, settings) * SECONDS_PER_MINUTE
  const remainingTime = phaseDuration - displayTime
  const progress = phaseDuration > 0 ? (displayTime / phaseDuration) * 100 : 0

  // タイマーロジック
  useEffect(() => {
    if (!isRunning || !startTime || phase === 'waiting') {
      setDisplayTime(pausedElapsed)
      phaseTransitionHandledRef.current = false

      return
    }

    // 現在のフェーズの時間を取得（useEffect内で計算）
    const currentPhaseDuration = getCurrentPhaseDuration(phase, settings) * SECONDS_PER_MINUTE

    const interval = setInterval(() => {
      const now = Date.now()
      const elapsed = Math.floor((now - startTime) / MILLISECONDS_PER_SECOND) + pausedElapsed

      // フェーズ完了チェック（1回のみ実行）
      if (
        elapsed >= currentPhaseDuration &&
        currentPhaseDuration > 0 &&
        !phaseTransitionHandledRef.current
      ) {
        phaseTransitionHandledRef.current = true
        clearInterval(interval)

        // refから最新の状態を取得
        const {
          phase: currentPhase,
          currentSet,
          completedPomodoros,
          accumulatedTime,
        } = stateRef.current

        // 累積時間の更新（集中時間のみ、実際の経過時間を加算）
        const newAccumulatedTime =
          currentPhase === 'focus' ? accumulatedTime + elapsed : accumulatedTime
        const newCompletedPomodoros =
          currentPhase === 'focus' ? completedPomodoros + 1 : completedPomodoros

        // 次のフェーズを決定
        const nextPhase = determineNextPhase(
          currentPhase,
          newCompletedPomodoros,
          settings.longBreakInterval,
        )

        // セット数の更新（休憩が終わったら +1）
        const newSet =
          currentPhase === 'break' || currentPhase === 'longBreak' ? currentSet + 1 : currentSet

        // 開発環境でのみログ出力
        if (import.meta.env.DEV) {
          console.log('🍅 ポモドーロ: フェーズ遷移', {
            currentPhase,
            nextPhase,
            currentSet,
            newSet,
            completedPomodoros: newCompletedPomodoros,
            accumulatedTime: newAccumulatedTime,
          })
        }

        // 通知表示（1回のみ）
        showPhaseCompleteNotification(currentPhase, nextPhase)

        // 状態を更新（refから最新のコールバックを取得）
        callbacksRef.current.onPhaseChange(nextPhase)
        callbacksRef.current.onSetChange(newSet)
        callbacksRef.current.onCompletedPomodorosChange(newCompletedPomodoros)
        callbacksRef.current.onAccumulatedTimeChange(newAccumulatedTime)

        // タイマーを再開
        navigate({
          to: location.pathname,
          search: (prev) => ({
            ...prev,
            stopwatchRunning: true,
            stopwatchStartTime: Date.now(),
            stopwatchElapsed: 0,
          }),
        })

        return
      }

      setDisplayTime(elapsed)
    }, STOPWATCH_UPDATE_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [isRunning, startTime, pausedElapsed, phase, settings, navigate, location.pathname])

  // タイマーが再開されたときにフラグをリセット（startTimeが変わったときのみ）
  useEffect(() => {
    if (startTime) {
      phaseTransitionHandledRef.current = false
    }
  }, [startTime])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / SECONDS_PER_MINUTE)
    const secs = seconds % SECONDS_PER_MINUTE
    return `${String(minutes).padStart(TIME_DISPLAY_PADDING, '0')}:${String(secs).padStart(TIME_DISPLAY_PADDING, '0')}`
  }

  const handleStart = () => {
    if (!habitId) {
      notifications.show({
        title: 'エラー',
        message: '習慣を選択してください',
        color: 'red',
      })
      return
    }

    if (!isSettingsValid) {
      notifications.show({
        title: 'エラー',
        message: '設定値が正しくありません',
        color: 'red',
      })
      return
    }

    // 待機状態から開始する場合、フォーカスフェーズを設定
    if (phase === 'waiting') {
      onPhaseChange('focus')
    }

    navigate({
      to: location.pathname,
      search: (prev) => ({
        ...prev,
        stopwatchRunning: true,
        stopwatchStartTime: Date.now(),
      }),
    })
  }

  const handlePause = () => {
    navigate({
      to: location.pathname,
      search: (prev) => ({
        ...prev,
        stopwatchRunning: false,
        stopwatchStartTime: null,
        stopwatchElapsed: displayTime,
      }),
    })
  }

  const handleResume = () => {
    navigate({
      to: location.pathname,
      search: (prev) => ({
        ...prev,
        stopwatchRunning: true,
        stopwatchStartTime: Date.now(),
      }),
    })
  }

  const handleSkip = () => {
    const wasRunning = isRunning

    modals.openConfirmModal({
      title: 'フェーズをスキップ',
      children: <Text size="sm">現在のフェーズをスキップして次のフェーズに進みますか？</Text>,
      labels: { confirm: 'スキップ', cancel: 'キャンセル' },
      confirmProps: { color: 'orange' },
      onConfirm: () => {
        // 累積時間の更新（集中時間のみ、スキップでも加算しない）
        const newCompletedPomodoros =
          phase === 'focus' ? completedPomodoros + 1 : completedPomodoros

        // 次のフェーズを決定
        const nextPhase = determineNextPhase(
          phase,
          newCompletedPomodoros,
          settings.longBreakInterval,
        )

        // セット数の更新（休憩が終わったら +1）
        const newSet = phase === 'break' || phase === 'longBreak' ? currentSet + 1 : currentSet

        // 状態を更新
        onPhaseChange(nextPhase)
        onSetChange(newSet)
        onCompletedPomodorosChange(newCompletedPomodoros)

        // タイマーを再開
        navigate({
          to: location.pathname,
          search: (prev) => ({
            ...prev,
            stopwatchRunning: true,
            stopwatchStartTime: Date.now(),
            stopwatchElapsed: 0,
          }),
        })
      },
      onCancel: () => {
        // キャンセル時に元の状態を復元
        if (wasRunning) {
          navigate({
            to: location.pathname,
            search: (prev) => ({
              ...prev,
              stopwatchRunning: true,
              stopwatchStartTime: Date.now(),
            }),
          })
        }
      },
    })
  }

  const handleReset = () => {
    const wasRunning = isRunning

    modals.openConfirmModal({
      title: 'ポモドーロをリセット',
      children: (
        <Stack gap="sm">
          <Text size="sm">
            現在のポモドーロセッションを
            <Text component="span" fw={700} c="red">
              リセット
            </Text>
            します。
          </Text>
          <Text size="sm" c="dimmed">
            累積時間やセット数もリセットされます。
          </Text>
        </Stack>
      ),
      labels: { confirm: 'リセット', cancel: 'キャンセル' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        // 状態をすべてリセット
        onPhaseChange('waiting')
        onSetChange(0)
        onCompletedPomodorosChange(0)
        onAccumulatedTimeChange(0)

        navigate({
          to: location.pathname,
          search: (prev) => ({
            ...prev,
            stopwatchRunning: false,
            stopwatchStartTime: null,
            stopwatchElapsed: 0,
          }),
        })
        setDisplayTime(0)
      },
      onCancel: () => {
        // キャンセル時に元の状態を復元
        if (wasRunning) {
          navigate({
            to: location.pathname,
            search: (prev) => ({
              ...prev,
              stopwatchRunning: true,
              stopwatchStartTime: Date.now(),
            }),
          })
        }
      },
    })
  }

  return (
    <Stack gap="lg">
      {/* フェーズ表示 */}
      <Group justify="space-between">
        <Badge
          size="lg"
          color={getPhaseColor(phase)}
          leftSection={phase === 'focus' ? '🍅' : phase === 'break' ? '☕' : '🌟'}
        >
          {getPhaseLabel(phase)}
        </Badge>
        <Text size="sm" c="dimmed">
          {phase === 'waiting' ? '開始前' : `第${currentSet + 1}セット`}
        </Text>
      </Group>

      {/* タイマー表示 */}
      <Stack align="center" gap="xs">
        <Title order={1} style={{ fontSize: '3rem', fontWeight: 700, fontFamily: 'monospace' }}>
          {formatTime(phase === 'waiting' ? 0 : remainingTime)}
        </Title>
        <Text size="sm" c="dimmed">
          {isRunning ? '実行中...' : phase === 'waiting' ? '開始してください' : '一時停止中'}
        </Text>
      </Stack>

      {/* プログレスバー */}
      {phase !== 'waiting' && (
        <Progress
          value={progress}
          color={getPhaseColor(phase)}
          size="lg"
          radius="xl"
          animated={isRunning}
        />
      )}

      {/* 累積時間表示 */}
      <Group justify="space-between">
        <Text size="sm" fw={500}>
          累積集中時間
        </Text>
        <Text size="sm" c="blue" fw={700}>
          {convertSecondsToMinutes(accumulatedTime)}分
        </Text>
      </Group>

      {/* コントロールボタン */}
      {phase === 'waiting' && (
        <Group grow>
          <Button
            leftSection={<IconPlayerPlay size={16} />}
            onClick={handleStart}
            disabled={!habitId || !isSettingsValid}
          >
            {getStartButtonLabel('focus')}
          </Button>
          {accumulatedTime > 0 && (
            <>
              <Button leftSection={<IconRefresh size={16} />} onClick={handleReset} color="red">
                リセット
              </Button>
              <Button leftSection={<IconPlayerStop size={16} />} onClick={onFinish} color="green">
                終了する
              </Button>
            </>
          )}
        </Group>
      )}

      {isRunning && phase !== 'waiting' && (
        <Stack gap="xs">
          <Group grow>
            <Button
              leftSection={<IconPlayerPause size={16} />}
              onClick={handlePause}
              color="orange"
            >
              一時停止
            </Button>
            <Button
              leftSection={<IconPlayerSkipForward size={16} />}
              onClick={handleSkip}
              color="gray"
            >
              スキップ
            </Button>
            <Button leftSection={<IconPlayerStop size={16} />} onClick={onFinish} color="green">
              終了する
            </Button>
          </Group>
          <Button
            leftSection={<IconRefresh size={16} />}
            onClick={handleReset}
            color="red"
            variant="light"
            size="xs"
          >
            すべてリセット
          </Button>
        </Stack>
      )}

      {!isRunning && phase !== 'waiting' && (
        <Stack gap="xs">
          <Group grow>
            <Button leftSection={<IconPlayerPlay size={16} />} onClick={handleResume}>
              {pausedElapsed > 0 || displayTime > 0 ? '再開する' : '開始する'}
            </Button>
            <Button
              leftSection={<IconPlayerSkipForward size={16} />}
              onClick={handleSkip}
              color="gray"
            >
              スキップ
            </Button>
            <Button leftSection={<IconPlayerStop size={16} />} onClick={onFinish} color="green">
              終了する
            </Button>
          </Group>
          <Button
            leftSection={<IconRefresh size={16} />}
            onClick={handleReset}
            color="red"
            variant="light"
            size="xs"
          >
            すべてリセット
          </Button>
        </Stack>
      )}
    </Stack>
  )
}

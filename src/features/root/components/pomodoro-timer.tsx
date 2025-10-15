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
import { useEffect, useState } from 'react'
import type { habits } from '~/db/schema'
import type { SearchParams } from '~/features/habits/types/schemas/search-params'
import type { PomodoroSettings } from '~/features/root/types/stopwatch'
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
  phase: NonNullable<SearchParams['pomodoroPhase']>
  completedPomodoros: number
  accumulatedTime: number
  settings: PomodoroSettings
  isRunning: boolean
  startTime: number | null
  pausedElapsed: number
  onFinish: () => void
}

export function PomodoroTimer({
  habitId,
  phase,
  completedPomodoros,
  accumulatedTime,
  settings,
  isRunning,
  startTime,
  pausedElapsed,
  onFinish,
}: PomodoroTimerProps) {
  const routeApi = getRouteApi('__root__')
  const navigate = routeApi.useNavigate()
  const location = useLocation()

  const [displayTime, setDisplayTime] = useState(pausedElapsed)

  // フェーズの時間設定（分→秒変換）
  const phaseDuration = getCurrentPhaseDuration(phase, settings) * SECONDS_PER_MINUTE
  const remainingTime = phaseDuration - displayTime
  const progress = phaseDuration > 0 ? (displayTime / phaseDuration) * 100 : 0

  // タイマーロジック
  useEffect(() => {
    if (!isRunning || !startTime || phase === 'waiting') {
      setDisplayTime(pausedElapsed)
      return
    }

    const interval = setInterval(() => {
      const now = Date.now()
      const elapsed = Math.floor((now - startTime) / MILLISECONDS_PER_SECOND) + pausedElapsed

      // フェーズ完了チェック
      if (elapsed >= phaseDuration && phaseDuration > 0) {
        clearInterval(interval)

        // 累積時間の更新（集中時間のみ）
        const newAccumulatedTime =
          phase === 'focus' ? accumulatedTime + phaseDuration : accumulatedTime
        const newCompletedPomodoros =
          phase === 'focus' ? completedPomodoros + 1 : completedPomodoros

        // 次のフェーズを決定
        const nextPhase = determineNextPhase(
          phase,
          newCompletedPomodoros,
          settings.longBreakInterval,
        )

        // 通知表示
        showPhaseCompleteNotification(phase, nextPhase)

        // 次のフェーズに自動遷移（待機状態ではなく直接開始）
        navigate({
          to: location.pathname,
          search: (prev) => ({
            ...prev,
            stopwatchRunning: true,
            stopwatchStartTime: Date.now(),
            stopwatchElapsed: 0,
            pomodoroPhase: nextPhase,
            pomodoroSet: newCompletedPomodoros,
            pomodoroCompletedPomodoros: newCompletedPomodoros,
            pomodoroAccumulatedTime: newAccumulatedTime,
          }),
        })

        return
      }

      setDisplayTime(elapsed)
    }, STOPWATCH_UPDATE_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [
    isRunning,
    startTime,
    pausedElapsed,
    phase,
    phaseDuration,
    accumulatedTime,
    completedPomodoros,
    settings.longBreakInterval,
    navigate,
    location.pathname,
  ])

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

    // 待機状態から開始する場合、次のフェーズを決定
    const nextPhase =
      phase === 'waiting'
        ? determineNextPhase('break', completedPomodoros, settings.longBreakInterval)
        : phase

    navigate({
      to: location.pathname,
      search: (prev) => ({
        ...prev,
        stopwatchRunning: true,
        stopwatchStartTime: Date.now(),
        pomodoroPhase: nextPhase,
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

        // 次のフェーズに自動遷移
        navigate({
          to: location.pathname,
          search: (prev) => ({
            ...prev,
            stopwatchRunning: true,
            stopwatchStartTime: Date.now(),
            stopwatchElapsed: 0,
            pomodoroPhase: nextPhase,
            pomodoroSet: newCompletedPomodoros,
            pomodoroCompletedPomodoros: newCompletedPomodoros,
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
        navigate({
          to: location.pathname,
          search: (prev) => ({
            ...prev,
            stopwatchRunning: false,
            stopwatchStartTime: null,
            stopwatchElapsed: 0,
            pomodoroPhase: 'waiting',
            pomodoroSet: 1,
            pomodoroCompletedPomodoros: 0,
            pomodoroAccumulatedTime: 0,
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
          {phase === 'waiting' ? '開始前' : `第${completedPomodoros + 1}ポモドーロ`}
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
            disabled={!habitId}
          >
            {getStartButtonLabel(
              determineNextPhase('break', completedPomodoros, settings.longBreakInterval),
            )}
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

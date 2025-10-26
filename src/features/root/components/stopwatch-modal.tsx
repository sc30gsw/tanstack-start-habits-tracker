import {
  Box,
  Divider,
  Group,
  Modal,
  SegmentedControl,
  Select,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core'
import { modals } from '@mantine/modals'
import { IconAlertTriangle } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, useLocation } from '@tanstack/react-router'
import dayjs from 'dayjs'
import type { InferSelectModel } from 'drizzle-orm'
import { Suspense, useEffect, useRef, useState } from 'react'
import { GET_HABITS_CACHE_KEY } from '~/constants/cache-key'
import type { habits as HabitTable } from '~/db/schema'
import { habitDto } from '~/features/habits/server/habit-functions'
import type { HabitEntity } from '~/features/habits/types/habit'
import type { SearchParams } from '~/features/habits/types/schemas/search-params'
import { AmbientSoundPlayer } from '~/features/root/components/ambient-sound-player'
import { FinishRecordForm } from '~/features/root/components/final-record-form'
import { PomodoroSettingsForm } from '~/features/root/components/pomodoro-settings'
import { PomodoroTimer } from '~/features/root/components/pomodoro-timer'
import { StopwatchTimer } from '~/features/root/components/stopwatch-timer'
import { stopwatchDto } from '~/features/root/server/stopwatch-functions'
import type { PomodoroPhase, PomodoroSettings } from '~/features/root/types/stopwatch'
import { requestNotificationPermission } from '~/features/root/utils/notifications'
import { DEFAULT_POMODORO_SETTINGS } from '~/features/root/utils/pomodoro'
import { convertSecondsToMinutes } from '~/features/root/utils/stopwatch-utils'
import {
  clearTimerState,
  loadTimerState,
  onVisibilityChange,
  saveTimerState,
  WakeLockManager,
} from '~/features/root/utils/timer-persistence'

export function StopwatchModal() {
  const routeApi = getRouteApi('__root__')
  const navigate = routeApi.useNavigate()
  const location = useLocation()
  const searchParams = routeApi.useSearch()

  const isOpen = searchParams.stopwatchOpen ?? false
  const selectedHabitId = searchParams.stopwatchHabitId ?? null
  const isRunning = searchParams.stopwatchRunning ?? false
  const startTime = searchParams.stopwatchStartTime ?? null
  const pausedElapsed = searchParams.stopwatchElapsed ?? 0

  const mode = searchParams.stopwatchMode ?? 'stopwatch'
  const [phase, setPhase] = useState<PomodoroPhase>('waiting')
  const [currentSet, setCurrentSet] = useState(0)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [accumulatedTime, setAccumulatedTime] = useState(0)
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_POMODORO_SETTINGS)
  const [isSettingsValid, setIsSettingsValid] = useState(true)
  const [isStateRestored, setIsStateRestored] = useState(false)

  const [shouldStopAmbient, setShouldStopAmbient] = useState(false)

  const wakeLockManager = useRef(new WakeLockManager())

  useEffect(() => {
    if (!isStateRestored && isOpen) {
      const savedState = loadTimerState()

      if (savedState && savedState.habitId === selectedHabitId && savedState.mode === mode) {
        if (mode === 'pomodoro' && savedState.phase) {
          setPhase(savedState.phase)
          setCurrentSet(savedState.currentSet ?? 0)
          setCompletedPomodoros(savedState.completedPomodoros ?? 0)
          setAccumulatedTime(savedState.accumulatedTime ?? 0)

          if (savedState.settings) {
            setSettings(savedState.settings)
          }
        }
      }

      setIsStateRestored(true)
    }
  }, [isOpen, isStateRestored, selectedHabitId, mode])

  // Wake Lock管理: タイマー実行中のみ有効化
  useEffect(() => {
    if (isRunning && isOpen) {
      wakeLockManager.current.request()
    } else {
      wakeLockManager.current.release()
    }

    // コンポーネントアンマウント時に必ず解放
    return () => {
      console.log('🧹 StopwatchModal cleanup: Wake Lock解放')
      wakeLockManager.current.release()
    }
  }, [isRunning, isOpen])

  // ページ離脱時にWake Lockを確実に解放
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('🚪 ページ離脱: Wake Lock解放')
      wakeLockManager.current.release()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  useEffect(() => {
    if (isOpen && (isRunning || pausedElapsed > 0 || accumulatedTime > 0)) {
      const interval = setInterval(() => {
        saveTimerState({
          mode,
          habitId: selectedHabitId,
          isRunning,
          startTime,
          pausedElapsed,
          phase,
          currentSet,
          completedPomodoros,
          accumulatedTime,
          settings,
          lastSaved: Date.now(),
        })
      }, 5000)

      return () => {
        clearInterval(interval)
      }
    }
  }, [
    isOpen,
    mode,
    selectedHabitId,
    isRunning,
    startTime,
    pausedElapsed,
    phase,
    currentSet,
    completedPomodoros,
    accumulatedTime,
    settings,
  ])

  useEffect(() => {
    const cleanup = onVisibilityChange((isVisible) => {
      if (isVisible && isRunning) {
        wakeLockManager.current.request()
      }
    })

    return cleanup
  }, [isRunning])

  useEffect(() => {
    if (isOpen && mode === 'pomodoro') {
      requestNotificationPermission()
    }
  }, [isOpen, mode])

  useEffect(() => {
    if (!isOpen) {
      setIsStateRestored(false)
    }
  }, [isOpen])

  const { data: habitsResponse } = useSuspenseQuery({
    queryKey: [GET_HABITS_CACHE_KEY],
    queryFn: () =>
      habitDto.getHabits({
        data: {
          q: '',
          habitSort: 'all',
          habitFilter: 'all',
        },
      }),
  })

  const habits: HabitEntity[] = habitsResponse?.data ?? []

  const handleClose = () => {
    if (isRunning || pausedElapsed > 0 || (mode === 'pomodoro' && accumulatedTime > 0)) {
      const wasRunning = isRunning
      const currentDisplayTime =
        isRunning && startTime
          ? Math.floor((Date.now() - startTime) / 1000) + pausedElapsed
          : pausedElapsed

      // モーダルを開く前に一時停止（確認中はタイマーを止める）
      if (wasRunning) {
        navigate({
          to: location.pathname,
          search: (prev) => ({
            ...prev,
            stopwatchRunning: false,
            stopwatchStartTime: null,
            stopwatchElapsed: currentDisplayTime,
          }),
        })
      }

      modals.openConfirmModal({
        title: (
          <Group gap="xs">
            <IconAlertTriangle size={20} />
            <Text>計測を中断</Text>
          </Group>
        ),
        children: (
          <Stack gap="sm">
            <Text size="sm">
              計測中の時間は
              <Text component="span" fw={700} c="red">
                記録されません
              </Text>
              。
            </Text>
            <Text size="sm" c="dimmed">
              記録する場合は「終了する」ボタンを使用してください。
            </Text>
          </Stack>
        ),
        labels: { confirm: '閉じる', cancel: 'キャンセル' },
        confirmProps: { color: 'red' },
        onConfirm: () => {
          setPhase('waiting')
          setCurrentSet(0)
          setCompletedPomodoros(0)
          setAccumulatedTime(0)
          setIsStateRestored(false)

          clearTimerState()

          setShouldStopAmbient(true)

          navigate({
            to: location.pathname,
            search: (prev) => ({
              ...prev,
              stopwatchOpen: false,
              stopwatchHabitId: null,
              stopwatchRunning: false,
              stopwatchStartTime: null,
              stopwatchElapsed: 0,
            }),
          })
        },
        onCancel: () => {
          if (wasRunning) {
            navigate({
              to: location.pathname,
              search: (prev) => ({
                ...prev,
                stopwatchRunning: true,
                stopwatchStartTime: Date.now(),
                stopwatchElapsed: currentDisplayTime,
              }),
            })
          }
        },
      })
    } else {
      setShouldStopAmbient(true)

      navigate({
        to: location.pathname,
        search: (prev) => ({
          ...prev,
          stopwatchOpen: false,
        }),
      })
    }
  }

  const handleHabitSelect = (habitId: InferSelectModel<typeof HabitTable>['id'] | null) => {
    navigate({
      to: location.pathname,
      search: (prev) => ({
        ...prev,
        stopwatchHabitId: habitId,
      }),
    })
  }

  const handleModeChange = (newMode: string) => {
    // モード切り替え時に状態をリセット
    setPhase('waiting')
    setCurrentSet(0)
    setCompletedPomodoros(0)
    setAccumulatedTime(0)
    setIsStateRestored(false)
    clearTimerState()

    navigate({
      to: location.pathname,
      search: (prev) => ({
        ...prev,
        stopwatchMode: newMode as SearchParams['stopwatchMode'],
        stopwatchRunning: false,
        stopwatchStartTime: null,
        stopwatchElapsed: 0,
        pomodoroPhase: 'waiting',
        pomodoroSet: 1,
        pomodoroCompletedPomodoros: 0,
        pomodoroAccumulatedTime: 0,
      }),
    })
  }

  const handleAmbientStopped = () => {
    setShouldStopAmbient(false)
  }

  const handleFinish = async () => {
    clearTimerState()

    setIsStateRestored(false)

    let currentElapsed = pausedElapsed

    if (isRunning && startTime) {
      currentElapsed = Math.floor((Date.now() - startTime) / 1000) + pausedElapsed
    }

    if (isRunning) {
      navigate({
        to: location.pathname,
        search: (prev) => ({
          ...prev,
          stopwatchRunning: false,
          stopwatchStartTime: null,
          stopwatchElapsed: currentElapsed,
        }),
      })
    }

    const totalSeconds = mode === 'pomodoro' ? accumulatedTime : currentElapsed
    const currentMinutes = convertSecondsToMinutes(totalSeconds)

    const openRecordModal = () => {
      modals.open({
        title: '習慣を記録',
        children: (
          <Suspense fallback={<FinishRecordFormSkeleton />}>
            <FinishRecordForm elapsedSeconds={totalSeconds} habitId={selectedHabitId!} />
          </Suspense>
        ),
      })
    }

    if (currentMinutes === 0) {
      // 既存記録の有無を確認
      const today = dayjs().format('YYYY-MM-DD')

      const existingRecordResponse = await stopwatchDto.getRecordByHabitAndDate({
        data: { habitId: selectedHabitId!, date: today },
      })
      const hasExistingRecord = existingRecordResponse?.success && existingRecordResponse?.data

      modals.openConfirmModal({
        title: (
          <Group gap="xs">
            <IconAlertTriangle size={20} />
            <Text>1分未満の記録</Text>
          </Group>
        ),
        children: (
          <Stack gap="sm">
            <Text size="sm">
              計測時間が1分未満のため、
              <Text component="span" fw={700} c="orange">
                0分として記録
              </Text>
              されます。
            </Text>
            {!hasExistingRecord && (
              <Text size="sm" c="orange" fw={600}>
                ステータスは「スキップ」として記録されます。
              </Text>
            )}
            <Text size="sm" c="dimmed">
              このまま記録を続けますか？
            </Text>
          </Stack>
        ),
        labels: { confirm: '0分で記録する', cancel: 'キャンセル' },
        confirmProps: { color: 'orange' },
        onConfirm: openRecordModal,
      })

      return
    }

    openRecordModal()
  }

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      title={mode === 'stopwatch' ? 'ストップウォッチ' : 'ポモドーロタイマー'}
      size="md"
      centered
    >
      <Stack gap="lg">
        {/* モード選択 */}
        <SegmentedControl
          value={mode}
          onChange={handleModeChange}
          data={[
            { label: 'ストップウォッチ', value: 'stopwatch' },
            { label: 'ポモドーロ', value: 'pomodoro' },
          ]}
          disabled={
            isRunning ||
            pausedElapsed > 0 ||
            (mode === 'pomodoro' && (accumulatedTime > 0 || phase !== 'waiting'))
          }
        />

        {/* 習慣選択 */}
        <Select
          label="習慣を選択"
          placeholder="習慣を選んでください"
          data={habits.map((habit) => ({
            value: habit.id,
            label: habit.name,
          }))}
          value={selectedHabitId}
          onChange={handleHabitSelect}
          disabled={isRunning || pausedElapsed > 0}
          searchable
        />

        {/* ポモドーロ設定 */}
        {mode === 'pomodoro' && (
          <PomodoroSettingsForm
            settings={settings}
            onSettingsChange={setSettings}
            onValidationChange={setIsSettingsValid}
            disabled={isRunning || phase !== 'waiting'}
          />
        )}

        <Divider label="環境音" labelPosition="left" />
        <Box mb={16}>
          <AmbientSoundPlayer shouldStop={shouldStopAmbient} onStopped={handleAmbientStopped} />
        </Box>

        {/* タイマー表示 */}
        {mode === 'stopwatch' ? (
          <StopwatchTimer
            habitId={selectedHabitId}
            isRunning={isRunning}
            startTime={startTime}
            pausedElapsed={pausedElapsed}
            onFinish={handleFinish}
          />
        ) : (
          <PomodoroTimer
            habitId={selectedHabitId}
            phase={phase}
            currentSet={currentSet}
            completedPomodoros={completedPomodoros}
            accumulatedTime={accumulatedTime}
            settings={settings}
            isRunning={isRunning}
            startTime={startTime}
            pausedElapsed={pausedElapsed}
            isSettingsValid={isSettingsValid}
            onPhaseChange={setPhase}
            onSetChange={setCurrentSet}
            onCompletedPomodorosChange={setCompletedPomodoros}
            onAccumulatedTimeChange={setAccumulatedTime}
            onFinish={handleFinish}
          />
        )}
      </Stack>
    </Modal>
  )
}

function FinishRecordFormSkeleton() {
  return (
    <Stack gap="md">
      <Skeleton height={20} width="60%" />
      <Skeleton height={80} />
      <Skeleton height={40} />
      <Skeleton height={120} />
      <Group gap="sm">
        <Skeleton height={36} width={100} />
        <Skeleton height={36} width={100} />
      </Group>
    </Stack>
  )
}

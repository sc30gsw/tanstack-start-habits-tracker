import { Group, Modal, SegmentedControl, Select, Skeleton, Stack, Text } from '@mantine/core'
import { modals } from '@mantine/modals'
import { IconAlertTriangle } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, useLocation } from '@tanstack/react-router'
import type { InferSelectModel } from 'drizzle-orm'
import { Suspense, useEffect } from 'react'
import { GET_HABITS_CACHE_KEY } from '~/constants/cache-key'
import type { habits as HabitTable } from '~/db/schema'
import { habitDto } from '~/features/habits/server/habit-functions'
import type { HabitEntity } from '~/features/habits/types/habit'
import { FinishRecordForm } from '~/features/root/components/final-record-form'
import { PomodoroSettingsForm } from '~/features/root/components/pomodoro-settings'
import { PomodoroTimer } from '~/features/root/components/pomodoro-timer'
import { StopwatchTimer } from '~/features/root/components/stopwatch-timer'
import type {
  PomodoroPhase,
  PomodoroSettings,
  StopwatchMode,
} from '~/features/root/types/stopwatch'
import { requestNotificationPermission } from '~/features/root/utils/notifications'
import { DEFAULT_POMODORO_SETTINGS } from '~/features/root/utils/pomodoro'
import { convertSecondsToMinutes } from '~/features/root/utils/stopwatch-utils'

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

  // ポモドーロ関連の状態
  const mode: StopwatchMode = searchParams.stopwatchMode ?? 'stopwatch'
  const phase: PomodoroPhase = searchParams.pomodoroPhase ?? 'waiting'
  const currentSet = searchParams.pomodoroSet ?? 1
  const completedPomodoros = searchParams.pomodoroCompletedPomodoros ?? 0
  const accumulatedTime = searchParams.pomodoroAccumulatedTime ?? 0

  const settings: PomodoroSettings = {
    focusDuration: searchParams.pomodoroFocusDuration ?? DEFAULT_POMODORO_SETTINGS.focusDuration,
    breakDuration: searchParams.pomodoroBreakDuration ?? DEFAULT_POMODORO_SETTINGS.breakDuration,
    longBreakDuration:
      searchParams.pomodoroLongBreakDuration ?? DEFAULT_POMODORO_SETTINGS.longBreakDuration,
    longBreakInterval:
      searchParams.pomodoroLongBreakInterval ?? DEFAULT_POMODORO_SETTINGS.longBreakInterval,
  }

  // 通知権限のリクエスト
  useEffect(() => {
    if (isOpen && mode === 'pomodoro') {
      requestNotificationPermission()
    }
  }, [isOpen, mode])

  const { data: habitsResponse } = useSuspenseQuery({
    queryKey: [GET_HABITS_CACHE_KEY],
    queryFn: () => habitDto.getHabits(),
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
          navigate({
            to: location.pathname,
            search: (prev) => ({
              ...prev,
              stopwatchOpen: false,
              stopwatchHabitId: null,
              stopwatchRunning: false,
              stopwatchStartTime: null,
              stopwatchElapsed: 0,
              pomodoroPhase: 'waiting',
              pomodoroSet: 1,
              pomodoroCompletedPomodoros: 0,
              pomodoroAccumulatedTime: 0,
            }),
          })
        },
        onCancel: () => {
          // キャンセル時に元の状態を復元（再開）
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
    navigate({
      to: location.pathname,
      search: (prev) => ({
        ...prev,
        stopwatchMode: newMode as StopwatchMode,
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

  const handleFinish = () => {
    if (isRunning) {
      navigate({
        to: location.pathname,
        search: (prev) => ({
          ...prev,
          stopwatchRunning: false,
          stopwatchStartTime: null,
        }),
      })
    }

    // ポモドーロモードの場合は累積時間を使用、ストップウォッチモードの場合は経過時間を使用
    const totalSeconds = mode === 'pomodoro' ? accumulatedTime : pausedElapsed
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
          disabled={isRunning || pausedElapsed > 0 || (mode === 'pomodoro' && accumulatedTime > 0)}
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
          disabled={isRunning || pausedElapsed > 0 || (mode === 'pomodoro' && accumulatedTime > 0)}
          searchable
        />

        {/* ポモドーロ設定 */}
        {mode === 'pomodoro' && (
          <PomodoroSettingsForm
            settings={settings}
            disabled={isRunning || pausedElapsed > 0 || accumulatedTime > 0}
          />
        )}

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

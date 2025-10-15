import {
  Button,
  Group,
  Modal,
  Select,
  Skeleton,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import {
  IconAlertTriangle,
  IconClock,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerStop,
  IconRefresh,
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, useLocation } from '@tanstack/react-router'
import type { InferSelectModel } from 'drizzle-orm'
import { Suspense, useEffect, useState } from 'react'
import { GET_HABITS_CACHE_KEY } from '~/constants/cache-key'
import type { habits as HabitTable } from '~/db/schema'
import { habitDto } from '~/features/habits/server/habit-functions'
import type { HabitEntity } from '~/features/habits/types/habit'
import { FinishRecordForm } from '~/features/root/components/final-record-form'
import { convertSecondsToMinutes } from '~/features/root/utils/stopwatch-utils'

const MILLISECONDS_PER_SECOND = 1000
const SECONDS_PER_HOUR = 3600
const STOPWATCH_UPDATE_INTERVAL_MS = 100
const TIME_DISPLAY_PADDING = 2
const SECONDS_PER_MINUTE = 60

export function StopwatchModal() {
  const routeApi = getRouteApi('__root__')
  const navigate = routeApi.useNavigate()
  const location = useLocation()
  const searchParams = routeApi.useSearch()

  const theme = useMantineTheme()

  const isOpen = searchParams.stopwatchOpen ?? false
  const selectedHabitId = searchParams.stopwatchHabitId ?? null
  const isRunning = searchParams.stopwatchRunning ?? false
  const startTime = searchParams.stopwatchStartTime ?? null
  const pausedElapsed = searchParams.stopwatchElapsed ?? 0

  const [displayTime, setDisplayTime] = useState(pausedElapsed)

  const { data: habitsResponse } = useSuspenseQuery({
    queryKey: [GET_HABITS_CACHE_KEY],
    queryFn: () => habitDto.getHabits(),
  })

  const habits: HabitEntity[] = habitsResponse?.data ?? []

  useEffect(() => {
    if (!isRunning || !startTime) {
      setDisplayTime(pausedElapsed)

      return
    }

    const interval = setInterval(() => {
      const now = Date.now()
      const elapsed = Math.floor((now - startTime) / MILLISECONDS_PER_SECOND) + pausedElapsed

      setDisplayTime(elapsed)
    }, STOPWATCH_UPDATE_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [isRunning, startTime, pausedElapsed])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / SECONDS_PER_HOUR)
    const minutes = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE)
    const secs = seconds % SECONDS_PER_MINUTE

    return `${String(hours).padStart(TIME_DISPLAY_PADDING, '0')}:${String(minutes).padStart(TIME_DISPLAY_PADDING, '0')}:${String(secs).padStart(TIME_DISPLAY_PADDING, '0')}`
  }

  const handleClose = () => {
    if (isRunning || pausedElapsed > 0) {
      // タイマーが動いている場合は先に停止
      if (isRunning) {
        const currentElapsed = displayTime

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

      modals.openConfirmModal({
        title: (
          <Group gap="xs">
            <IconAlertTriangle size={20} color={theme.colors.red[6]} />
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
            }),
          })
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

  const handleStart = () => {
    if (!selectedHabitId) {
      notifications.show({
        title: 'エラー',
        message: '習慣を選択してください',
        color: 'red',
      })
      return
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
    const currentElapsed = displayTime

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

  const handleReset = () => {
    // タイマーが動いている場合は先に停止
    if (isRunning) {
      const currentElapsed = displayTime

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

    modals.openConfirmModal({
      title: (
        <Group gap="xs">
          <IconRefresh size={20} color={theme.colors.orange[6]} />
          <Text>タイマーをリセット</Text>
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
            タイマーを0:00:00に戻してやり直しますか？
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
          }),
        })
        setDisplayTime(0)
      },
    })
  }

  const handleFinish = () => {
    if (isRunning) {
      const currentElapsed = displayTime

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

    const currentElapsed = displayTime
    const currentMinutes = convertSecondsToMinutes(currentElapsed)

    const openRecordModal = () => {
      modals.open({
        title: '習慣を記録',
        children: (
          <Suspense fallback={<FinishRecordFormSkeleton />}>
            <FinishRecordForm elapsedSeconds={currentElapsed} habitId={selectedHabitId!} />
          </Suspense>
        ),
      })
    }

    if (currentMinutes === 0) {
      modals.openConfirmModal({
        title: (
          <Group gap="xs">
            <IconAlertTriangle size={20} color={theme.colors.yellow[6]} />
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
    <Modal opened={isOpen} onClose={handleClose} title="ストップウォッチ" size="md" centered>
      <Stack gap="lg">
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

        <Stack align="center" gap="xs">
          <IconClock size={48} color={theme.colors.blue[6]} />
          <Title order={1} style={{ fontSize: '3rem', fontWeight: 700, fontFamily: 'monospace' }}>
            {formatTime(displayTime)}
          </Title>
          <Text size="sm" c="dimmed">
            {isRunning ? '計測中...' : pausedElapsed > 0 ? '一時停止中' : '開始してください'}
          </Text>
        </Stack>

        {!isRunning && pausedElapsed === 0 && (
          <Group grow>
            <Button
              leftSection={<IconPlayerPlay size={16} />}
              onClick={handleStart}
              disabled={!selectedHabitId}
            >
              開始する
            </Button>
            <Button variant="subtle" onClick={handleClose}>
              閉じる
            </Button>
          </Group>
        )}

        {isRunning && (
          <Group grow>
            <Button
              leftSection={<IconPlayerPause size={16} />}
              onClick={handlePause}
              color="orange"
            >
              一時停止
            </Button>
            <Button leftSection={<IconRefresh size={16} />} onClick={handleReset} color="red">
              リセット
            </Button>
            <Button leftSection={<IconPlayerStop size={16} />} onClick={handleFinish} color="green">
              終了する
            </Button>
          </Group>
        )}

        {!isRunning && pausedElapsed > 0 && (
          <Group grow>
            <Button leftSection={<IconPlayerPlay size={16} />} onClick={handleResume}>
              再開する
            </Button>
            <Button leftSection={<IconRefresh size={16} />} onClick={handleReset} color="red">
              リセット
            </Button>
            <Button leftSection={<IconPlayerStop size={16} />} onClick={handleFinish} color="green">
              終了する
            </Button>
          </Group>
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

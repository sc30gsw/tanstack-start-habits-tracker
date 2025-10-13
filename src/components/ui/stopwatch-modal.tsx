import {
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  Textarea,
  Title,
  useComputedColorScheme,
  useMantineTheme,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import {
  IconClock,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerStop,
  IconRefresh,
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, useLocation, useRouter } from '@tanstack/react-router'
import dayjs from 'dayjs'
import type { InferSelectModel } from 'drizzle-orm'
import { useEffect, useState, useTransition } from 'react'
import { z } from 'zod/v4'
import { GET_HABITS_CACHE_KEY } from '~/constants/cache-key'
import type { habits as HabitTable } from '~/db/schema'
import { habitDto } from '~/features/habits/server/habit-functions'
import { stopwatchDto } from '~/features/habits/server/stopwatch-functions'
import type { HabitEntity } from '~/features/habits/types/habit'

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
      const elapsed = Math.floor((now - startTime) / 1000) + pausedElapsed

      setDisplayTime(elapsed)
    }, 100)

    return () => clearInterval(interval)
  }, [isRunning, startTime, pausedElapsed])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const handleClose = () => {
    if (isRunning || pausedElapsed > 0) {
      modals.openConfirmModal({
        title: (
          <Group gap="xs">
            <IconPlayerStop size={20} />
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
    modals.openConfirmModal({
      title: (
        <Group gap="xs">
          <IconRefresh size={20} />
          <Text>タイマーをリセット</Text>
        </Group>
      ),
      children: (
        <Stack gap="sm">
          <Text size="sm">
            計測中の
            <Text component="span" fw={700} c="orange">
              {formatTime(displayTime)}
            </Text>
            は
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
    const currentElapsed = displayTime

    if (currentElapsed === 0) {
      notifications.show({
        title: 'エラー',
        message: '記録する時間がありません',
        color: 'red',
      })

      return
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

    modals.open({
      title: '習慣を記録',
      children: <FinishRecordForm elapsedSeconds={currentElapsed} habitId={selectedHabitId!} />,
    })
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

const finishRecordFormSchema = z.object({
  notes: z.string().max(500, 'メモは500文字以内で入力してください').optional(),
})

type FinishRecordFormProps = {
  elapsedSeconds: number
  habitId: InferSelectModel<typeof HabitTable>['id']
}

function FinishRecordForm({ elapsedSeconds, habitId }: FinishRecordFormProps) {
  const routeApi = getRouteApi('__root__')
  const navigate = routeApi.useNavigate()
  const location = useLocation()
  const router = useRouter()

  const [isPending, startTransition] = useTransition()
  const computedColorScheme = useComputedColorScheme('light')

  const durationMinutes = Math.ceil(elapsedSeconds / 60)

  const form = useForm<z.infer<typeof finishRecordFormSchema>>({
    initialValues: {
      notes: '',
    },
    validate: (values) => {
      const result = finishRecordFormSchema.safeParse(values)

      if (result.success) {
        return {}
      }

      const fieldErrors: Record<string, string> = {}

      for (const issue of result.error.issues) {
        const path = issue.path[0]

        if (typeof path === 'string' && !fieldErrors[path]) {
          fieldErrors[path] = issue.message
        }
      }

      return fieldErrors
    },
  })

  const handleSubmit = (values: z.infer<typeof finishRecordFormSchema>) => {
    startTransition(async () => {
      try {
        const today = dayjs().format('YYYY-MM-DD')

        const result = await stopwatchDto.saveStopwatchRecord({
          data: {
            habitId,
            durationMinutes,
            notes: values.notes?.trim() || undefined,
            date: today,
          },
        })

        if (result.success) {
          router.invalidate()

          notifications.show({
            title: '✅ 記録完了',
            message: `${durationMinutes}分の習慣を記録しました`,
            color: 'green',
          })

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

          modals.closeAll()
        } else {
          notifications.show({
            title: 'エラー',
            message: result.error ?? '記録に失敗しました',
            color: 'red',
          })
        }
      } catch {
        notifications.show({
          title: 'エラー',
          message: '記録に失敗しました',
          color: 'red',
        })
      }
    })
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          ここまでの習慣を記録しますか？
        </Text>

        <Group gap="xs">
          <Text size="lg" fw={600}>
            記録時間:
          </Text>
          <Text size="lg" fw={700} c="blue">
            {durationMinutes}分
          </Text>
        </Group>

        <Textarea
          label="メモ・感想"
          placeholder="今日の感想や具体的に何をやったかを記録..."
          rows={4}
          maxLength={500}
          key={form.key('notes')}
          {...form.getInputProps('notes')}
          disabled={isPending}
          description={`${form.values.notes?.length ?? 0}/500文字`}
          data-autofocus
          styles={{
            input: {
              backgroundColor:
                computedColorScheme === 'dark'
                  ? 'var(--mantine-color-dark-6)'
                  : 'var(--mantine-color-white)',
              color:
                computedColorScheme === 'dark'
                  ? 'var(--mantine-color-gray-1)'
                  : 'var(--mantine-color-dark-8)',
              border:
                computedColorScheme === 'dark'
                  ? '1px solid var(--mantine-color-dark-4)'
                  : '1px solid var(--mantine-color-gray-3)',
            },
          }}
        />

        <Group gap="sm">
          <Button type="submit" loading={isPending} disabled={isPending}>
            記録する
          </Button>
          <Button variant="outline" onClick={() => modals.closeAll()} disabled={isPending}>
            キャンセル
          </Button>
        </Group>
      </Stack>
    </form>
  )
}

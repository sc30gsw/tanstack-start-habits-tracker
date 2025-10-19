import { DndContext, type DragEndEvent } from '@dnd-kit/core'
import { Alert, Group, Stack, Text, useComputedColorScheme } from '@mantine/core'
import {
  IconAlertTriangle,
  IconCheck,
  IconCircleDashed,
  IconPlayerSkipForward,
} from '@tabler/icons-react'
import { getRouteApi, useRouter } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { filter, groupBy, pipe } from 'remeda'
import {
  scheduleHabit,
  skipHabit,
  unscheduleHabit,
} from '~/features/habits/server/schedule-functions'
import type { RecordEntity } from '~/features/habits/types/habit'
import { getValidatedDate } from '~/features/habits/types/schemas/search-params'
import { DraggableHabitCard } from '~/features/home/components/draggable-habit-card'
import { DroppableZone } from '~/features/home/components/droppable-zone'
import { HabitPriorityFilterPaper } from '~/features/home/components/habit-priority-filter-paper'

const DROPZONE_IDS = {
  SCHEDULED: 'scheduled',
  SKIPPED: 'skipped',
  UNSCHEDULED: 'unscheduled',
} as const satisfies Record<string, string>

export function DailyHabitList() {
  const apiRoute = getRouteApi('/')
  const searchParams = apiRoute.useSearch()
  const selectedDate = getValidatedDate(searchParams.selectedDate)
  const router = useRouter()

  const computedColorScheme = useComputedColorScheme('light')
  const titleColor = computedColorScheme === 'dark' ? 'gray.1' : 'dark.8'

  const { habits, records } = apiRoute.useLoaderData()

  const recordsMap =
    records.data?.reduce(
      (acc, record) => {
        if (record.date === dayjs(selectedDate).format('YYYY-MM-DD')) {
          acc[record.habitId] = record
        }
        return acc
      },
      {} as Record<string, RecordEntity>,
    ) ?? {}

  const habitsWithRecords = pipe(
    habits.data ?? [],
    filter((habit) => {
      const filterValue = searchParams.habitFilter

      if (!filterValue || filterValue === 'all') {
        return true
      }

      if (filterValue === 'null') {
        return habit.priority === null
      }

      return habit.priority === filterValue
    }),
    (filteredHabits) =>
      filteredHabits.map((habit) => {
        const record = recordsMap[habit.id]

        return {
          habit,
          record,
          isCompleted: record?.status === 'completed',
        }
      }),
  )

  const habitsByStatus = pipe(
    habitsWithRecords,
    groupBy((h) => {
      if (!h.record) {
        return 'unscheduled'
      }

      return h.record.status
    }),
  )

  const scheduledHabits = habitsByStatus.active ?? []
  const completedHabits = habitsByStatus.completed ?? []
  const skippedHabits = habitsByStatus.skipped ?? []
  const unscheduledHabits = habitsByStatus.unscheduled ?? []

  const totalCompletedDuration = completedHabits.reduce((sum, { record }) => {
    return sum + (record?.duration_minutes ?? 0)
  }, 0)

  const formatDuration = (minutes: number) => {
    if (minutes === 0) {
      return '0分'
    }

    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours === 0) {
      return `${mins}分`
    }

    if (mins === 0) {
      return `${hours}時間（${minutes}分）`
    }

    return `${hours}時間${mins}分（${minutes}分）`
  }

  const totalCompletedDurationText = formatDuration(totalCompletedDuration)

  const formatDate = dayjs(selectedDate).format('YYYY年MM月DD日（dd）')

  const getFilterMessage = () => {
    const filterValue = searchParams.habitFilter

    if (!filterValue || filterValue === 'all') {
      return '習慣が登録されていません。習慣一覧ページから新しい習慣を追加してください。'
    }

    const filterLabels = {
      high: '高優先度',
      middle: '中優先度',
      low: '低優先度',
      null: '優先度なし',
    } as const satisfies Record<string, string>

    const filterLabel = filterLabels[filterValue as keyof typeof filterLabels] || filterValue

    return `${filterLabel}の習慣が見つかりませんでした。フィルターを「全て」に変更するか、該当する習慣を作成してください。`
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      return
    }

    const habitData = active.data.current

    if (!habitData) {
      return
    }

    const date = dayjs(selectedDate).format('YYYY-MM-DD')

    try {
      switch (over.id) {
        case DROPZONE_IDS.SCHEDULED:
          await scheduleHabit({ data: { habitId: habitData.habit.id, date } })
          break

        case DROPZONE_IDS.SKIPPED:
          await skipHabit({
            data: {
              habitId: habitData.habit.id,
              date,
            },
          })
          break

        case DROPZONE_IDS.UNSCHEDULED:
          await unscheduleHabit({ data: { habitId: habitData.habit.id, date } })
          break
      }

      // hashがある場合はクリアしてからinvalidate
      if (window.location.hash) {
        await router.navigate({
          to: '.',
          search: (prev) => prev,
          hash: undefined,
          replace: true,
          resetScroll: false,
        })
      }

      router.invalidate()
    } catch (error) {
      console.error('Failed to update habit status:', error)
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Stack gap="md">
        <Group gap="xs" align="center">
          <IconCheck size={24} color="var(--mantine-color-green-6)" />
          <Text size="lg" fw={600} c={titleColor}>
            {formatDate}の習慣状況
          </Text>
        </Group>

        {habitsWithRecords.length === 0 ? (
          <Alert
            icon={<IconAlertTriangle size={16} />}
            color="red"
            variant="light"
            radius="md"
            p="md"
            style={{
              backgroundColor: 'oklch(70.4% 0.191 22.216 / 0.08)',
              borderLeft: '4px solid oklch(70.4% 0.191 22.216)',
              '--alert-icon-margin': '8px',
            }}
          >
            <Text size="sm" c="dimmed" style={{ textAlign: 'left', lineHeight: 1.5 }}>
              {getFilterMessage()}
            </Text>
          </Alert>
        ) : (
          <>
            <DroppableZone id={DROPZONE_IDS.SCHEDULED}>
              <div>
                <Group gap="xs" align="center" mb="sm">
                  <IconCircleDashed size={18} color="var(--mantine-color-blue-6)" />
                  <Text size="md" fw={500} c="blue.6">
                    予定中 ({scheduledHabits.length})
                  </Text>
                </Group>

                {scheduledHabits.length > 0 ? (
                  <Stack gap="xs">
                    {scheduledHabits.map(({ habit, record, isCompleted }) => (
                      <DraggableHabitCard
                        key={habit.id}
                        habit={habit}
                        record={record}
                        isCompleted={isCompleted}
                      />
                    ))}
                  </Stack>
                ) : (
                  <Text size="sm" c="dimmed" fs="italic">
                    予定中の習慣がありません
                  </Text>
                )}
              </div>
            </DroppableZone>

            <Stack
              style={{
                disable: completedHabits.length === 0,
                cursor: completedHabits.length === 0 ? 'not-allowed' : 'auto',
              }}
            >
              <Group gap="xs" align="center" mb="sm" justify="space-between">
                <Group gap="xs" align="center">
                  <IconCheck size={18} color="var(--mantine-color-green-6)" />
                  <Text size="md" fw={500} c="green.6">
                    完了済み ({completedHabits.length})
                  </Text>
                </Group>
                {completedHabits.length > 0 && (
                  <Text size="sm" c="blue.6" fw={600}>
                    合計: {totalCompletedDurationText}
                  </Text>
                )}
              </Group>
              {completedHabits.length === 0 && (
                <Text size="xs" c="dimmed" mb="xs" fs="italic">
                  ※ 完了するには記録フォームから時間を入力してください
                </Text>
              )}

              {completedHabits.length > 0 ? (
                <Stack gap="xs">
                  {completedHabits.map(({ habit, record, isCompleted }) => (
                    <DraggableHabitCard
                      key={habit.id}
                      habit={habit}
                      record={record}
                      isCompleted={isCompleted}
                    />
                  ))}
                </Stack>
              ) : (
                <Text size="sm" c="dimmed" fs="italic">
                  完了した習慣がありません
                </Text>
              )}
            </Stack>

            <DroppableZone id={DROPZONE_IDS.SKIPPED}>
              <div>
                <Group gap="xs" align="center" mb="sm">
                  <IconPlayerSkipForward size={18} color="var(--mantine-color-orange-6)" />
                  <Text size="md" fw={500} c="orange.6">
                    スキップ ({skippedHabits.length})
                  </Text>
                </Group>

                {skippedHabits.length > 0 ? (
                  <Stack gap="xs">
                    {skippedHabits.map(({ habit, record, isCompleted }) => (
                      <DraggableHabitCard
                        key={habit.id}
                        habit={habit}
                        record={record}
                        isCompleted={isCompleted}
                      />
                    ))}
                  </Stack>
                ) : (
                  <Text size="sm" c="dimmed" fs="italic">
                    スキップした習慣がありません
                  </Text>
                )}
              </div>
            </DroppableZone>

            <DroppableZone id={DROPZONE_IDS.UNSCHEDULED}>
              <div>
                <Group gap="xs" align="center" mb="sm">
                  <IconAlertTriangle size={18} color="var(--mantine-color-gray-6)" />
                  <Text size="md" fw={500} c="gray.6">
                    未完了 ({unscheduledHabits.length})
                  </Text>
                </Group>

                {unscheduledHabits.length > 0 ? (
                  <Stack gap="xs">
                    {unscheduledHabits.map(({ habit, record, isCompleted }) => (
                      <DraggableHabitCard
                        key={habit.id}
                        habit={habit}
                        record={record}
                        isCompleted={isCompleted}
                      />
                    ))}
                  </Stack>
                ) : (
                  <Text size="sm" c="dimmed" fs="italic">
                    未予定の習慣がありません
                  </Text>
                )}
              </div>
            </DroppableZone>
          </>
        )}

        <HabitPriorityFilterPaper habitsWithRecords={habitsWithRecords} />
      </Stack>
    </DndContext>
  )
}

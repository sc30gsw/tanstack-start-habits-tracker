import { Group, Stack, Text, useComputedColorScheme } from '@mantine/core'
import { IconCheck, IconX } from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { filter, pipe } from 'remeda'
import type { HabitEntity, RecordEntity } from '~/features/habits/types/habit'
import { getValidatedDate } from '~/features/habits/types/schemas/search-params'
import { HabitPriorityFilterPaper } from '~/features/home/components/habit-priority-filter-paper'
import { DailyHabitCard } from './daily-habit-card'

type DailyHabitListProps = {
  habits: HabitEntity[]
  records: RecordEntity[]
}

export function DailyHabitList({ habits, records }: DailyHabitListProps) {
  const apiRoute = getRouteApi('/')
  const searchParams = apiRoute.useSearch()
  const selectedDate = getValidatedDate(searchParams.selectedDate)

  const computedColorScheme = useComputedColorScheme('light')
  const titleColor = computedColorScheme === 'dark' ? 'gray.1' : 'dark.8'

  // 選択された日付の記録をマップ化
  const recordsMap = records.reduce(
    (acc, record) => {
      if (record.date === dayjs(selectedDate).format('YYYY-MM-DD')) {
        acc[record.habitId] = record
      }
      return acc
    },
    {} as Record<string, RecordEntity>,
  )

  // 習慣と記録を結合し、優先度フィルタリングを適用
  const habitsWithRecords = pipe(
    habits,
    filter((habit) => {
      // 優先度フィルタリング
      const filterValue = searchParams.habitFilter

      // フィルター未設定、'all'、undefinedの場合はすべて表示
      if (!filterValue || filterValue === 'all') return true
      if (filterValue === 'null') return habit.priority === null
      return habit.priority === filterValue
    }),
    (filteredHabits) =>
      filteredHabits.map((habit) => {
        const record = recordsMap[habit.id]
        return {
          habit,
          record,
          isCompleted: record?.completed || false,
        }
      }),
  )

  const completedHabits = habitsWithRecords.filter((h) => h.isCompleted)
  const inCompletedHabits = habitsWithRecords.filter((h) => !h.isCompleted)

  const formatDate = dayjs(selectedDate).format('YYYY年MM月DD日（dd）')

  return (
    <Stack gap="md">
      <Group gap="xs" align="center">
        <IconCheck size={24} color="var(--mantine-color-green-6)" />
        <Text size="lg" fw={600} c={titleColor}>
          {formatDate}の習慣状況
        </Text>
      </Group>

      {/* 完了した習慣 */}
      <div>
        <Group gap="xs" align="center" mb="sm">
          <IconCheck size={18} color="var(--mantine-color-green-6)" />
          <Text size="md" fw={500} c="green.6">
            完了済み ({completedHabits.length})
          </Text>
        </Group>

        {completedHabits.length > 0 ? (
          <Stack gap="xs">
            {completedHabits.map(({ habit, record, isCompleted }) => (
              <DailyHabitCard
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
      </div>

      {/* 未完了の習慣 */}
      <div>
        <Group gap="xs" align="center" mb="sm">
          <IconX size={18} color="var(--mantine-color-gray-6)" />
          <Text size="md" fw={500} c="gray.6">
            未完了 ({inCompletedHabits.length})
          </Text>
        </Group>

        {inCompletedHabits.length > 0 ? (
          <Stack gap="xs">
            {inCompletedHabits.map(({ habit, record, isCompleted }) => (
              <DailyHabitCard
                key={habit.id}
                habit={habit}
                record={record}
                isCompleted={isCompleted}
              />
            ))}
          </Stack>
        ) : (
          <Text size="sm" c="dimmed" fs="italic">
            未完了の習慣がありません
          </Text>
        )}
      </div>

      {/* 統計情報 */}
      <HabitPriorityFilterPaper habitsWithRecords={habitsWithRecords} />
    </Stack>
  )
}

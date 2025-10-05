import { Card, Stack, Text } from '@mantine/core'
import { getRouteApi } from '@tanstack/react-router'
import { filter, pipe, sortBy } from 'remeda'
import type { HabitEntity } from '~/features/habits/types/habit'
import { HabitCard } from './habit-card'

export function HabitList({ habits }: Record<'habits', HabitEntity[]>) {
  const routeApi = getRouteApi('/habits/')
  const searchParams = routeApi.useSearch()

  if (habits.length === 0) {
    return (
      <Card withBorder>
        <Text c="dimmed" ta="center">
          まだ習慣が登録されていません
        </Text>
      </Card>
    )
  }

  const priorityOrder = { high: 0, middle: 1, low: 2, null: 3 } as const satisfies Record<
    string,
    number
  >

  // フィルタリングとソートのロジック
  const processedHabits = pipe(
    habits,
    // フィルタリング
    filter((habit) => {
      if (searchParams.habitFilter === 'all') {
        return true
      }

      if (searchParams.habitFilter === 'null') {
        return habit.priority === null
      }

      return habit.priority === searchParams.habitFilter
    }),
    // ソート
    (habits) =>
      searchParams.habitSort === 'priority'
        ? sortBy(habits, (habit) => priorityOrder[habit.priority ?? 'null'])
        : habits,
  )

  return (
    <Stack gap="sm">
      {processedHabits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </Stack>
  )
}

import { Alert, Card, Stack, Text } from '@mantine/core'
import { IconAlertTriangle } from '@tabler/icons-react'
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
      const filterValue = searchParams.habitFilter

      // フィルター未設定、'all'、undefinedの場合はすべて表示
      if (!filterValue || filterValue === 'all') return true
      if (filterValue === 'null') return habit.priority === null
      return habit.priority === filterValue
    }),
    // ソート
    (habits) =>
      searchParams.habitSort === 'priority'
        ? sortBy(habits, (habit) => priorityOrder[habit.priority ?? 'null'])
        : habits,
  )

  // フィルター結果が0件の場合の表示
  if (processedHabits.length === 0) {
    const getFilterMessage = () => {
      const filterValue = searchParams.habitFilter
      if (!filterValue || filterValue === 'all') {
        return '習慣が登録されていません。上の「新しい習慣を作成」ボタンから習慣を追加してください。'
      }

      const filterLabels = {
        high: '高優先度',
        middle: '中優先度',
        low: '低優先度',
        null: '優先度なし',
      } as const satisfies Record<string, string>

      const filterLabel = filterLabels[filterValue as keyof typeof filterLabels] || filterValue

      return `${filterLabel}の習慣が見つかりませんでした。フィルターを「全て」に変更するか、該当する優先度の習慣を作成してください。`
    }

    return (
      <Alert
        icon={<IconAlertTriangle size={20} />}
        color="orange"
        variant="filled"
        radius="lg"
        p="lg"
        style={{
          textAlign: 'center',
          background:
            'linear-gradient(45deg, var(--mantine-color-orange-6), var(--mantine-color-red-5))',
          border: '2px solid var(--mantine-color-orange-3)',
          boxShadow: '0 4px 12px rgba(253, 126, 20, 0.15)',
        }}
      >
        <Stack gap="sm">
          <Text size="md" fw={500} c="white">
            {getFilterMessage()}
          </Text>
        </Stack>
      </Alert>
    )
  }

  return (
    <Stack gap="sm">
      {processedHabits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </Stack>
  )
}

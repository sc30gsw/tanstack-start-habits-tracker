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

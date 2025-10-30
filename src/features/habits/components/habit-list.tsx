import { Alert, Stack, Text } from '@mantine/core'
import { IconAlertTriangle } from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'
import { HabitCard } from '~/features/habits/components/habit-card'

export function HabitList() {
  const routeApi = getRouteApi('/habits/')
  const searchParams = routeApi.useSearch()

  const { habits: habitsData } = routeApi.useLoaderData()
  const habits = habitsData.data ?? []

  if (habits.length === 0) {
    const getEmptyMessage = () => {
      const filterValue = searchParams.habitFilter
      const searchQuery = searchParams.q

      if (searchQuery && searchQuery.trim() !== '') {
        return `「${searchQuery}」に一致する習慣が見つかりませんでした。別のキーワードで検索するか、フィルターを変更してください。`
      }

      if (filterValue && filterValue !== 'all') {
        const filterLabels = {
          high: '高優先度',
          middle: '中優先度',
          low: '低優先度',
          null: '優先度なし',
        } as const satisfies Record<string, string>

        const filterLabel = filterLabels[filterValue as keyof typeof filterLabels] || filterValue

        return `${filterLabel}の習慣が見つかりませんでした。フィルターを「全て」に変更するか、該当する優先度の習慣を作成してください。`
      }

      return 'まだ習慣が登録されていません。上の「新しい習慣を作成」ボタンから習慣を追加してください。'
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
          {getEmptyMessage()}
        </Text>
      </Alert>
    )
  }

  return (
    <Stack gap="sm">
      {habits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </Stack>
  )
}

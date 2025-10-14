import { Alert, Container, Stack, Text, Title, useComputedColorScheme } from '@mantine/core'
import { IconAlertTriangle } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { db } from '~/db'
import { habitLevels } from '~/db/schema'
import { HabitDetail } from '~/features/habits/components/habit-detail'
import { habitDto } from '~/features/habits/server/habit-functions'
import { recordDto } from '~/features/habits/server/record-functions'
import { searchSchema } from '~/features/habits/types/schemas/search-params'
import { getDataFetchDateRange } from '~/features/habits/utils/completion-rate-utils'
import { calculateLevelInfo } from '~/features/habits/utils/habit-level-utils'

export const Route = createFileRoute('/habits/$habitId')({
  component: HabitDetailPage,
  validateSearch: searchSchema,
  beforeLoad: async ({ search }) => {
    return { search }
  },
  loader: async ({ params, context }) => {
    // ヒートマップ(今日から1年分) + カレンダーグリッド(42日分)の範囲を取得
    const { dateFrom, dateTo } = getDataFetchDateRange(context.search.currentMonth)

    const [habitResult, recordsResult, habitsResult, habitLevelData] = await Promise.all([
      habitDto.getHabitById({ data: { id: params.habitId } }),
      recordDto.getRecords({
        data: {
          habit_id: params.habitId,
          date_from: dateFrom,
          date_to: dateTo,
        },
      }),
      habitDto.getHabits(),
      db.query.habitLevels.findFirst({
        where: eq(habitLevels.habitId, params.habitId),
      }),
    ])

    const levelInfo =
      habitLevelData && recordsResult.success && recordsResult.data
        ? calculateLevelInfo(habitLevelData, recordsResult.data, context.search.selectedDate)
        : null

    return { habit: habitResult, records: recordsResult, habits: habitsResult, levelInfo }
  },
})

function HabitDetailPage() {
  const { habit } = Route.useLoaderData()
  const computedColorScheme = useComputedColorScheme('light')
  const titleColor = computedColorScheme === 'dark' ? 'gray.1' : 'dark.8'

  if (!habit.success || !habit.data) {
    return (
      <Container size="lg" py="xl">
        <Alert color="red" title="エラー" icon={<IconAlertTriangle stroke={2} />}>
          <Text c="red">{habit.error}</Text>
        </Alert>
      </Container>
    )
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="md">
        <Title order={1} c={titleColor}>
          {habit.data.name}
        </Title>
        <HabitDetail />
      </Stack>
    </Container>
  )
}

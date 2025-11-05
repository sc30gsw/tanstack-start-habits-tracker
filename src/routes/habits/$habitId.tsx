import {
  Alert,
  Container,
  Group,
  Select,
  Stack,
  Text,
  Title,
  Tooltip,
  useComputedColorScheme,
} from '@mantine/core'
import { IconAlertTriangle } from '@tabler/icons-react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
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
  loaderDeps: ({ search }) => {
    // calendarViewに応じて適切なページネーションパラメータを使用
    const pageParam =
      search.calendarView === 'month'
        ? search.currentMonth || dayjs().format('YYYY-MM')
        : search.selectedDate || dayjs().format('YYYY-MM-DD')

    return {
      calendarView: search.calendarView,
      pageParam,
    }
  },
  loader: async ({ params, context, deps }) => {
    // ヒートマップ(今日から1年分) + カレンダーグリッド(42日分)の範囲を取得
    // monthビューの場合はcurrentMonth、それ以外はselectedDateを基準にする
    const dateForRange =
      deps.calendarView === 'month' ? deps.pageParam : deps.pageParam

    const { dateFrom, dateTo } = getDataFetchDateRange(dateForRange)

    const [habitResult, recordsResult, habitsResult, habitLevelData] = await Promise.all([
      habitDto.getHabitById({ data: { id: params.habitId } }),
      recordDto.getRecords({
        data: {
          habit_id: params.habitId,
          date_from: dateFrom,
          date_to: dateTo,
        },
      }),
      habitDto.getHabits({
        data: {
          q: '',
          habitSort: 'all',
          habitFilter: 'all',
        },
      }),
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
  const { habit, habits } = Route.useLoaderData()

  const search = Route.useSearch()
  const navigate = useNavigate()

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

  const habitOptions =
    habits.success && habits.data
      ? habits.data.map((h) => ({
          value: h.id,
          label: h.name,
        }))
      : []

  return (
    <Container size="fluid" px="xl" py="xl">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={1} c={titleColor}>
            {habit.data.name}
          </Title>
          {habitOptions.length > 1 && (
            <Tooltip label="他の習慣に切り替え" withArrow>
              <Select
                placeholder="習慣を選択"
                data={habitOptions}
                value={habit.data.id}
                onChange={(value) => {
                  if (value) {
                    navigate({
                      to: '/habits/$habitId',
                      params: { habitId: value },
                      search: (prev) => ({
                        ...prev,
                        detailTab: search.detailTab,
                        levelTab: search.levelTab,
                        selectedDate: search.selectedDate,
                        calendarView: search.calendarView,
                        currentMonth: search.currentMonth,
                      }),
                    })
                  }
                }}
                searchable
                styles={{
                  input: {
                    minWidth: '200px',
                  },
                }}
                aria-label="習慣を切り替え"
              />
            </Tooltip>
          )}
        </Group>
        <HabitDetail />
      </Stack>
    </Container>
  )
}

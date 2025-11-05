import {
  Alert,
  Card,
  Container,
  Grid,
  Group,
  Select,
  Skeleton,
  Stack,
  Tabs,
  Text,
  Title,
  Tooltip,
  useComputedColorScheme,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconAlertTriangle, IconChartBar, IconDashboard } from '@tabler/icons-react'
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
  loaderDeps: ({ search }) => ({
    calendarView: search.calendarView || 'month',
    currentMonth: search.currentMonth,
    selectedDate: search.selectedDate,
  }),
  loader: async ({ params, context, deps }) => {
    // ヒートマップ(今日から1年分) + カレンダーグリッド(42日分)の範囲を取得
    const dateForRange =
      deps.calendarView === 'month'
        ? deps.currentMonth || dayjs().format('YYYY-MM')
        : deps.selectedDate || dayjs().format('YYYY-MM-DD')

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
  pendingComponent: () => {
    const isDesktop = useMediaQuery('(min-width: 768px)')

    const calendarSkeleton = (
      <Card withBorder padding="md" radius="md" shadow="sm">
        <Stack gap="sm">
          {/* Calendar Header */}
          <Group justify="space-between" align="center">
            <Skeleton height={24} width={120} />
            <Group gap="xs">
              <Skeleton height={32} width={80} />
              <Skeleton height={32} width={32} />
              <Skeleton height={32} width={32} />
            </Group>
          </Group>

          {/* Calendar Grid */}
          <Stack gap="xs">
            <Grid gutter="xs">
              {Array.from({ length: 7 }).map((_, i) => (
                <Grid.Col key={i} span={12 / 7}>
                  <Skeleton height={20} />
                </Grid.Col>
              ))}
            </Grid>
            <Grid gutter="xs">
              {Array.from({ length: 42 }).map((_, i) => (
                <Grid.Col key={i} span={12 / 7}>
                  <Skeleton height={100} />
                </Grid.Col>
              ))}
            </Grid>
          </Stack>
        </Stack>
      </Card>
    )

    const dateDetailSkeleton = (
      <Card withBorder padding="md" radius="md" shadow="sm">
        <Stack gap="md">
          <Skeleton height={20} width={150} />
          <Stack gap="xs">
            <Skeleton height={16} width="60%" />
            <Skeleton height={16} width="50%" />
            <Skeleton height={16} width="70%" />
          </Stack>
        </Stack>
      </Card>
    )

    const leftPanelContent = (
      <Stack gap="md">
        {calendarSkeleton}
        {dateDetailSkeleton}
      </Stack>
    )

    const dashboardContent = (
      <Stack gap="md">
        {/* HabitInfoCard Skeleton */}
        <Card withBorder padding="md" radius="md" shadow="sm">
          <Stack gap="md">
            <Group justify="space-between">
              <Skeleton height={20} width={100} />
              <Skeleton height={32} width={80} />
            </Group>
            <Grid gutter="md">
              {Array.from({ length: 4 }).map((_, i) => (
                <Grid.Col key={i} span={6}>
                  <Stack gap={4}>
                    <Skeleton height={14} width="80%" />
                    <Skeleton height={20} width="60%" />
                  </Stack>
                </Grid.Col>
              ))}
            </Grid>
          </Stack>
        </Card>

        {/* HabitLevelCard Skeleton */}
        <Card withBorder padding="md" radius="md" shadow="sm">
          <Stack gap="md">
            <Skeleton height={20} width={120} />
            <Skeleton height={100} />
            <Grid gutter="md">
              {Array.from({ length: 3 }).map((_, i) => (
                <Grid.Col key={i} span={4}>
                  <Stack gap={4}>
                    <Skeleton height={14} width="70%" />
                    <Skeleton height={18} width="50%" />
                  </Stack>
                </Grid.Col>
              ))}
            </Grid>
          </Stack>
        </Card>

        {/* HeatmapSection Skeleton */}
        <Card withBorder padding="md" radius="md" shadow="sm">
          <Stack gap="md">
            <Skeleton height={20} width={150} />
            <Skeleton height={200} />
          </Stack>
        </Card>
      </Stack>
    )

    const analyticsContent = (
      <Stack gap="md">
        {/* TimeUsagePieChart Skeleton */}
        <Card withBorder padding="lg" radius="md" shadow="sm">
          <Stack gap="md">
            <Skeleton height={20} width={200} />
            <Skeleton height={300} />
            <Grid gutter="md">
              {Array.from({ length: 3 }).map((_, i) => (
                <Grid.Col key={i} span={4}>
                  <Stack gap={4}>
                    <Skeleton height={16} width="80%" />
                    <Skeleton height={20} width="60%" />
                  </Stack>
                </Grid.Col>
              ))}
            </Grid>
          </Stack>
        </Card>

        {/* TrendsChart Skeleton */}
        <Card withBorder padding="lg" radius="md" shadow="sm">
          <Stack gap="md">
            <Skeleton height={20} width={180} />
            <Skeleton height={300} />
          </Stack>
        </Card>
      </Stack>
    )

    const rightPanelContent = (
      <Tabs value="dashboard" keepMounted={false}>
        <Tabs.List grow>
          <Tabs.Tab value="dashboard" leftSection={<IconDashboard size={16} />} disabled>
            ダッシュボード
          </Tabs.Tab>
          <Tabs.Tab value="analytics" leftSection={<IconChartBar size={16} />} disabled>
            分析
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="dashboard" pt="md">
          {dashboardContent}
        </Tabs.Panel>

        <Tabs.Panel value="analytics" pt="md">
          {analyticsContent}
        </Tabs.Panel>
      </Tabs>
    )

    return (
      <Container size="fluid" px="xl" py="xl">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Skeleton height={32} width={200} />
            <Skeleton height={36} width={200} />
          </Group>

          {isDesktop ? (
            <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '1rem' }}>
              <div>{leftPanelContent}</div>
              <div>{rightPanelContent}</div>
            </div>
          ) : (
            <Stack gap="md">
              {leftPanelContent}
              {rightPanelContent}
            </Stack>
          )}
        </Stack>
      </Container>
    )
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

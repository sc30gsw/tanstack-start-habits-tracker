import { OnboardingTour } from '@gfazioli/mantine-onboarding-tour'
import {
  Box,
  Button,
  Card,
  Center,
  Container,
  Grid,
  Group,
  SegmentedControl,
  Skeleton,
  Stack,
  Text,
  Title,
  useComputedColorScheme,
} from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { useMediaQuery } from '@mantine/hooks'
import '@gfazioli/mantine-onboarding-tour/styles.css'
import { IconCalendar, IconChartPie } from '@tabler/icons-react'
import { createFileRoute, Outlet, useMatches, useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { useMemo } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { z } from 'zod/v4'
import { DayView } from '~/features/habits/components/calendar/day-view'
import { HabitsListMonthView } from '~/features/habits/components/calendar/habits-list-month-view'
import { HabitsListWeekView } from '~/features/habits/components/calendar/habits-list-week-view'
import { TimeUsagePieChart } from '~/features/habits/components/chart/time-usage-pie-chart'
import { HabitCreateForm } from '~/features/habits/components/form/habit-create-form'
import { HabitList } from '~/features/habits/components/habit-list'
import { CALENDAR_VIEW_HASH_TARGET } from '~/features/habits/constants/hash-target-ids'
import { habitDto } from '~/features/habits/server/habit-functions'
import { recordDto } from '~/features/habits/server/record-functions'
import type { SearchParams } from '~/features/habits/types/schemas/search-params'
import { searchSchema } from '~/features/habits/types/schemas/search-params'
import {
  aggregateTimeByHabit,
  getCalendarDataRange,
  sortForListPage,
} from '~/features/habits/utils/pie-chart-utils'
import { HabitOrganizer } from '~/features/home/components/habit-organizer'
import { OnboardingTriggerButton } from '~/features/onboarding/components/onboarding-trigger-button'
import { STEPS } from '~/features/onboarding/constants/tour-steps'
import { useOnboardingTour } from '~/features/onboarding/hooks/use-onboarding-tour'
import { getDayPropsForJapaneseCalendar } from '~/utils/date-input-styles'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

export const Route = createFileRoute('/habits/')({
  component: HabitsPage,
  validateSearch: searchSchema
    .pick({
      habitSort: true,
      habitFilter: true,
      showRecordForm: true,
      calendarView: true,
      selectedDate: true,
      currentMonth: true,
      q: true,
    })
    .extend({
      showForm: z
        .boolean()
        .optional()
        .default(false)
        .catch(() => false),
    }),
  loaderDeps: ({ search }) => ({
    calendarView: search.calendarView || 'month',
    selectedDate: search.selectedDate,
    currentMonth: search.currentMonth,
    q: search.q,
    habitSort: search.habitSort,
    habitFilter: search.habitFilter,
  }),
  loader: async ({ deps }) => {
    const habitsResult = await habitDto.getHabits({
      data: {
        q: deps.q || '',
        habitSort: deps.habitSort || 'all',
        habitFilter: deps.habitFilter || 'all',
      },
    })

    const dataRange = getCalendarDataRange(deps.calendarView, deps.currentMonth, deps.selectedDate)

    const recordsResult = await recordDto.getRecords({
      data: {
        date_from: dataRange.from,
        date_to: dataRange.to,
      },
    })

    return {
      habits: habitsResult,
      records: recordsResult,
    }
  },
  pendingComponent: () => {
    const isDesktop = useMediaQuery('(min-width: 768px)')
    const computedColorScheme = useComputedColorScheme('light')
    const titleColor = computedColorScheme === 'dark' ? 'gray.1' : 'dark.8'

    const habitListSkeleton = (
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={1}>習慣一覧</Title>
          <Button color="habit" disabled>
            新しい習慣を作成
          </Button>
        </Group>

        {/* HabitOrganizer Skeleton */}
        <Card withBorder padding="md" radius="md">
          <Group gap="xs" mb="sm">
            <Skeleton height={20} width={20} />
            <Skeleton height={20} width={100} />
          </Group>
          <Group gap="xs">
            <Skeleton height={32} width={120} />
            <Skeleton height={32} width={100} />
          </Group>
        </Card>

        {/* HabitList Skeleton */}
        <Stack gap="md">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} withBorder padding="lg" radius="md" shadow="sm">
              <Group justify="space-between" wrap="nowrap">
                <Group gap="md" style={{ flex: 1 }}>
                  <Skeleton height={40} width={40} circle />
                  <Stack gap={4} style={{ flex: 1 }}>
                    <Skeleton height={20} width="60%" />
                    <Skeleton height={16} width="40%" />
                  </Stack>
                </Group>
                <Skeleton height={36} width={80} />
              </Group>
            </Card>
          ))}
        </Stack>
      </Stack>
    )

    const calendarSkeleton = (
      <Card withBorder padding="lg" radius="md" shadow="sm" id={CALENDAR_VIEW_HASH_TARGET}>
        <Stack gap="sm">
          <Group justify="space-between" align="center">
            <Group gap="xs" align="center">
              <IconCalendar size={24} color="var(--mantine-color-blue-6)" />
              <Text size="lg" fw={600} c={titleColor}>
                カレンダー
              </Text>
            </Group>
            <SegmentedControl
              size="xs"
              value="month"
              disabled
              data={[
                { label: '月', value: 'month' },
                { label: '週', value: 'week' },
                { label: '日', value: 'day' },
              ]}
            />
          </Group>

          {/* Calendar Grid Skeleton */}
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
                  <Skeleton height={80} />
                </Grid.Col>
              ))}
            </Grid>
          </Stack>
        </Stack>
      </Card>
    )

    const pieChartSkeleton = (
      <Stack gap="md">
        <Group gap="xs" align="center">
          <IconChartPie size={24} color="var(--mantine-color-blue-6)" />
          <Text size="lg" fw={600}>
            時間配分
          </Text>
        </Group>
        <Card withBorder padding="lg" radius="md" shadow="sm">
          <Stack gap="md">
            <Skeleton height={20} width="60%" />
            <Skeleton height={300} />
            <Grid gutter="md">
              {Array.from({ length: 3 }).map((_, i) => (
                <Grid.Col key={i} span={4}>
                  <Stack gap={4}>
                    <Skeleton height={16} width="80%" />
                    <Skeleton height={20} width="60%" />
                    <Skeleton height={14} width="90%" />
                  </Stack>
                </Grid.Col>
              ))}
            </Grid>
          </Stack>
        </Card>
      </Stack>
    )

    return (
      <Container size="fluid" px="xl" py="xl">
        {isDesktop ? (
          <PanelGroup direction="horizontal" autoSaveId="habits-list-layout">
            <Panel defaultSize={60} minSize={40} maxSize={75} style={{ paddingRight: 12 }}>
              {habitListSkeleton}
            </Panel>

            <PanelResizeHandle
              className="habits-list-resize-handle"
              style={{
                width: '2px',
                transition: 'background-color 0.2s ease',
                cursor: 'col-resize',
                position: 'relative',
              }}
            />

            <Panel minSize={25} style={{ paddingLeft: 12 }}>
              <Stack gap="lg">
                {calendarSkeleton}
                {pieChartSkeleton}
              </Stack>
            </Panel>
          </PanelGroup>
        ) : (
          <Grid gutter="lg">
            <Grid.Col span={12}>{habitListSkeleton}</Grid.Col>
            <Grid.Col span={12}>{calendarSkeleton}</Grid.Col>
            <Grid.Col span={12}>{pieChartSkeleton}</Grid.Col>
          </Grid>
        )}
      </Container>
    )
  },
})

function HabitsPage() {
  const { habits: habitsData, records: recordsData } = Route.useLoaderData()
  const navigate = useNavigate()
  const searchParams = Route.useSearch()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const { started, handlers } = useOnboardingTour()

  const matches = useMatches()
  const last = matches[matches.length - 1]
  const isList = last.routeId === '/habits/'

  const calendarView = searchParams.calendarView || 'month'
  const computedColorScheme = useComputedColorScheme('light')
  const titleColor = computedColorScheme === 'dark' ? 'gray.1' : 'dark.8'

  // DateInputの値を決定（selectedDateが最優先、なければcurrentMonth、なければ今日）
  const selectedDate = searchParams.selectedDate
    ? dayjs.tz(searchParams.selectedDate, 'Asia/Tokyo')
    : searchParams.currentMonth
      ? dayjs.tz(searchParams.currentMonth, 'Asia/Tokyo').startOf('month')
      : dayjs().tz('Asia/Tokyo')

  const dateInputValue = selectedDate.toDate()

  const startOfWeek = selectedDate.startOf('week')
  const weekDates = Array.from({ length: 7 }).map((_, i) => startOfWeek.add(i, 'day'))

  const selectedDateRecords = useMemo(() => {
    return (
      recordsData.data?.filter((record) => dayjs(record.date).isSame(selectedDate, 'day')) || []
    )
  }, [selectedDate, recordsData.data])

  const pieChartData = useMemo(() => {
    if (!habitsData.data || !recordsData.data) {
      return {
        data: [],
        totalDuration: 0,
        executionDays: 0,
        totalRecordCount: 0,
        maxDailyDuration: 0,
        maxDailyDate: undefined,
      }
    }

    const aggregated = aggregateTimeByHabit(
      recordsData.data,
      habitsData.data,
      searchParams.calendarView,
      searchParams.selectedDate,
      searchParams.currentMonth,
    )

    const sorted = sortForListPage(aggregated.data)

    return {
      data: sorted,
      totalDuration: aggregated.totalDuration,
      period: aggregated.period,
      dateRange: aggregated.dateRange,
      executionDays: aggregated.executionDays,
      totalRecordCount: aggregated.totalRecordCount,
      maxDailyDuration: aggregated.maxDailyDuration,
      maxDailyDate: aggregated.maxDailyDate,
    }
  }, [
    recordsData.data,
    habitsData.data,
    searchParams.calendarView,
    searchParams.selectedDate,
    searchParams.currentMonth,
  ])

  if (!isList) {
    return <Outlet />
  }

  const habitListContent = (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Group align="center" gap="md">
          <Title order={1}>習慣一覧</Title>
          <OnboardingTriggerButton variant="inline" onClick={handlers.onStart} />
        </Group>
        <Button
          color="habit"
          onClick={() =>
            navigate({ to: '.', search: { ...searchParams, showForm: !searchParams.showForm } })
          }
          data-onboarding-tour-id="create-habit"
        >
          {searchParams.showForm ? '作成フォームを閉じる' : '新しい習慣を作成'}
        </Button>
      </Group>

      {searchParams.showForm && (
        <HabitCreateForm
          onSuccess={() => navigate({ to: '.', search: { ...searchParams, showForm: false } })}
          onCancel={() => navigate({ to: '.', search: { ...searchParams, showForm: false } })}
        />
      )}

      <Box data-onboarding-tour-id="habit-organizer">
        <HabitOrganizer />
      </Box>

      <Box data-onboarding-tour-id="habit-card">
        {habitsData.success ? <HabitList /> : <Box>エラー: {habitsData.error}</Box>}
      </Box>
    </Stack>
  )

  const calendarContent = (
    <Card
      withBorder
      padding="lg"
      radius="md"
      shadow="sm"
      id={CALENDAR_VIEW_HASH_TARGET}
      data-onboarding-tour-id="calendar-view"
    >
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Group gap="xs" align="center">
            <IconCalendar size={24} color="var(--mantine-color-blue-6)" />
            <Text size="lg" fw={600} c={titleColor}>
              カレンダー
            </Text>
          </Group>
          <Center>
            <DateInput
              size="sm"
              value={dateInputValue}
              onChange={(date) => {
                if (date) {
                  const newDate = dayjs(date)
                  navigate({
                    to: '.',
                    search: (prev) => ({
                      ...prev,
                      selectedDate: newDate.format('YYYY-MM-DD'),
                      currentMonth: newDate.format('YYYY-MM'),
                    }),
                  })
                }
              }}
              valueFormat="YYYY年MM月DD日"
              placeholder="日付を選択"
              popoverProps={{ position: 'bottom', withinPortal: true }}
              getDayProps={getDayPropsForJapaneseCalendar}
            />
          </Center>
          <SegmentedControl
            size="xs"
            value={calendarView}
            onChange={(v) =>
              navigate({
                to: '.',
                search: (prev) => ({
                  ...prev,
                  calendarView: v as SearchParams['calendarView'],
                }),
              })
            }
            data={[
              { label: '月', value: 'month' },
              { label: '週', value: 'week' },
              { label: '日', value: 'day' },
            ]}
          />
        </Group>
        <Group>
          <Text size="xs" c="dimmed" ta="center">
            ※ カレンダーには完了済みの習慣のみ表示されます
          </Text>
        </Group>

        <div className="relative">
          <div
            className={`${calendarView === 'month' ? 'relative z-10' : 'invisible absolute inset-0 z-0'}`}
          >
            <HabitsListMonthView
              records={recordsData.data || []}
              selectedDate={searchParams.selectedDate}
              currentMonth={searchParams.currentMonth}
              navigate={(options) =>
                isDesktop
                  ? navigate(options)
                  : navigate({ ...options, hash: CALENDAR_VIEW_HASH_TARGET })
              }
            />
          </div>

          <div
            className={`${calendarView === 'week' ? 'relative z-10' : 'invisible absolute inset-0 z-0'}`}
          >
            <HabitsListWeekView
              weekDates={weekDates}
              records={recordsData.data || []}
              selectedDate={searchParams.selectedDate}
              navigate={(options) =>
                isDesktop
                  ? navigate(options)
                  : navigate({ ...options, hash: CALENDAR_VIEW_HASH_TARGET })
              }
            />
          </div>

          <div
            className={`${calendarView === 'day' ? 'relative z-10' : 'invisible absolute inset-0 z-0'}`}
          >
            <DayView
              selectedDateRecords={selectedDateRecords}
              selectedDate={searchParams.selectedDate}
              habits={habitsData.data || []}
              showHabitLink={true}
              navigate={(options) =>
                isDesktop
                  ? navigate(options)
                  : navigate({ ...options, hash: CALENDAR_VIEW_HASH_TARGET })
              }
            />
          </div>
        </div>
      </Stack>
    </Card>
  )

  const pieChartContent = (
    <Stack gap="md" data-onboarding-tour-id="time-usage-chart">
      <Group gap="xs" align="center">
        <IconChartPie size={24} color="var(--mantine-color-blue-6)" />
        <Text size="lg" fw={600}>
          時間配分
        </Text>
      </Group>
      <TimeUsagePieChart
        data={pieChartData.data}
        totalDuration={pieChartData.totalDuration}
        period={pieChartData.period}
        dateRange={pieChartData.dateRange}
        executionDays={pieChartData.executionDays}
        totalRecordCount={pieChartData.totalRecordCount}
        maxDailyDuration={pieChartData.maxDailyDuration}
        maxDailyDate={pieChartData.maxDailyDate}
      />
    </Stack>
  )

  return (
    <OnboardingTour
      tour={STEPS.HABITS}
      started={started}
      onOnboardingTourEnd={handlers.onEnd}
      onOnboardingTourClose={handlers.onClose}
    >
      <Container size="fluid" px="xl" py="xl">
        {isDesktop ? (
          <PanelGroup direction="horizontal" autoSaveId="habits-list-layout">
            <Panel defaultSize={60} minSize={40} maxSize={75} style={{ paddingRight: 12 }}>
              {habitListContent}
            </Panel>

            <Box data-onboarding-tour-id="panel-resize">
              <PanelResizeHandle
                className="habits-list-resize-handle"
                style={{
                  width: '2px',
                  transition: 'background-color 0.2s ease',
                  cursor: 'col-resize',
                  position: 'relative',
                }}
              />
            </Box>

            <Panel minSize={25} style={{ paddingLeft: 12 }}>
              <Stack gap="lg">
                {calendarContent}
                {pieChartContent}
              </Stack>
            </Panel>
          </PanelGroup>
        ) : (
          <Grid gutter="lg">
            <Grid.Col span={12}>{habitListContent}</Grid.Col>
            <Grid.Col span={12}>{calendarContent}</Grid.Col>
            <Grid.Col span={12}>{pieChartContent}</Grid.Col>
          </Grid>
        )}
      </Container>
      <OnboardingTriggerButton variant="floating" onClick={handlers.onStart} />
    </OnboardingTour>
  )
}

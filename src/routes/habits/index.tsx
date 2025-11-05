import {
  Button,
  Card,
  Container,
  Grid,
  Group,
  SegmentedControl,
  Stack,
  Text,
  Title,
  useComputedColorScheme,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
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
import { getValidatedDate, searchSchema } from '~/features/habits/types/schemas/search-params'
import {
  aggregateTimeByHabit,
  getPeriodDateRange,
  sortForListPage,
} from '~/features/habits/utils/pie-chart-utils'
import { HabitOrganizer } from '~/features/home/components/habit-organizer'

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
  loader: async ({ context }) => {
    const habitsResult = await habitDto.getHabits({
      data: {
        q: context.search.q || '',
        habitSort: context.search.habitSort || 'all',
        habitFilter: context.search.habitFilter || 'all',
      },
    })

    // calendarViewに応じた期間を取得
    // monthの場合はcurrentMonthを使用、それ以外はselectedDateを使用
    const dateForRange = context.search.calendarView === 'month' && context.search.currentMonth
      ? dayjs(context.search.currentMonth).format('YYYY-MM-DD')
      : context.search.selectedDate

    const dateRange = getPeriodDateRange(context.search.calendarView, dateForRange)

    const recordsResult = await recordDto.getRecords({
      data: {
        date_from: dateRange.from,
        date_to: dateRange.to,
      },
    })

    return {
      habits: habitsResult,
      records: recordsResult,
    }
  },
})

function HabitsPage() {
  const { habits: habitsData, records: recordsData } = Route.useLoaderData()
  const navigate = useNavigate()
  const searchParams = Route.useSearch()
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const matches = useMatches()
  const last = matches[matches.length - 1]
  const isList = last.routeId === '/habits/'

  const calendarView = searchParams.calendarView || 'month'
  const selectedDate = getValidatedDate(searchParams?.selectedDate)
  const computedColorScheme = useComputedColorScheme('light')
  const titleColor = computedColorScheme === 'dark' ? 'gray.1' : 'dark.8'

  const selectedDateRecords = useMemo(() => {
    if (!selectedDate) {
      return []
    }

    return (
      recordsData.data?.filter((record) => dayjs(record.date).isSame(dayjs(selectedDate), 'day')) ||
      []
    )
  }, [selectedDate, recordsData.data])

  const startOfWeek = selectedDate
    ? dayjs(selectedDate).tz('Asia/Tokyo').startOf('week')
    : dayjs().tz('Asia/Tokyo').startOf('week')
  const weekDates = Array.from({ length: 7 }).map((_, i) => startOfWeek.add(i, 'day'))

  const pieChartData = useMemo(() => {
    if (!habitsData.data || !recordsData.data) {
      return {
        data: [],
        totalDuration: 0,
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
    }
  }, [recordsData.data, habitsData.data, searchParams.calendarView, searchParams.selectedDate, searchParams.currentMonth])

  if (!isList) {
    return <Outlet />
  }

  const habitListContent = (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Title order={1}>習慣一覧</Title>
        <Button
          color="habit"
          onClick={() =>
            navigate({ to: '.', search: { ...searchParams, showForm: !searchParams.showForm } })
          }
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

      <HabitOrganizer />

      {habitsData.success ? <HabitList /> : <div>エラー: {habitsData.error}</div>}
    </Stack>
  )

  const calendarContent = (
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
    <Stack gap="md">
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
      />
    </Stack>
  )

  return (
    <Container size="fluid" px="xl" py="xl">
      {isDesktop ? (
        <PanelGroup direction="horizontal" autoSaveId="habits-list-layout">
          <Panel defaultSize={60} minSize={40} maxSize={75} style={{ paddingRight: 12 }}>
            {habitListContent}
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
  )
}

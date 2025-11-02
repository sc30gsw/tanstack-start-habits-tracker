import { Grid, Stack, Tabs } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconChartBar, IconDashboard } from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { CalendarView } from '~/features/habits/components/calendar/calendar-view'
import { DateDetail } from '~/features/habits/components/calendar/date-detail'
import { TimeUsagePieChart } from '~/features/habits/components/chart/time-usage-pie-chart'
import { TrendsChart } from '~/features/habits/components/chart/trends-chart'
import { HabitInfoCard } from '~/features/habits/components/habit-info-card'
import { HabitLevelCard } from '~/features/habits/components/habit-level-card'
import { HeatmapSection } from '~/features/habits/components/heatmap-section'
import type { RecordEntity } from '~/features/habits/types/habit'
import type { HabitColor } from '~/features/habits/types/schemas/habit-schemas'
import type { SearchParams } from '~/features/habits/types/schemas/search-params'
import { getValidatedDate } from '~/features/habits/types/schemas/search-params'
import { aggregateTimeByHabit, sortForDetailPage } from '~/features/habits/utils/pie-chart-utils'

export function HabitDetail() {
  const apiRoute = getRouteApi('/habits/$habitId')
  const { habit, records, habits } = apiRoute.useLoaderData()

  const searchParams = apiRoute.useSearch()
  const selectedDate = getValidatedDate(searchParams?.selectedDate)
  const calendarView = searchParams?.calendarView || 'month'
  const detailTab = searchParams?.detailTab || 'dashboard'
  const navigate = apiRoute.useNavigate()

  const pieChartData = useMemo(() => {
    if (!records.data || !habits.data || !habit.data) {
      return {
        data: [],
        totalDuration: 0,
        period: 'month' as const,
        dateRange: { from: '', to: '' },
      }
    }

    const aggregated = aggregateTimeByHabit(
      records.data,
      habits.data,
      calendarView,
      searchParams?.selectedDate,
    )

    const sorted = sortForDetailPage(aggregated.data, habit.data.id)

    return {
      data: sorted,
      totalDuration: aggregated.totalDuration,
      period: aggregated.period,
      dateRange: aggregated.dateRange,
    }
  }, [records.data, habits.data, habit.data, calendarView, searchParams?.selectedDate])

  const recordMap = records.data?.reduce<Record<string, RecordEntity>>((acc, r) => {
    acc[r.date] = r

    return acc
  }, {})

  const selectedDateRecord = selectedDate
    ? records.data?.find((record) => dayjs(record.date).isSame(dayjs(selectedDate), 'day'))
    : null

  const handleTabChange = (value: string | null) => {
    if (value && (value === 'dashboard' || value === 'analytics')) {
      navigate({
        search: (prev) => ({
          ...prev,
          detailTab: value as SearchParams['detailTab'],
        }),
      })
    }
  }

  const isDesktop = useMediaQuery('(min-width: 768px)')

  const leftPanelContent = (
    <Stack gap="md">
      {recordMap && (
        <CalendarView
          recordMap={recordMap}
          calendarView={calendarView}
          selectedDate={searchParams?.selectedDate}
          currentMonth={searchParams?.currentMonth}
          navigate={navigate}
          habits={habits.data || []}
        />
      )}
      <DateDetail
        selectedDateRecord={selectedDateRecord || null}
        habitId={habit.data?.id ?? ''}
        allRecords={records.data || []}
      />
    </Stack>
  )
  const rightPanelContent = (
    <Tabs value={detailTab} onChange={handleTabChange} variant="pills">
      <Tabs.List grow>
        <Tabs.Tab value="dashboard" leftSection={<IconDashboard size={16} />}>
          ダッシュボード
        </Tabs.Tab>
        <Tabs.Tab value="analytics" leftSection={<IconChartBar size={16} />}>
          分析
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="dashboard" pt="lg">
        <Stack gap="lg">
          <HabitInfoCard />
          <HabitLevelCard />
        </Stack>
      </Tabs.Panel>

      <Tabs.Panel value="analytics" pt="lg">
        <Stack gap="lg">
          {records.data && (
            <>
              <TimeUsagePieChart
                data={pieChartData.data}
                totalDuration={pieChartData.totalDuration}
                period={pieChartData.period}
                dateRange={pieChartData.dateRange}
                hideChart={true}
              />
              <TrendsChart records={records.data} habitColor={habit.data?.color as HabitColor} />
              <HeatmapSection records={records.data} habitColor={habit.data?.color as HabitColor} />
            </>
          )}
        </Stack>
      </Tabs.Panel>
    </Tabs>
  )

  return (
    <Stack gap="lg">
      {isDesktop ? (
        <PanelGroup direction="horizontal" autoSaveId="habit-detail-layout">
          <Panel defaultSize={33} minSize={20} maxSize={50} style={{ paddingRight: 12 }}>
            {leftPanelContent}
          </Panel>

          <PanelResizeHandle
            className="habit-detail-resize-handle"
            style={{
              width: '2px',
              transition: 'background-color 0.2s ease',
              cursor: 'col-resize',
              position: 'relative',
            }}
          />

          <Panel
            minSize={50}
            style={{
              paddingLeft: 12,
            }}
          >
            {rightPanelContent}
          </Panel>
        </PanelGroup>
      ) : (
        <Grid gutter="lg">
          <Grid.Col span={12}>{leftPanelContent}</Grid.Col>
          <Grid.Col span={12}>{rightPanelContent}</Grid.Col>
        </Grid>
      )}
    </Stack>
  )
}

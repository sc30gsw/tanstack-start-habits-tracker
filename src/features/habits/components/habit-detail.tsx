import { Grid, Stack, Tabs } from '@mantine/core'
import { IconChartBar, IconDashboard } from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { CalendarView } from '~/features/habits/components/calendar/calendar-view'
import { DateDetail } from '~/features/habits/components/calendar/date-detail'
import { TrendsChart } from '~/features/habits/components/chart/trends-chart'
import { HabitInfoCard } from '~/features/habits/components/habit-info-card'
import { HabitLevelCard } from '~/features/habits/components/habit-level-card'
import { HeatmapSection } from '~/features/habits/components/heatmap-section'
import type { RecordEntity } from '~/features/habits/types/habit'
import type { HabitColor } from '~/features/habits/types/schemas/habit-schemas'
import type { SearchParams } from '~/features/habits/types/schemas/search-params'
import { getValidatedDate } from '~/features/habits/types/schemas/search-params'

export function HabitDetail() {
  const apiRoute = getRouteApi('/habits/$habitId')
  const { habit, records } = apiRoute.useLoaderData()

  const searchParams = apiRoute.useSearch()
  const selectedDate = getValidatedDate(searchParams?.selectedDate)
  const detailTab = searchParams?.detailTab || 'dashboard'
  const navigate = apiRoute.useNavigate()

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

  return (
    <Stack gap="lg">
      <Grid gutter="md">
        {/* 左サイドバー: カレンダー＋記録フォーム */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md">
            {recordMap && (
              <CalendarView selectedDateRecord={selectedDateRecord || null} recordMap={recordMap} />
            )}
            <DateDetail
              selectedDateRecord={selectedDateRecord || null}
              habitId={habit.data?.id ?? ''}
            />
          </Stack>
        </Grid.Col>

        {/* 右メインエリア: タブコンテンツ */}
        <Grid.Col span={{ base: 12, md: 8 }}>
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
                    <TrendsChart
                      records={records.data}
                      habitColor={habit.data?.color as HabitColor}
                    />
                    <HeatmapSection
                      records={records.data}
                      habitColor={habit.data?.color as HabitColor}
                    />
                  </>
                )}
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Grid.Col>
      </Grid>
    </Stack>
  )
}

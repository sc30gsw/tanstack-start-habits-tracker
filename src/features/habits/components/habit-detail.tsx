import { Grid, Stack, Tabs } from '@mantine/core'
import { IconCalendarStats, IconDashboard, IconFlame } from '@tabler/icons-react'
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
    if (value && (value === 'dashboard' || value === 'records' || value === 'heatmap')) {
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
      <Tabs value={detailTab} onChange={handleTabChange} variant="pills">
        <Grid gutter="xs">
          <Grid.Col span={{ base: 4, xs: 4 }}>
            <Tabs.Tab
              value="dashboard"
              leftSection={<IconDashboard size={16} />}
              style={{ width: '100%' }}
            >
              ダッシュボード
            </Tabs.Tab>
          </Grid.Col>
          <Grid.Col span={{ base: 4, xs: 4 }}>
            <Tabs.Tab
              value="records"
              leftSection={<IconCalendarStats size={16} />}
              style={{ width: '100%' }}
            >
              記録
            </Tabs.Tab>
          </Grid.Col>
          <Grid.Col span={{ base: 4, xs: 4 }}>
            <Tabs.Tab
              value="heatmap"
              leftSection={<IconFlame size={16} />}
              style={{ width: '100%' }}
            >
              年間記録
            </Tabs.Tab>
          </Grid.Col>
        </Grid>

        <Tabs.Panel value="dashboard" pt="lg">
          <Stack gap="lg">
            <HabitInfoCard />
            <HabitLevelCard />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="records" pt="lg">
          <Stack gap="lg">
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                {recordMap && (
                  <CalendarView
                    selectedDateRecord={selectedDateRecord || null}
                    recordMap={recordMap}
                  />
                )}
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <DateDetail
                  selectedDateRecord={selectedDateRecord || null}
                  habitId={habit.data?.id ?? ''}
                />
              </Grid.Col>
            </Grid>

            {records.data && (
              <TrendsChart records={records.data} habitColor={habit.data?.color as HabitColor} />
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="heatmap" pt="lg">
          {records.data && (
            <HeatmapSection records={records.data} habitColor={habit.data?.color as HabitColor} />
          )}
        </Tabs.Panel>
      </Tabs>
    </Stack>
  )
}

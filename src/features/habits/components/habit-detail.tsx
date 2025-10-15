import { Grid, Stack } from '@mantine/core'
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
import { getValidatedDate } from '~/features/habits/types/schemas/search-params'

export function HabitDetail() {
  const apiRoute = getRouteApi('/habits/$habitId')
  const { habit, records } = apiRoute.useLoaderData()

  const searchParams = apiRoute.useSearch()
  const selectedDate = getValidatedDate(searchParams?.selectedDate)

  const recordMap = records.data?.reduce<Record<string, RecordEntity>>((acc, r) => {
    acc[r.date] = r
    return acc
  }, {})

  const selectedDateRecord = selectedDate
    ? records.data?.find((record) => dayjs(record.date).isSame(dayjs(selectedDate), 'day'))
    : null

  return (
    <Stack gap="lg">
      <HabitInfoCard />

      <HabitLevelCard />

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          {recordMap && (
            <CalendarView selectedDateRecord={selectedDateRecord || null} recordMap={recordMap} />
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

      {records.data && (
        <HeatmapSection records={records.data} habitColor={habit.data?.color as HabitColor} />
      )}
    </Stack>
  )
}

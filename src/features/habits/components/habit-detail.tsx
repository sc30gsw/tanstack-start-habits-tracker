import { Grid, Stack } from '@mantine/core'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { CalendarView } from '~/features/habits/components/calendar/calendar-view'
import { DateDetail } from '~/features/habits/components/calendar/date-detail'
import { TrendsChart } from '~/features/habits/components/chart/trends-chart'
import { HabitInfoCard } from '~/features/habits/components/habit-info-card'
import { HeatmapSection } from '~/features/habits/components/heatmap-section'
import type { RecordEntity } from '~/features/habits/types/habit'
import type { HabitColor } from '~/features/habits/types/schemas/habit-schemas'
import { getValidatedDate } from '~/features/habits/types/schemas/search-params'

export function HabitDetail() {
  const apiRoute = getRouteApi('/habits/$habitId')
  const { habit, records } = apiRoute.useLoaderData()

  const searchParams = apiRoute.useSearch()

  // URLパラメータから安全に初期値を取得
  const selectedDate = getValidatedDate(searchParams?.selectedDate)

  // 日付 -> record 集計マップ
  const recordMap = records.data?.reduce<Record<string, RecordEntity>>((acc, r) => {
    acc[r.date] = r
    return acc
  }, {})

  // 選択された日付の記録を取得
  const selectedDateRecord = selectedDate
    ? records.data?.find((record) => dayjs(record.date).isSame(dayjs(selectedDate), 'day'))
    : null

  return (
    <Stack gap="lg">
      {/* 習慣情報カード */}
      <HabitInfoCard />

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          {recordMap && (
            <CalendarView selectedDateRecord={selectedDateRecord || null} recordMap={recordMap} />
          )}
        </Grid.Col>

        {/* 選択された日付の詳細 */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <DateDetail
            selectedDateRecord={selectedDateRecord || null}
            habitId={habit.data?.id ?? ''}
          />
        </Grid.Col>
      </Grid>

      {/* トレンドチャート */}
      {records.data && (
        <TrendsChart records={records.data} habitColor={habit.data?.color as HabitColor} />
      )}

      {/* ヒートマップ */}
      {records.data && (
        <HeatmapSection records={records.data} habitColor={habit.data?.color as HabitColor} />
      )}
    </Stack>
  )
}

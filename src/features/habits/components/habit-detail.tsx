import { Grid, Stack } from '@mantine/core'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { CalendarView } from '~/features/habits/components/calendar/calendar-view'
import { DateDetail } from '~/features/habits/components/calendar/date-detail'
import { TrendsChart } from '~/features/habits/components/chart/trends-chart'
import { HabitInfoCard } from '~/features/habits/components/habit-info-card'
import { HeatmapSection } from '~/features/habits/components/heatmap-section'
import type { HabitEntity, RecordEntity } from '~/features/habits/types/habit'
import type { HabitColor } from '~/features/habits/types/schemas/habit-schemas'
import { getValidatedDate } from '~/features/habits/types/schemas/search-params'

type HabitDetailProps = {
  habit: HabitEntity
  records: RecordEntity[]
  habitsList?: HabitEntity[]
}

export function HabitDetail({ habit, records, habitsList = [] }: HabitDetailProps) {
  const apiRoute = getRouteApi('/habits/$habitId')
  const searchParams = apiRoute.useSearch()

  // URLパラメータから安全に初期値を取得
  const selectedDate = getValidatedDate(searchParams?.selectedDate)

  // 日付 -> record 集計マップ
  const recordMap = records.reduce<Record<string, RecordEntity>>((acc, r) => {
    acc[r.date] = r
    return acc
  }, {})

  // 選択された日付の記録を取得
  const selectedDateRecord = selectedDate
    ? records.find((record) => dayjs(record.date).isSame(dayjs(selectedDate), 'day'))
    : null

  return (
    <Stack gap="lg">
      {/* 習慣情報カード */}
      <HabitInfoCard habit={habit} records={records} habitsList={habitsList} />

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <CalendarView selectedDateRecord={selectedDateRecord || null} recordMap={recordMap} />
        </Grid.Col>

        {/* 選択された日付の詳細 */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <DateDetail selectedDateRecord={selectedDateRecord || null} habitId={habit.id} />
        </Grid.Col>
      </Grid>

      {/* トレンドチャート */}
      <TrendsChart records={records} habitColor={habit.color as HabitColor} />

      {/* ヒートマップ */}
      <HeatmapSection records={records} habitColor={habit.color as HabitColor} />
    </Stack>
  )
}

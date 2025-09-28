import { Grid, Stack } from '@mantine/core'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { CalendarView } from '~/features/habits/components/calendar/calendar-view'
import { DateDetail } from '~/features/habits/components/calendar/date-detail'
import { TrendsChart } from '~/features/habits/components/chart/trends-chart'
import { HabitInfoCard } from '~/features/habits/components/habit-info-card'
import { HeatmapSection } from '~/features/habits/components/heatmap-section'
import type { HabitEntity, RecordEntity } from '~/features/habits/types/habit'
import type { HabitColor } from '~/features/habits/types/schemas/habit-schemas'
import {
  formatDateForUrl,
  getDefaultSearchParams,
  getValidatedDate,
  type SearchParams,
} from '~/features/habits/types/schemas/search-params'

type HabitDetailProps = {
  habit: HabitEntity
  records: RecordEntity[]
  habitsList?: HabitEntity[]
}

export function HabitDetail({ habit, records, habitsList = [] }: HabitDetailProps) {
  const apiRoute = getRouteApi('/habits/$habitId')
  const searchParams = apiRoute.useSearch()
  const navigate = apiRoute.useNavigate()

  // デフォルト値を取得
  const defaultParams = getDefaultSearchParams()

  // URLパラメータから安全に初期値を取得
  const selectedDate = getValidatedDate(searchParams?.selectedDate)
  const calendarView = searchParams?.calendarView || defaultParams.calendarView
  const metric = searchParams?.metric || defaultParams.metric

  const [showRecordForm, setShowRecordForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState<RecordEntity | null>(null)
  const [currentMonth, setCurrentMonth] = useState(dayjs(selectedDate).startOf('month'))

  // URLパラメータを更新する関数
  const updateSearchParams = (updates: Partial<SearchParams>) => {
    const newParams = {
      selectedDate: selectedDate ? formatDateForUrl(selectedDate) : undefined,
      calendarView,
      metric,
      ...updates,
    } as const satisfies SearchParams

    // SearchParams型を使って適切なオブジェクトを作成
    const searchObject: SearchParams = {
      selectedDate: newParams.selectedDate,
    }

    // 各フィールドを条件付きで追加（undefinedを除外）
    if (newParams.calendarView) {
      searchObject.calendarView = newParams.calendarView
    }
    if (newParams.metric) {
      searchObject.metric = newParams.metric
    }

    navigate({
      search: searchObject,
      replace: true,
    })
  }

  // 日付が変更されたときにフォームの状態をリセットし、URLを更新
  useEffect(() => {
    setShowRecordForm(false)
    setEditingRecord(null)
  }, [selectedDate])

  // selectedDate変更時にURLパラメータを更新
  const handleSelectedDateChange = (date: Date) => {
    updateSearchParams({ selectedDate: formatDateForUrl(date) })
  }

  // calendarView変更時にURLパラメータを更新
  const handleCalendarViewChange = (view: 'month' | 'week' | 'day') => {
    updateSearchParams({ calendarView: view })
  }

  // metric変更時にURLパラメータを更新
  const handleMetricChange = (newMetric: 'duration' | 'completion') => {
    updateSearchParams({ metric: newMetric })
  }

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
          <CalendarView
            onCalendarViewChange={handleCalendarViewChange}
            currentMonth={currentMonth}
            onCurrentMonthChange={setCurrentMonth}
            onSelectedDateChange={handleSelectedDateChange}
            selectedDateRecord={selectedDateRecord || null}
            recordMap={recordMap}
          />
        </Grid.Col>

        {/* 選択された日付の詳細 */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <DateDetail
            selectedDateRecord={selectedDateRecord || null}
            habitId={habit.id}
            showRecordForm={showRecordForm}
            editingRecord={editingRecord}
            onShowRecordForm={setShowRecordForm}
            onEditingRecord={setEditingRecord}
          />
        </Grid.Col>
      </Grid>

      {/* トレンドチャート */}
      <TrendsChart
        records={records}
        currentMonth={currentMonth}
        habitColor={habit.color as HabitColor}
      />

      {/* ヒートマップ */}
      <HeatmapSection
        records={records}
        onMetricChange={handleMetricChange}
        onSelectDate={handleSelectedDateChange}
        habitColor={habit.color as HabitColor}
      />
    </Stack>
  )
}

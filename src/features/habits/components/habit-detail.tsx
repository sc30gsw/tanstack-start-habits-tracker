import { Grid, Stack } from '@mantine/core'
import { useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { CalendarView } from '~/features/habits/components/calendar-view'
import { DateDetail } from '~/features/habits/components/date-detail'
import { HabitInfoCard } from '~/features/habits/components/habit-info-card'
import { HeatmapSection } from '~/features/habits/components/heatmap-section'
import type { HabitEntity, RecordEntity } from '~/features/habits/types/habit'

type SearchParams = {
  selectedDate?: string
  calendarView?: 'month' | 'week' | 'day'
  metric?: 'duration' | 'completion'
}

type HabitDetailProps = {
  habit: HabitEntity
  records: RecordEntity[]
  habitsList?: HabitEntity[]
  searchParams?: SearchParams
}

export function HabitDetail({ habit, records, habitsList = [], searchParams }: HabitDetailProps) {
  const navigate = useNavigate()

  // URLパラメータから初期値を取得
  const initialSelectedDate = searchParams?.selectedDate
    ? dayjs(searchParams.selectedDate).toDate()
    : new Date()
  const initialCalendarView = searchParams?.calendarView || 'month'
  const initialMetric = searchParams?.metric || 'duration'

  const [selectedDate, setSelectedDate] = useState<Date | null>(initialSelectedDate)
  const [showRecordForm, setShowRecordForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState<RecordEntity | null>(null)
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>(initialCalendarView)
  const [currentMonth, setCurrentMonth] = useState(dayjs(initialSelectedDate).startOf('month'))
  const [metric, setMetric] = useState<'duration' | 'completion'>(initialMetric)

  // URLパラメータを更新する関数
  const updateSearchParams = (updates: Partial<SearchParams>) => {
    const newParams = {
      selectedDate: selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : undefined,
      calendarView,
      metric,
      ...updates,
    }

    // undefinedの値を除去
    const cleanParams = Object.fromEntries(
      Object.entries(newParams).filter(([_, value]) => value !== undefined),
    )

    navigate({
      search: cleanParams as any,
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
    setSelectedDate(date)
    updateSearchParams({ selectedDate: dayjs(date).format('YYYY-MM-DD') })
  }

  // calendarView変更時にURLパラメータを更新
  const handleCalendarViewChange = (view: 'month' | 'week' | 'day') => {
    setCalendarView(view)
    updateSearchParams({ calendarView: view })
  }

  // metric変更時にURLパラメータを更新
  const handleMetricChange = (newMetric: 'duration' | 'completion') => {
    setMetric(newMetric)
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
            calendarView={calendarView}
            onCalendarViewChange={handleCalendarViewChange}
            currentMonth={currentMonth}
            onCurrentMonthChange={setCurrentMonth}
            selectedDate={selectedDate}
            onSelectedDateChange={handleSelectedDateChange}
            selectedDateRecord={selectedDateRecord || null}
            recordMap={recordMap}
          />
        </Grid.Col>

        {/* 選択された日付の詳細 */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <DateDetail
            selectedDate={selectedDate}
            selectedDateRecord={selectedDateRecord || null}
            habitId={habit.id}
            showRecordForm={showRecordForm}
            editingRecord={editingRecord}
            onShowRecordForm={setShowRecordForm}
            onEditingRecord={setEditingRecord}
          />
        </Grid.Col>
      </Grid>

      {/* ヒートマップ */}
      <HeatmapSection
        records={records}
        selectedDate={selectedDate}
        metric={metric}
        onMetricChange={handleMetricChange}
        onSelectDate={handleSelectedDateChange}
      />
    </Stack>
  )
}

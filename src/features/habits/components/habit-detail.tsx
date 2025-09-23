import { Grid, Stack } from '@mantine/core'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { CalendarView } from '~/features/habits/components/calendar-view'
import { DateDetail } from '~/features/habits/components/date-detail'
import { HabitInfoCard } from '~/features/habits/components/habit-info-card'
import { HeatmapSection } from '~/features/habits/components/heatmap-section'
import type { HabitEntity, RecordEntity } from '~/features/habits/types/habit'

type HabitDetailProps = {
  habit: HabitEntity
  records: RecordEntity[]
  habitsList?: HabitEntity[]
}

export function HabitDetail({ habit, records, habitsList = [] }: HabitDetailProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [showRecordForm, setShowRecordForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState<RecordEntity | null>(null)
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month')
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'))
  const [metric, setMetric] = useState<'duration' | 'completion'>('duration')

  // 日付が変更されたときにフォームの状態をリセット
  useEffect(() => {
    setShowRecordForm(false)
    setEditingRecord(null)
  }, [selectedDate])

  // 日付 -> record 集計マップ
  const recordMap = records.reduce<Record<string, RecordEntity>>((acc, r) => {
    acc[r.date] = r
    return acc
  }, {})

  // 選択された日付の記録を取得
  const selectedDateRecord = selectedDate
    ? records.find((record) => dayjs(record.date).isSame(dayjs(selectedDate), 'day'))
    : null

  const handleSuccess = () => {
    // 成功時の処理（必要に応じて追加）
  }

  return (
    <Stack gap="lg">
      {/* 習慣情報カード */}
      <HabitInfoCard habit={habit} records={records} habitsList={habitsList} />

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <CalendarView
            calendarView={calendarView}
            onCalendarViewChange={setCalendarView}
            currentMonth={currentMonth}
            onCurrentMonthChange={setCurrentMonth}
            selectedDate={selectedDate}
            onSelectedDateChange={setSelectedDate}
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
            onSuccess={handleSuccess}
          />
        </Grid.Col>
      </Grid>

      {/* ヒートマップ */}
      <HeatmapSection
        records={records}
        selectedDate={selectedDate}
        metric={metric}
        onMetricChange={setMetric}
        onSelectDate={setSelectedDate}
      />
    </Stack>
  )
}

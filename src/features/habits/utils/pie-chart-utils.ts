import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import type { InferSelectModel } from 'drizzle-orm'
import { indexBy, pipe } from 'remeda'
import type { habits } from '~/db/schema'
import type { HabitEntity, RecordEntity } from '~/features/habits/types/habit'
import type { SearchParams } from '~/features/habits/types/schemas/search-params'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

export type PieChartDataItem = {
  name: InferSelectModel<typeof habits>['name']
  value: number
  color: string
  habitId: InferSelectModel<typeof habits>['id']
}

export type PieChartData = {
  data: PieChartDataItem[]
  totalDuration: number
  period: SearchParams['calendarView']
  dateRange: Record<'from' | 'to', string>
  executionDays: number
  totalRecordCount: number
}

const PIE_CHART_SUPPORTED_COLORS = [
  'blue',
  'teal',
  'cyan',
  'pink',
  'red',
  'orange',
  'yellow',
  'grape',
  'violet',
  'indigo',
  'lime',
  'green',
  'gray',
] as const satisfies readonly string[]

const COLOR_MAPPING = {
  purple: 'violet',
  dark: 'gray',
} as const satisfies Record<string, string>

function mapToPieChartColor(habitColor: string | null | undefined) {
  if (!habitColor) {
    return 'gray'
  }

  if (COLOR_MAPPING[habitColor as keyof typeof COLOR_MAPPING]) {
    return COLOR_MAPPING[habitColor as keyof typeof COLOR_MAPPING]
  }

  if (
    PIE_CHART_SUPPORTED_COLORS.includes(habitColor as (typeof PIE_CHART_SUPPORTED_COLORS)[number])
  ) {
    return habitColor
  }

  return 'gray'
}

// カレンダー表示用のデータ範囲を取得（グリッド全体をカバー）
export function getCalendarDataRange(
  calendarView: SearchParams['calendarView'] = 'month',
  currentMonth?: SearchParams['currentMonth'],
  selectedDate?: SearchParams['selectedDate'],
) {
  switch (calendarView) {
    case 'month': {
      // 月ビュー: 42マス分（前月末日〜翌月初日を含む）
      const baseDate = currentMonth
        ? dayjs.tz(currentMonth, 'Asia/Tokyo')
        : selectedDate
          ? dayjs.tz(selectedDate, 'Asia/Tokyo')
          : dayjs().tz('Asia/Tokyo')

      const monthStart = baseDate.startOf('month')
      const leadingDays = monthStart.day() // 月初の曜日（0=日曜）

      return {
        from: monthStart.subtract(leadingDays, 'day').format('YYYY-MM-DD'),
        to: monthStart.add(41 - leadingDays, 'day').format('YYYY-MM-DD'),
      }
    }

    case 'week': {
      // 週ビュー: 7日分（日曜〜土曜）
      const baseDate = selectedDate
        ? dayjs.tz(selectedDate, 'Asia/Tokyo')
        : dayjs().tz('Asia/Tokyo')

      return {
        from: baseDate.startOf('week').format('YYYY-MM-DD'),
        to: baseDate.endOf('week').format('YYYY-MM-DD'),
      }
    }

    case 'day': {
      // 日ビュー: 1日分
      const baseDate = selectedDate
        ? dayjs.tz(selectedDate, 'Asia/Tokyo')
        : dayjs().tz('Asia/Tokyo')

      return {
        from: baseDate.format('YYYY-MM-DD'),
        to: baseDate.format('YYYY-MM-DD'),
      }
    }
  }
}

export function getPeriodDateRange(
  calendarView: SearchParams['calendarView'] = 'month',
  currentMonth?: SearchParams['currentMonth'],
  selectedDate?: SearchParams['selectedDate'],
) {
  // monthの場合はcurrentMonthを優先、それ以外はselectedDateを使用
  const baseDate =
    calendarView === 'month' && currentMonth
      ? dayjs.tz(currentMonth, 'Asia/Tokyo')
      : selectedDate
        ? dayjs.tz(selectedDate, 'Asia/Tokyo')
        : dayjs().tz('Asia/Tokyo')

  switch (calendarView) {
    case 'month':
      return {
        from: baseDate.startOf('month').format('YYYY-MM-DD'),
        to: baseDate.endOf('month').format('YYYY-MM-DD'),
      }

    case 'week':
      return {
        from: baseDate.startOf('week').format('YYYY-MM-DD'),
        to: baseDate.endOf('week').format('YYYY-MM-DD'),
      }

    case 'day':
      return {
        from: baseDate.format('YYYY-MM-DD'),
        to: baseDate.format('YYYY-MM-DD'),
      }
  }
}

export function aggregateTimeByHabit(
  records: RecordEntity[],
  habits: HabitEntity[],
  calendarView: SearchParams['calendarView'] = 'month',
  selectedDate?: string,
  currentMonth?: string,
) {
  const dateRange = getPeriodDateRange(calendarView, currentMonth, selectedDate)

  const filteredRecords = records.filter(
    (record) =>
      record.status === 'completed' &&
      record.duration_minutes &&
      record.duration_minutes > 0 &&
      record.date >= dateRange.from &&
      record.date <= dateRange.to,
  )

  const habitMap = pipe(
    habits,
    indexBy((habit) => habit.id),
  )

  const durationMap = filteredRecords.reduce((acc, record) => {
    const existing = acc.get(record.habitId)
    const durationMinutes = record.duration_minutes ?? 0

    acc.set(record.habitId, (existing || 0) + durationMinutes)

    return acc
  }, new Map<string, number>())

  const data = Array.from(durationMap.entries()).map(([habitId, duration]) => {
    const habit = habitMap[habitId]
    const mappedColor = mapToPieChartColor(habit?.color)
    return {
      name: habit?.name || 'Unknown',
      value: duration,
      color: `${mappedColor}.6`,
      habitId,
    }
  })

  const totalDuration = data.reduce((sum: number, item: PieChartDataItem) => sum + item.value, 0)

  const uniqueDates = new Set(filteredRecords.map((record) => record.date))
  const executionDays = uniqueDates.size

  const totalRecordCount = filteredRecords.length

  return {
    data,
    totalDuration,
    period: calendarView,
    dateRange,
    executionDays,
    totalRecordCount,
  }
}

export function sortForDetailPage(data: PieChartDataItem[], currentHabitId: string) {
  const currentHabit = data.find((item) => item.habitId === currentHabitId)
  const others = data
    .filter((item) => item.habitId !== currentHabitId)
    .sort((a, b) => b.value - a.value)

  return currentHabit ? [currentHabit, ...others] : others
}

export function sortForListPage(data: PieChartDataItem[]) {
  return [...data].sort((a, b) => b.value - a.value)
}

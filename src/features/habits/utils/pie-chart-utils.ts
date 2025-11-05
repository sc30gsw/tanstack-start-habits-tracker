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

export function getPeriodDateRange(
  calendarView: SearchParams['calendarView'] = 'month',
  selectedDate?: SearchParams['selectedDate'],
) {
  const baseDate = selectedDate ? dayjs.tz(selectedDate, 'Asia/Tokyo') : dayjs().tz('Asia/Tokyo')

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
  // monthの場合はcurrentMonthを優先、それ以外はselectedDateを使用
  const dateForRange = calendarView === 'month' && currentMonth
    ? dayjs(currentMonth).format('YYYY-MM-DD')
    : selectedDate

  const dateRange = getPeriodDateRange(calendarView, dateForRange)

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

  return {
    data,
    totalDuration,
    period: calendarView,
    dateRange,
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

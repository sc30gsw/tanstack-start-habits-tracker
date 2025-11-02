import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import type { RecordEntity } from '~/features/habits/types/habit'
import type { SearchParams } from '~/features/habits/types/schemas/search-params'
import { getRecoveredDatesSet } from '~/features/habits/utils/recovery-utils'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(weekOfYear)
dayjs.tz.setDefault('Asia/Tokyo')

export function getTargetDateRange(
  selectedDate: Date,
  calendarView: SearchParams['calendarView'],
  currentMonth?: SearchParams['currentMonth'],
): { startDate: string; endDate: string; totalDays: number } {
  const selected = dayjs(selectedDate).tz('Asia/Tokyo')
  const today = dayjs().tz('Asia/Tokyo')

  switch (calendarView) {
    case 'day': {
      return {
        startDate: selected.format('YYYY-MM-DD'),
        endDate: selected.format('YYYY-MM-DD'),
        totalDays: 1,
      }
    }

    case 'week': {
      const weekStart = selected.startOf('week')
      let weekEnd = selected.endOf('week')

      if (selected.isSame(today, 'week')) {
        weekEnd = today
      }

      return {
        startDate: weekStart.format('YYYY-MM-DD'),
        endDate: weekEnd.format('YYYY-MM-DD'),
        totalDays: weekEnd.diff(weekStart, 'day') + 1,
      }
    }

    case 'month': {
      let targetMonth = selected

      if (currentMonth) {
        targetMonth = dayjs.tz(currentMonth, 'Asia/Tokyo')
      }

      const monthStart = targetMonth.startOf('month')
      let monthEnd = targetMonth.endOf('month')

      if (targetMonth.isSame(today, 'month')) {
        monthEnd = today
      }

      return {
        startDate: monthStart.format('YYYY-MM-DD'),
        endDate: monthEnd.format('YYYY-MM-DD'),
        totalDays: monthEnd.diff(monthStart, 'day') + 1,
      }
    }

    default: {
      const defaultMonthStart = selected.startOf('month')
      let defaultMonthEnd = selected.endOf('month')

      if (selected.isSame(today, 'month')) {
        defaultMonthEnd = today
      }

      return {
        startDate: defaultMonthStart.format('YYYY-MM-DD'),
        endDate: defaultMonthEnd.format('YYYY-MM-DD'),
        totalDays: defaultMonthEnd.diff(defaultMonthStart, 'day') + 1,
      }
    }
  }
}

export function filterRecordsByDateRange(
  records: Pick<RecordEntity, 'date' | 'status' | 'recoveryDate'>[],
  startDate: string,
  endDate: string,
) {
  return records.filter((record) => {
    const recordDate = dayjs(record.date).tz('Asia/Tokyo')
    const start = dayjs.tz(startDate, 'Asia/Tokyo')
    const end = dayjs.tz(endDate, 'Asia/Tokyo')

    return (
      (recordDate.isAfter(start, 'day') || recordDate.isSame(start, 'day')) &&
      (recordDate.isBefore(end, 'day') || recordDate.isSame(end, 'day'))
    )
  })
}

export function calculateCompletionRate(
  records: Pick<RecordEntity, 'date' | 'status' | 'recoveryDate'>[],
  selectedDate: Date,
  calendarView: SearchParams['calendarView'],
  currentMonth?: SearchParams['currentMonth'],
) {
  const { startDate, endDate, totalDays } = getTargetDateRange(
    selectedDate,
    calendarView,
    currentMonth,
  )
  const targetRecords = filterRecordsByDateRange(records, startDate, endDate)
  const completedRecords = targetRecords.filter((record) => record.status === 'completed')

  const recoveredDates = getRecoveredDatesSet(records as RecordEntity[])
  const recoveredInRange = targetRecords.filter(
    (r) => r.status === 'skipped' && recoveredDates.has(r.date),
  )

  const completedDays = completedRecords.length + recoveredInRange.length
  const completionRate = totalDays > 0 ? completedDays / totalDays : 0

  return {
    completionRate,
    completedDays,
    totalDays,
  } as const satisfies Record<string, number>
}

export function getCalendarGridDateRange(currentMonth?: SearchParams['currentMonth']) {
  const today = dayjs().tz('Asia/Tokyo')

  const targetMonth = currentMonth ? dayjs.tz(currentMonth, 'Asia/Tokyo') : today
  const firstDayOfMonth = targetMonth.startOf('month')

  const firstDayWeekday = firstDayOfMonth.day()

  const gridStartDate = firstDayOfMonth.subtract(firstDayWeekday, 'day')
  const gridEndDate = gridStartDate.add(41, 'day')

  return {
    startDate: gridStartDate.format('YYYY-MM-DD'),
    endDate: gridEndDate.format('YYYY-MM-DD'),
  } as const satisfies Record<string, string>
}

export function getDataFetchDateRange(currentMonth?: SearchParams['currentMonth']) {
  const today = dayjs().tz('Asia/Tokyo')

  const oneYearAgo = today.subtract(1, 'year').format('YYYY-MM-DD')

  const { startDate: calendarStart, endDate: calendarEnd } = getCalendarGridDateRange(currentMonth)

  const finalStartDate = dayjs(calendarStart).isBefore(oneYearAgo) ? calendarStart : oneYearAgo
  const finalEndDate = dayjs(calendarEnd).isAfter(today) ? calendarEnd : today.format('YYYY-MM-DD')

  return {
    dateFrom: finalStartDate,
    dateTo: finalEndDate,
  } as const satisfies Record<string, string>
}

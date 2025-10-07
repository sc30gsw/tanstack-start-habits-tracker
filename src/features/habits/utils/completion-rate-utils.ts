import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import type { RecordEntity } from '~/features/habits/types/habit'
import type { SearchParams } from '~/features/habits/types/schemas/search-params'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(weekOfYear)
dayjs.tz.setDefault('Asia/Tokyo')

/**
 * カレンダービューと選択日に基づいて対象期間を計算する
 */
export function getTargetDateRange(
  selectedDate: Date,
  calendarView: SearchParams['calendarView'],
  currentMonth?: SearchParams['currentMonth'],
) {
  const selected = dayjs(selectedDate).tz('Asia/Tokyo')
  const today = dayjs().tz('Asia/Tokyo')

  switch (calendarView) {
    case 'day': {
      // 日表示：その日のみ
      return {
        startDate: selected.format('YYYY-MM-DD'),
        endDate: selected.format('YYYY-MM-DD'),
        totalDays: 1,
      }
    }

    case 'week': {
      // 週表示：選択日の週
      const weekStart = selected.startOf('week')
      let weekEnd = selected.endOf('week')

      // 最新週の場合は今日まで
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
      // 月表示：currentMonthが指定されている場合はそれを使用、そうでなければ選択日の月
      let targetMonth = selected
      if (currentMonth) {
        targetMonth = dayjs.tz(currentMonth, 'Asia/Tokyo')
      }

      const monthStart = targetMonth.startOf('month')
      let monthEnd = targetMonth.endOf('month')

      // 最新月の場合は今日まで
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
      // デフォルトは月表示と同じ
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

/**
 * 対象期間内の記録をフィルタリングする
 */
export function filterRecordsByDateRange(
  records: Pick<RecordEntity, 'date' | 'status'>[],
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

/**
 * 期間内の達成率を計算する
 */
export function calculateCompletionRate(
  records: Pick<RecordEntity, 'date' | 'status'>[],
  selectedDate: Date,
  calendarView: SearchParams['calendarView'],
  currentMonth?: SearchParams['currentMonth'],
): { completionRate: number; completedDays: number; totalDays: number } {
  const { startDate, endDate, totalDays } = getTargetDateRange(
    selectedDate,
    calendarView,
    currentMonth,
  )
  const targetRecords = filterRecordsByDateRange(records, startDate, endDate)

  // 完了した記録の数を計算
  const completedRecords = targetRecords.filter((record) => record.status === 'completed')
  const completedDays = completedRecords.length

  // 達成率を計算（記録がない日は未達成として扱う）
  const completionRate = totalDays > 0 ? completedDays / totalDays : 0

  return {
    completionRate,
    completedDays,
    totalDays,
  }
}

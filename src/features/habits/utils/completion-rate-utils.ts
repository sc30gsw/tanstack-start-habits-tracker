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
): { startDate: string; endDate: string; totalDays: number } {
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
) {
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
  } as const satisfies Record<string, number>
}

/**
 * データ取得用の日付範囲を計算する
 * カレンダービューに基づいた範囲 + ヒートマップ用の過去1年分を考慮
 */
export function getDataFetchDateRange(
  selectedDate: Date,
  calendarView: SearchParams['calendarView'],
  currentMonth?: SearchParams['currentMonth'],
) {
  const today = dayjs().tz('Asia/Tokyo')

  // ヒートマップのために過去1年分を基準とする
  const oneYearAgo = today.subtract(1, 'year').format('YYYY-MM-DD')

  // カレンダービューの範囲を取得
  const { startDate, endDate } = getTargetDateRange(selectedDate, calendarView, currentMonth)

  // より広い範囲を採用（過去1年 vs カレンダービュー範囲）
  const finalStartDate = dayjs(startDate).isBefore(oneYearAgo) ? startDate : oneYearAgo
  const finalEndDate = dayjs(endDate).isAfter(today) ? endDate : today.format('YYYY-MM-DD')

  return {
    dateFrom: finalStartDate,
    dateTo: finalEndDate,
  } as const satisfies Record<string, string>
}

import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import z from 'zod/v4'

// dayjsプラグインの初期化
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

/**
 * 日付文字列のバリデーション
 * - YYYY-MM-DD形式の日付文字列を検証
 * - 無効な日付の場合は今日の日付をAsia/Tokyoタイムゾーンで返す
 */
const dateStringValidator = z
  .string()
  .optional()
  .transform((val) => {
    if (!val) return undefined

    // YYYY-MM-DD形式かチェック
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/

    if (!dateRegex.test(val)) {
      return dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD')
    }

    // 有効な日付かチェック
    const parsed = dayjs.tz(val, 'Asia/Tokyo')

    if (!parsed.isValid()) {
      return dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD')
    }

    return val
  })

/**
 * カレンダービューのバリデーション
 * - 無効な値の場合は'month'をデフォルトとして返す
 */
const calendarViewValidator = z
  .enum(['month', 'week', 'day'])
  .optional()
  .catch((_) => {
    return 'month'
  })

/**
 * メトリックのバリデーション
 * - 無効な値の場合は'duration'をデフォルトとして返す
 */
const metricValidator = z
  .enum(['duration', 'completion'])
  .optional()
  .catch((_) => {
    return 'duration'
  })

/**
 * 記録フォーム表示のバリデーション
 * - 無効な値の場合はfalseをデフォルトとして返す
 */
const showRecordFormValidator = z
  .boolean()
  .optional()
  .catch((_) => {
    return false
  })

/**
 * 現在の月のバリデーション
 * - YYYY-MM形式の文字列を検証
 * - 無効な値の場合は現在の月を返す
 */
const currentMonthValidator = z
  .string()
  .optional()
  .transform((val) => {
    if (!val) return undefined

    // YYYY-MM形式かチェック
    const monthRegex = /^\d{4}-\d{2}$/

    if (!monthRegex.test(val)) {
      return dayjs().tz('Asia/Tokyo').format('YYYY-MM')
    }

    // 有効な月かチェック
    const parsed = dayjs.tz(val, 'Asia/Tokyo')

    if (!parsed.isValid()) {
      return dayjs().tz('Asia/Tokyo').format('YYYY-MM')
    }

    return val
  })

const boolValidator = z.boolean().optional().catch(false)

/**
 * 習慣のソート順のバリデーション
 * - all: 全て表示（デフォルト順）
 * - priority: 優先度順（high → middle → low → null）
 */
const habitSortValidator = z
  .enum(['all', 'priority'])
  .optional()
  .catch((_) => {
    return 'all'
  })

/**
 * 習慣のフィルタリングのバリデーション
 * - all: 全て表示
 * - high/middle/low: 各優先度のみ
 * - null: 優先度なしのみ
 */
const habitFilterValidator = z
  .enum(['all', 'high', 'middle', 'low', 'null'])
  .optional()
  .catch((_) => {
    return 'all'
  })

/**
 * ストップウォッチのバリデーション
 */
const stopwatchOpenValidator = boolValidator
const stopwatchHabitIdValidator = z.string().nullable().optional().catch(null)
const stopwatchRunningValidator = boolValidator
const stopwatchStartTimeValidator = z.number().nullable().optional().catch(null)
const stopwatchElapsedValidator = z.number().optional().catch(0)

export const searchSchema = z.object({
  selectedDate: dateStringValidator,
  calendarView: calendarViewValidator,
  metric: metricValidator,
  showRecordForm: showRecordFormValidator,
  currentMonth: currentMonthValidator,
  skip: boolValidator,
  open: boolValidator,
  habitSort: habitSortValidator,
  habitFilter: habitFilterValidator,
  stopwatchOpen: stopwatchOpenValidator,
  stopwatchHabitId: stopwatchHabitIdValidator,
  stopwatchRunning: stopwatchRunningValidator,
  stopwatchStartTime: stopwatchStartTimeValidator,
  stopwatchElapsed: stopwatchElapsedValidator,
})

export type SearchParams = z.infer<typeof searchSchema>

/**
 * URLパラメータから安全にDate オブジェクトを取得するヘルパー関数
 */
export function getValidatedDate(dateString?: string) {
  if (!dateString) {
    return dayjs().tz('Asia/Tokyo').toDate()
  }

  const parsed = dayjs.tz(dateString, 'Asia/Tokyo')

  if (!parsed.isValid()) {
    return dayjs().tz('Asia/Tokyo').toDate()
  }

  return parsed.toDate()
}

/**
 * Date オブジェクトをAsia/Tokyoタイムゾーンで文字列に変換するヘルパー関数
 */
export function formatDateForUrl(date: Date) {
  return dayjs(date).tz('Asia/Tokyo').format('YYYY-MM-DD')
}

/**
 * 検索パラメータのデフォルト値を取得するヘルパー関数
 */
export function getDefaultSearchParams(): Required<SearchParams> {
  return {
    selectedDate: dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD'),
    calendarView: 'month',
    metric: 'duration',
    showRecordForm: false,
    currentMonth: dayjs().tz('Asia/Tokyo').format('YYYY-MM'),
    skip: false,
    open: false,
    habitSort: 'all',
    habitFilter: 'all',
    stopwatchOpen: false,
    stopwatchHabitId: null,
    stopwatchRunning: false,
    stopwatchStartTime: null,
    stopwatchElapsed: 0,
  }
}

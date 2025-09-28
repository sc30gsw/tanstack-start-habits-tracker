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

    // 未来の日付かチェック（今日まで許可）
    const today = dayjs().tz('Asia/Tokyo')

    if (parsed.isAfter(today, 'day')) {
      return today.format('YYYY-MM-DD')
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

export const searchSchema = z.object({
  selectedDate: dateStringValidator,
  calendarView: calendarViewValidator,
  metric: metricValidator,
})

export type SearchParams = z.infer<typeof searchSchema>

/**
 * URLパラメータから安全にDate オブジェクトを取得するヘルパー関数
 */
export function getValidatedDate(dateString?: string): Date {
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
export function formatDateForUrl(date: Date): string {
  return dayjs(date).tz('Asia/Tokyo').format('YYYY-MM-DD')
}

/**
 * 検索パラメータのデフォルト値を取得するヘルパー関数
 */
export function getDefaultSearchParams(): Required<SearchParams> {
  return {
    selectedDate: dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD'),
    calendarView: 'month' as const,
    metric: 'duration' as const,
  }
}

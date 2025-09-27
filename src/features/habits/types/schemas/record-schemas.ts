import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { z } from 'zod/v4'
import 'dayjs/locale/ja'

// プラグインと日本のロケールを設定
dayjs.extend(isSameOrBefore)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('ja')

// 日本のタイムゾーン設定
dayjs.tz.setDefault('Asia/Tokyo')

/**
 * 日付文字列の検証用正規表現
 */
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

/**
 * 日付の妥当性を検証するヘルパー関数
 */
const isValidDate = (dateString: string): boolean => {
  if (!DATE_REGEX.test(dateString)) return false
  const date = dayjs(dateString)
  return date.isValid() && date.format('YYYY-MM-DD') === dateString
}

/**
 * 記録作成用のZodスキーマ
 *
 * 習慣の実行記録を作成する際の入力データを検証します。
 *
 * @example
 * ```typescript
 * const recordData = {
 *   habit_id: 'habit-123',
 *   date: '2025-01-01',
 *   completed: true,
 *   duration_minutes: 30
 * }
 * const result = createRecordSchema.safeParse(recordData)
 * ```
 */
export const createRecordSchema = z
  .object({
    habitId: z.string({ message: '習慣IDは必須です' }).min(1, '習慣IDを指定してください'),
    date: z
      .string({ message: '日付は必須です' })
      .regex(DATE_REGEX, '日付はYYYY-MM-DD形式で入力してください')
      .refine(isValidDate, '有効な日付を入力してください')
      .refine((date) => {
        // 日本時間（JST）で日付を比較
        const inputDate = date
        const todayJST = dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD')

        return inputDate <= todayJST
      }, '未来の日付は記録できません'),
    completed: z.boolean({ message: '完了状態はtrue/falseで指定してください' }).default(false),
    durationMinutes: z
      .number({ message: '実行時間は数値で入力してください' })
      .int('実行時間は整数で入力してください')
      .min(0, '実行時間は0分以上で入力してください')
      .max(1440, '実行時間は1440分（24時間）以下で入力してください')
      .default(0),
    notes: z
      .string()
      .max(500, 'メモは500文字以内で入力してください')
      .optional()
      .transform((val) => val?.trim() || undefined),
  })
  .refine(
    (data) => {
      // 完了状態がtrueの場合、実行時間が0より大きい必要がある
      if (data.completed && data.durationMinutes === 0) {
        return false
      }

      return true
    },
    {
      message: '習慣を完了した場合は、実行時間を入力してください',
      path: ['durationMinutes'], // エラーをdurationMinutesフィールドに関連付け
    },
  )

/**
 * 記録更新用のZodスキーマ
 *
 * 既存の実行記録を更新する際の入力データを検証します。
 *
 * @example
 * ```typescript
 * const updateData = {
 *   id: 'record-123',
 *   completed: true,
 *   duration_minutes: 45
 * }
 * const result = updateRecordSchema.safeParse(updateData)
 * ```
 */
export const updateRecordSchema = z
  .object({
    id: z.string({ message: '記録IDは必須です' }).min(1, '記録IDを指定してください'),
    completed: z.boolean({ message: '完了状態はtrue/falseで指定してください' }).optional(),
    durationMinutes: z
      .number({ message: '実行時間は数値で入力してください' })
      .int('実行時間は整数で入力してください')
      .min(0, '実行時間は0分以上で入力してください')
      .max(1440, '実行時間は1440分（24時間）以下で入力してください')
      .optional(),
    notes: z
      .string()
      .max(500, 'メモは500文字以内で入力してください')
      .optional()
      .transform((val) => val?.trim() || undefined),
  })
  .refine(
    (data) => {
      // 完了状態がtrueかつ実行時間が明示的に0に設定されている場合のみエラー
      if (data.completed === true && data.durationMinutes === 0) {
        return false
      }

      return true
    },
    {
      message: '習慣を完了した場合は、実行時間を入力してください',
      path: ['durationMinutes'], // エラーをdurationMinutesフィールドに関連付け
    },
  )

/**
 * 記録データの読み取り用スキーマ
 *
 * データベースから取得した記録データの形式を定義します。
 */
export const recordSchema = z.object({
  id: z.string(),
  habit_id: z.string(),
  date: z.string(),
  completed: z.boolean(),
  durationMinutes: z.number(),
  notes: z.string().optional(),
  createdAt: z.string(),
})

/**
 * TypeScript型定義（Zodスキーマから自動生成）
 */
export type CreateRecordInput = z.infer<typeof createRecordSchema>
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>
export type RecordSchema = z.infer<typeof recordSchema>

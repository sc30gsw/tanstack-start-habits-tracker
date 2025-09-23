import { z } from 'zod/v4'

/**
 * 日付文字列の検証用正規表現
 */
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

/**
 * 日付の妥当性を検証するヘルパー関数
 */
const isValidDate = (dateString: string): boolean => {
  if (!DATE_REGEX.test(dateString)) return false
  const date = new Date(dateString)
  return date.toISOString().slice(0, 10) === dateString
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
export const createRecordSchema = z.object({
  habit_id: z.string({ message: '習慣IDは必須です' }).min(1, '習慣IDを指定してください'),
  date: z
    .string({ message: '日付は必須です' })
    .regex(DATE_REGEX, '日付はYYYY-MM-DD形式で入力してください')
    .refine(isValidDate, '有効な日付を入力してください')
    .refine((date) => new Date(date) <= new Date(), '未来の日付は記録できません'),
  completed: z.boolean({ message: '完了状態はtrue/falseで指定してください' }).default(false),
  duration_minutes: z
    .number({ message: '実行時間は数値で入力してください' })
    .int('実行時間は整数で入力してください')
    .min(0, '実行時間は0分以上で入力してください')
    .max(1440, '実行時間は1440分（24時間）以下で入力してください')
    .default(0),
})

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
export const updateRecordSchema = z.object({
  id: z.string({ message: '記録IDは必須です' }).min(1, '記録IDを指定してください'),
  completed: z.boolean({ message: '完了状態はtrue/falseで指定してください' }).optional(),
  duration_minutes: z
    .number({ message: '実行時間は数値で入力してください' })
    .int('実行時間は整数で入力してください')
    .min(0, '実行時間は0分以上で入力してください')
    .max(1440, '実行時間は1440分（24時間）以下で入力してください')
    .optional(),
})

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
  duration_minutes: z.number(),
  created_at: z.string(),
})

/**
 * TypeScript型定義（Zodスキーマから自動生成）
 */
export type CreateRecordInput = z.infer<typeof createRecordSchema>
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>
export type RecordSchema = z.infer<typeof recordSchema>

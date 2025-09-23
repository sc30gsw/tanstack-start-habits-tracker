import { z } from 'zod/v4'

/**
 * 習慣作成用のZodスキーマ
 *
 * 新しい習慣を作成する際の入力データを検証します。
 *
 * @example
 * ```typescript
 * const habitData = {
 *   name: '朝の瞑想',
 *   description: '毎朝10分間の瞑想を行う'
 * }
 * const result = createHabitSchema.safeParse(habitData)
 * ```
 */
export const createHabitSchema = z.object({
  name: z
    .string({ message: '習慣名は必須です' })
    .trim()
    .min(1, '習慣名を入力してください')
    .max(100, '習慣名は100文字以内で入力してください'),
  description: z.string().trim().max(500, '説明は500文字以内で入力してください').optional(),
})

/**
 * 習慣更新用のZodスキーマ
 *
 * 既存の習慣情報を更新する際の入力データを検証します。
 *
 * @example
 * ```typescript
 * const updateData = {
 *   id: 'habit-123',
 *   name: '更新された習慣名'
 * }
 * const result = updateHabitSchema.safeParse(updateData)
 * ```
 */
export const updateHabitSchema = z.object({
  id: z.string({ message: '習慣IDは必須です' }).min(1, '習慣IDを指定してください'),
  name: z
    .string()
    .trim()
    .min(1, '習慣名を入力してください')
    .max(100, '習慣名は100文字以内で入力してください')
    .optional(),
  description: z.string().trim().max(500, '説明は500文字以内で入力してください').optional(),
})

/**
 * 習慣データの読み取り用スキーマ
 *
 * データベースから取得した習慣データの形式を定義します。
 */
export const habitSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

/**
 * TypeScript型定義（Zodスキーマから自動生成）
 */
export type CreateHabitInput = z.infer<typeof createHabitSchema>
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>
export type Habit = z.infer<typeof habitSchema>

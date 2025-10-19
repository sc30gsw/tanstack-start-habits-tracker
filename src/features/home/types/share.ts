import type { InferSelectModel } from 'drizzle-orm'
import { z } from 'zod/v4'
import type { habits, records } from '~/db/schema'

/**
 * 共有用習慣データの型定義
 */
export type ShareHabitData = {
  habitId: InferSelectModel<typeof habits>['id']
  habitName: InferSelectModel<typeof habits>['name']
  habitColor: InferSelectModel<typeof habits>['color']
  notes: InferSelectModel<typeof records>['notes'][]
  duration: InferSelectModel<typeof records>['duration_minutes']
}

/**
 * 共有データのレスポンス型
 */
export type ShareDataResponse = {
  success: boolean
  data?: ShareHabitData[]
  error?: string
}

/**
 * 共有データ取得用のスキーマ
 */
export const getShareDataSchema = z.object({
  date: z.string(),
})

export type GetShareDataInput = z.infer<typeof getShareDataSchema>

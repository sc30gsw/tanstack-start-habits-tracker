import { z } from 'zod/v4'

/**
 * 共有用習慣データの型定義
 */
export type ShareHabitData = {
  habitId: string
  habitName: string
  habitColor: string
  notes: (string | null)[]
  duration: number | null
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

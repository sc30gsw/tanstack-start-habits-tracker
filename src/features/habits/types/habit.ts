/**
 * 習慣追跡システムの型定義
 *
 * このファイルはデータベーススキーマとZodスキーマの統合型定義を提供します。
 * エンドツーエンドの型安全性を保証し、一貫したデータ構造を維持します。
 */

import type { habits, records, settings } from '~/db/schema'
import type { Habit } from '~/features/habits/types/schemas/habit-schemas'

/**
 * データベーステーブルの型定義（Drizzle ORM生成）
 */
export type HabitTable = typeof habits.$inferSelect
export type RecordTable = typeof records.$inferSelect
export type SettingsTable = typeof settings.$inferSelect

/**
 * データベース挿入用の型定義
 */
export type HabitInsert = typeof habits.$inferInsert
export type RecordInsert = typeof records.$inferInsert
export type SettingsInsert = typeof settings.$inferInsert

/**
 * フロントエンド用のドメインエンティティ
 */
export type HabitEntity = {
  created_at: Date
  updated_at: Date
  record_count?: number
  completion_rate?: number
} & Omit<Habit, 'created_at' | 'updated_at'>

export type RecordEntity = {
  created_at: Date
  habit?: HabitEntity
} & Omit<RecordTable, 'created_at'>

export type SettingsEntity = Omit<SettingsTable, 'createdAt'> & {
  createdAt: Date
}

export type RecordResponse = {
  success: boolean
  data?: RecordEntity
  error?: string
}

export type SettingsResponse = {
  success: boolean
  data?: SettingsEntity
  error?: string
}

export type RecordsListResponse = {
  success: boolean
  data?: RecordEntity[]
  total?: number
  error?: string
}

/**
 * フィルタリング・検索用の型定義
 */
export type HabitFilters = {
  name?: string
  created_after?: string
  created_before?: string
}

export type RecordFilters = {
  habit_id?: string
  date_from?: string
  date_to?: string
  completed?: boolean
}

/**
 * 統計・分析用の型定義
 */
export type HabitStats = {
  habit_id: string
  total_records: number
  completed_records: number
  completion_rate: number
  total_duration: number
  average_duration: number
  streak_current: number
  streak_longest: number
}

export type DateRange = {
  start: string
  end: string
}

/**
 * ヒートマップ用のデータ型
 */
export type HeatmapData = {
  date: string
  value: number
  duration: number
  completed: boolean
}

/**
 * カレンダー表示用のデータ型
 */
export type CalendarData = {
  date: string
  habits: Array<{
    id: string
    name: string
    completed: boolean
    duration: number
  }>
}

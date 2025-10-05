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

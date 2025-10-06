/**
 * 習慣スケジューリング用Server Functions
 *
 * このファイルは習慣のスケジュール管理に関するサーバーサイド処理を提供します。
 * - 習慣の予定作成（スケジュール）
 * - 習慣の完了マーク
 * - 習慣のスキップ
 * - スケジュール解除
 */

import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { and, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod/v4'
import { db } from '~/db'
import { records } from '~/db/schema'
import { auth } from '~/lib/auth'

/**
 * 習慣スケジュール作成用スキーマ
 */
const scheduleHabitSchema = z.object({
  habitId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

/**
 * 習慣スキップ用スキーマ（scheduleHabitSchemaと同じ構造）
 */
const skipHabitSchema = scheduleHabitSchema

/**
 * 習慣をスケジュールに追加（status: 'active'でrecord作成）
 */
export const scheduleHabit = createServerFn({ method: 'POST' })
  .inputValidator(scheduleHabitSchema)
  .handler(async ({ data }) => {
    const session = await auth.api.getSession(getRequest())

    if (!session || !session.user) {
      throw new Error('認証が必要です')
    }

    const userId = session.user.id

    // 既存のrecordをチェック
    const existingRecord = await db
      .select()
      .from(records)
      .where(and(eq(records.habitId, data.habitId), eq(records.date, data.date)))
      .get()

    if (existingRecord) {
      // 既にrecordが存在する場合は、statusをactiveに更新
      const [updatedRecord] = await db
        .update(records)
        .set({ status: 'active', updatedAt: new Date().toISOString() })
        .where(eq(records.id, existingRecord.id))
        .returning()

      return {
        success: true,
        record: updatedRecord,
        message: '習慣を予定に追加しました',
      }
    }

    // 新規recordを作成
    const [newRecord] = await db
      .insert(records)
      .values({
        id: nanoid(),
        habitId: data.habitId,
        date: data.date,
        status: 'active',
        duration_minutes: 0,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning()

    return {
      success: true,
      record: newRecord,
      message: '習慣を予定に追加しました',
    }
  })

/**
 * 習慣をスキップ
 */
export const skipHabit = createServerFn({ method: 'POST' })
  .inputValidator(skipHabitSchema)
  .handler(async ({ data }) => {
    const session = await auth.api.getSession(getRequest())

    if (!session || !session.user) {
      throw new Error('認証が必要です')
    }

    const userId = session.user.id

    // 既存のrecordをチェック
    const existingRecord = await db
      .select()
      .from(records)
      .where(and(eq(records.habitId, data.habitId), eq(records.date, data.date)))
      .get()

    if (existingRecord) {
      // recordを更新
      const [updatedRecord] = await db
        .update(records)
        .set({
          status: 'skipped',
          updatedAt: new Date().toISOString(),
        })
        .where(eq(records.id, existingRecord.id))
        .returning()

      return {
        success: true,
        record: updatedRecord,
        message: '習慣をスキップしました',
      }
    }

    // recordが存在しない場合は、スキップ状態で作成
    const [newRecord] = await db
      .insert(records)
      .values({
        id: nanoid(),
        habitId: data.habitId,
        date: data.date,
        status: 'skipped',
        duration_minutes: 0,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning()

    return {
      success: true,
      record: newRecord,
      message: '習慣をスキップしました',
    }
  })

/**
 * 習慣のスケジュールを解除（recordを削除）
 */
export const unscheduleHabit = createServerFn({ method: 'POST' })
  .inputValidator(scheduleHabitSchema)
  .handler(async ({ data }) => {
    const session = await auth.api.getSession(getRequest())

    if (!session || !session.user) {
      throw new Error('認証が必要です')
    }

    // recordを削除
    await db
      .delete(records)
      .where(and(eq(records.habitId, data.habitId), eq(records.date, data.date)))

    return {
      success: true,
      message: 'スケジュールを解除しました',
    }
  })

import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { and, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod/v4'
import { db } from '~/db'
import { records } from '~/db/schema'
import { auth } from '~/lib/auth'
import type { RecordEntity, RecordResponse, RecordsListResponse } from '../types/habit'
import { createRecordSchema, updateRecordSchema } from '../types/schemas/record-schemas'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

/**
 * 新しい記録を作成する
 */
const createRecord = createServerFn({ method: 'POST' })
  .inputValidator(createRecordSchema)
  .handler(async ({ data }): Promise<RecordResponse> => {
    try {
      // セッションからuserIdを取得
      const session = await auth.api.getSession(getRequest())
      if (!session?.user?.id) {
        return {
          success: false,
          error: 'Unauthorized',
        }
      }
      const userId = session.user.id

      // 同一習慣・同一日付の記録の重複チェック
      const existingRecord = await db.query.records.findFirst({
        where: and(eq(records.habitId, data.habitId), eq(records.date, data.date)),
      })

      if (existingRecord) {
        return {
          success: false,
          error: 'Record for this habit and date already exists',
        }
      }

      // 新しい記録を作成
      const recordId = nanoid()
      const now = dayjs().tz('Asia/Tokyo').toISOString()

      const [record] = await db
        .insert(records)
        .values({
          id: recordId,
          habitId: data.habitId,
          date: data.date,
          completed: data.completed,
          duration_minutes: data.durationMinutes,
          notes: data.notes,
          createdAt: now,
          updatedAt: now,
          userId,
        })
        .returning()

      // RecordEntityに変換
      const recordEntity = {
        ...record,
        created_at: new Date(record.createdAt!),
      } as const satisfies RecordEntity

      return {
        success: true,
        data: recordEntity,
      }
    } catch (error) {
      console.error('Error creating record:', error)

      if (error instanceof Error) {
        return {
          success: false,
          error: error.message,
        }
      }

      return {
        success: false,
        error: 'Failed to create record',
      }
    }
  })

/**
 * 既存の記録を更新する
 */
const updateRecord = createServerFn({ method: 'POST' })
  .inputValidator(updateRecordSchema)
  .handler(async ({ data }): Promise<RecordResponse> => {
    try {
      // セッションからuserIdを取得
      const session = await auth.api.getSession(getRequest())
      if (!session?.user?.id) {
        return {
          success: false,
          error: 'Unauthorized',
        }
      }
      const userId = session.user.id

      // 記録の存在確認（自分の記録かどうかもチェック）
      const existingRecord = await db.query.records.findFirst({
        where: and(eq(records.id, data.id), eq(records.userId, userId)),
      })

      if (!existingRecord) {
        return {
          success: false,
          error: 'Record not found',
        }
      }

      // 更新データの準備
      const updateData: Partial<typeof records.$inferInsert> = {}

      if (data.completed !== undefined) {
        updateData.completed = data.completed
      }

      if (data.durationMinutes !== undefined) {
        updateData.duration_minutes = data.durationMinutes
      }

      if (data.notes !== undefined) {
        updateData.notes = data.notes
      }

      // 記録を更新
      const [updatedRecord] = await db
        .update(records)
        .set(updateData)
        .where(eq(records.id, data.id))
        .returning()

      // RecordEntityに変換
      const recordEntity = {
        ...updatedRecord,
        created_at: new Date(updatedRecord.createdAt!),
      } as const satisfies RecordEntity

      return {
        success: true,
        data: recordEntity,
      }
    } catch (error) {
      console.error('Error updating record:', error)

      if (error instanceof Error) {
        return {
          success: false,
          error: error.message,
        }
      }

      return {
        success: false,
        error: 'Failed to update record',
      }
    }
  })

/**
 * 記録を削除する
 */
const deleteRecord = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      // セッションからuserIdを取得
      const session = await auth.api.getSession(getRequest())
      if (!session?.user?.id) {
        return {
          success: false,
          error: 'Unauthorized',
        }
      }
      const userId = session.user.id

      // 記録の存在確認（自分の記録かどうかもチェック）
      const existingRecord = await db.query.records.findFirst({
        where: and(eq(records.id, data.id), eq(records.userId, userId)),
      })

      if (!existingRecord) {
        return {
          success: false,
          error: 'Record not found',
        }
      }

      // 記録を削除
      await db.delete(records).where(and(eq(records.id, data.id), eq(records.userId, userId)))

      return {
        success: true,
      }
    } catch (error) {
      console.error('Error deleting record:', error)

      return {
        success: false,
        error: 'Failed to delete record',
      }
    }
  })

/**
 * 記録を取得する（フィルタリング対応）
 */
const getRecords = createServerFn({ method: 'GET' })
  .inputValidator(
    z
      .object({
        habit_id: z.string().optional(),
        date_from: z.string().optional(),
        completed: z.boolean().optional(),
      })
      .optional(),
  )
  .handler(async ({ data: filters }): Promise<RecordsListResponse> => {
    try {
      // セッションからuserIdを取得
      const session = await auth.api.getSession(getRequest())
      if (!session?.user?.id) {
        return {
          success: false,
          error: 'Unauthorized',
        }
      }
      const userId = session.user.id

      // フィルタリング条件を準備（自分の記録のみ）
      const conditions: ReturnType<typeof eq>[] = [eq(records.userId, userId)]

      if (filters?.habit_id) {
        conditions.push(eq(records.habitId, filters.habit_id))
      }

      if (filters?.date_from) {
        conditions.push(eq(records.date, filters.date_from)) // 単純化: 日付範囲は後で実装
      }

      if (filters?.completed !== undefined) {
        conditions.push(eq(records.completed, filters.completed))
      }

      // クエリを実行
      const allRecords =
        conditions.length > 0
          ? await db.query.records.findMany({
              where: and(...conditions),
              orderBy: records.createdAt,
            })
          : await db.query.records.findMany({
              orderBy: records.createdAt,
            })

      // RecordEntityに変換
      const recordEntities = allRecords.map((record) => ({
        ...record,
        created_at: new Date(record.createdAt!),
      }))

      return {
        success: true,
        data: recordEntities,
        total: recordEntities.length,
      }
    } catch (error) {
      console.error('Error fetching records:', error)

      return {
        success: false,
        error: 'Failed to fetch records',
      }
    }
  })

/**
 * IDで特定の記録を取得する
 */
const getRecordById = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }): Promise<RecordResponse> => {
    try {
      // セッションからuserIdを取得
      const session = await auth.api.getSession(getRequest())
      if (!session?.user?.id) {
        return {
          success: false,
          error: 'Unauthorized',
        }
      }
      const userId = session.user.id

      const record = await db.query.records.findFirst({
        where: and(eq(records.id, data.id), eq(records.userId, userId)),
      })

      if (!record) {
        return {
          success: false,
          error: 'Record not found',
        }
      }

      // RecordEntityに変換
      const recordEntity = {
        ...record,
        created_at: new Date(record.createdAt ?? dayjs().tz('Asia/Tokyo').toISOString()),
      } as const satisfies RecordEntity

      return {
        success: true,
        data: recordEntity,
      }
    } catch (error) {
      console.error('Error fetching record:', error)

      return {
        success: false,
        error: 'Failed to fetch record',
      }
    }
  })

export const recordDto = {
  createRecord,
  updateRecord,
  deleteRecord,
  getRecords,
  getRecordById,
} as const

import { and, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from '~/db'
import { records } from '~/db/schema'
import type {
  CreateRecordInput,
  RecordEntity,
  RecordFilters,
  RecordResponse,
  RecordsListResponse,
  UpdateRecordInput,
} from '../types/habit'
import { createRecordSchema, updateRecordSchema } from '../types/schemas/record-schemas'

/**
 * 新しい記録を作成する
 */
export async function createRecord(input: CreateRecordInput): Promise<RecordResponse> {
  try {
    // 入力値の検証
    const validatedData = createRecordSchema.parse(input)

    // 同一習慣・同一日付の記録の重複チェック
    const existingRecord = await db
      .select()
      .from(records)
      .where(
        and(eq(records.habit_id, validatedData.habit_id), eq(records.date, validatedData.date)),
      )
      .limit(1)

    if (existingRecord.length > 0) {
      return {
        success: false,
        error: 'Record for this habit and date already exists',
      }
    }

    // 新しい記録を作成
    const recordId = nanoid()
    const now = new Date().toISOString()

    const [record] = await db
      .insert(records)
      .values({
        id: recordId,
        habit_id: validatedData.habit_id,
        date: validatedData.date,
        completed: validatedData.completed,
        duration_minutes: validatedData.duration_minutes,
        created_at: now,
      })
      .returning()

    // RecordEntityに変換
    const recordEntity = {
      ...record,
      created_at: new Date(record.created_at!),
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
}

/**
 * 既存の記録を更新する
 */
export async function updateRecord(input: UpdateRecordInput): Promise<RecordResponse> {
  try {
    // 入力値の検証
    const validatedData = updateRecordSchema.parse(input)

    // 記録の存在確認
    const existingRecord = await db
      .select()
      .from(records)
      .where(eq(records.id, validatedData.id))
      .limit(1)

    if (existingRecord.length === 0) {
      return {
        success: false,
        error: 'Record not found',
      }
    }

    // 更新データの準備
    const updateData: Partial<typeof records.$inferInsert> = {}

    if (validatedData.completed !== undefined) {
      updateData.completed = validatedData.completed
    }

    if (validatedData.duration_minutes !== undefined) {
      updateData.duration_minutes = validatedData.duration_minutes
    }

    // 記録を更新
    const [updatedRecord] = await db
      .update(records)
      .set(updateData)
      .where(eq(records.id, validatedData.id))
      .returning()

    // RecordEntityに変換
    const recordEntity = {
      ...updatedRecord,
      created_at: new Date(updatedRecord.created_at!),
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
}

/**
 * 記録を削除する
 */
export async function deleteRecord(
  recordId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // 記録の存在確認
    const existingRecord = await db.select().from(records).where(eq(records.id, recordId)).limit(1)

    if (existingRecord.length === 0) {
      return {
        success: false,
        error: 'Record not found',
      }
    }

    // 記録を削除
    await db.delete(records).where(eq(records.id, recordId))

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
}

/**
 * 記録を取得する（フィルタリング対応）
 */
export async function getRecords(filters?: RecordFilters): Promise<RecordsListResponse> {
  try {
    // フィルタリング条件を準備
    const conditions = []

    if (filters?.habit_id) {
      conditions.push(eq(records.habit_id, filters.habit_id))
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
        ? await db
            .select()
            .from(records)
            .where(and(...conditions))
            .orderBy(records.created_at)
        : await db.select().from(records).orderBy(records.created_at)

    // RecordEntityに変換
    const recordEntities: RecordEntity[] = allRecords.map((record) => ({
      ...record,
      created_at: new Date(record.created_at!),
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
}

/**
 * IDで特定の記録を取得する
 */
export async function getRecordById(recordId: string): Promise<RecordResponse> {
  try {
    const record = await db.select().from(records).where(eq(records.id, recordId)).limit(1)

    if (record.length === 0) {
      return {
        success: false,
        error: 'Record not found',
      }
    }

    // RecordEntityに変換
    const recordEntity = {
      ...record[0],
      created_at: new Date(record[0].created_at!),
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
}

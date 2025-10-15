import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { and, eq, gte, lte, type SQL } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod/v4'
import { db } from '~/db'
import { habitLevels, records } from '~/db/schema'
import type { RecordEntity } from '~/features/habits/types/habit'
import {
  createRecordSchema,
  updateRecordSchema,
} from '~/features/habits/types/schemas/record-schemas'
import { calculateHabitStats } from '~/features/habits/utils/habit-level-utils'
import { auth } from '~/lib/auth'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

async function updateHabitLevel(habitId: string) {
  const habitRecords = await db.query.records.findMany({
    where: eq(records.habitId, habitId),
  })

  const stats = calculateHabitStats(habitRecords)

  await db
    .update(habitLevels)
    .set({
      uniqueCompletionDays: stats.uniqueDays,
      completionLevel: stats.completionLevel,
      totalHoursDecimal: stats.totalHours,
      hoursLevel: stats.hoursLevel,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      lastActivityDate: stats.lastDate,
      updatedAt: dayjs().tz('Asia/Tokyo').toISOString(),
    })
    .where(eq(habitLevels.habitId, habitId))
}

const createRecord = createServerFn({ method: 'POST' })
  .inputValidator(createRecordSchema)
  .handler(async ({ data }) => {
    try {
      const session = await auth.api.getSession(getRequest())

      if (!session?.user?.id) {
        return {
          success: false,
          error: 'Unauthorized',
        }
      }
      const userId = session.user.id

      const existingRecord = await db.query.records.findFirst({
        where: and(eq(records.habitId, data.habitId), eq(records.date, data.date)),
      })

      if (existingRecord) {
        return {
          success: false,
          error: 'Record for this habit and date already exists',
        }
      }

      const recordId = nanoid()
      const now = dayjs().tz('Asia/Tokyo').toISOString()

      const [record] = await db
        .insert(records)
        .values({
          id: recordId,
          habitId: data.habitId,
          date: data.date,
          status: data.status,
          duration_minutes: data.durationMinutes,
          notes: data.notes,
          createdAt: now,
          updatedAt: now,
          userId,
        })
        .returning()

      await updateHabitLevel(data.habitId)

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

const updateRecord = createServerFn({ method: 'POST' })
  .inputValidator(updateRecordSchema)
  .handler(async ({ data }) => {
    try {
      const session = await auth.api.getSession(getRequest())

      if (!session?.user?.id) {
        return {
          success: false,
          error: 'Unauthorized',
        }
      }
      const userId = session.user.id

      const existingRecord = await db.query.records.findFirst({
        where: and(eq(records.id, data.id), eq(records.userId, userId)),
      })

      if (!existingRecord) {
        return {
          success: false,
          error: 'Record not found',
        }
      }

      const updateData: Partial<typeof records.$inferInsert> = {}

      if (data.status !== undefined) {
        updateData.status = data.status
      }

      if (data.durationMinutes !== undefined) {
        updateData.duration_minutes = data.durationMinutes
      }

      if (data.notes !== undefined) {
        updateData.notes = data.notes
      }

      const [updatedRecord] = await db
        .update(records)
        .set(updateData)
        .where(eq(records.id, data.id))
        .returning()

      await updateHabitLevel(existingRecord.habitId)

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

const deleteRecord = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    try {
      const session = await auth.api.getSession(getRequest())

      if (!session?.user?.id) {
        return {
          success: false,
          error: 'Unauthorized',
        }
      }
      const userId = session.user.id

      const existingRecord = await db.query.records.findFirst({
        where: and(eq(records.id, data.id), eq(records.userId, userId)),
      })

      if (!existingRecord) {
        return {
          success: false,
          error: 'Record not found',
        }
      }

      const habitId = existingRecord.habitId

      await db.delete(records).where(and(eq(records.id, data.id), eq(records.userId, userId)))

      await updateHabitLevel(habitId)

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

const getRecords = createServerFn({ method: 'GET' })
  .inputValidator(
    z
      .object({
        habit_id: z.string().optional(),
        date_from: z.string().optional(),
        date_to: z.string().optional(),
        status: z.enum(['active', 'completed', 'skipped']).optional(),
      })
      .optional(),
  )
  .handler(async ({ data: filters }) => {
    try {
      const session = await auth.api.getSession(getRequest())

      if (!session?.user?.id) {
        return {
          success: false,
          error: 'Unauthorized',
        }
      }
      const userId = session.user.id

      const conditions: SQL<unknown>[] = [eq(records.userId, userId)]

      if (filters?.habit_id) {
        conditions.push(eq(records.habitId, filters.habit_id))
      }

      if (filters?.date_from && filters?.date_to) {
        conditions.push(gte(records.date, filters.date_from))
        conditions.push(lte(records.date, filters.date_to))
      } else if (filters?.date_from) {
        conditions.push(eq(records.date, filters.date_from))
      }

      if (filters?.status !== undefined) {
        conditions.push(eq(records.status, filters.status))
      }

      const allRecords = await db.query.records.findMany({
        where: and(...conditions),
        orderBy: (records, { desc }) => [desc(records.date), desc(records.createdAt)],
        with: { habit: true },
      })

      const recordEntities = allRecords.map((record) => ({
        ...record,
        created_at: new Date(record.createdAt!),
        habit: record.habit
          ? {
              ...record.habit,
              created_at: new Date(record.habit.createdAt!),
              updated_at: new Date(record.habit.updatedAt!),
              color: record.habit.color ?? 'blue',
            }
          : undefined,
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

const getRecordById = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    try {
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
} as const satisfies {
  createRecord: typeof createRecord
  updateRecord: typeof updateRecord
  deleteRecord: typeof deleteRecord
  getRecords: typeof getRecords
  getRecordById: typeof getRecordById
}

import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import dayjs from 'dayjs'
import { and, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod/v4'
import { db } from '~/db'
import { records } from '~/db/schema'
import type { RecordEntity } from '~/features/habits/types/habit'
import { auth } from '~/lib/auth'

const saveStopwatchRecordSchema = z.object({
  habitId: z.string(),
  durationMinutes: z.number(),
  notes: z.string().optional(),
  date: z.string(),
})

export const saveStopwatchRecord = createServerFn({ method: 'POST' })
  .inputValidator(saveStopwatchRecordSchema)
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
        where: and(
          eq(records.habitId, data.habitId),
          eq(records.date, data.date),
          eq(records.userId, userId),
        ),
      })

      if (existingRecord) {
        const newDuration = (existingRecord.duration_minutes ?? 0) + data.durationMinutes
        const newNotes = data.notes
          ? existingRecord.notes
            ? `${existingRecord.notes}\n${data.notes}`
            : data.notes
          : existingRecord.notes

        await db
          .update(records)
          .set({
            duration_minutes: newDuration,
            notes: newNotes,
            status: 'completed',
            updatedAt: new Date().toISOString(),
          })
          .where(eq(records.id, existingRecord.id))

        return {
          success: true,
          data: {
            id: existingRecord.id,
            duration_minutes: newDuration,
          },
        }
      }

      const [newRecord] = await db
        .insert(records)
        .values({
          id: nanoid(),
          habitId: data.habitId,
          date: data.date,
          userId,
          status: 'completed',
          duration_minutes: data.durationMinutes,
          notes: data.notes ?? null,
        })
        .returning({ recordId: records.id, durationTime: records.duration_minutes })

      return {
        success: true,
        data: {
          id: newRecord.recordId,
          duration_minutes: newRecord.durationTime,
        },
      }
    } catch (error) {
      console.error('Error saving stopwatch record:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save record',
      }
    }
  })

/**
 * 習慣IDと日付で特定の記録を取得する
 */
const getRecordByHabitAndDate = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ habitId: z.string().min(1), date: z.string().min(1) }))
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
        where: and(
          eq(records.habitId, data.habitId),
          eq(records.date, data.date),
          eq(records.userId, userId),
        ),
      })

      if (!record) {
        return {
          success: false,
          data: null,
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

export const stopwatchDto = {
  saveStopwatchRecord,
  getRecordByHabitAndDate,
} as const satisfies {
  saveStopwatchRecord: typeof saveStopwatchRecord
  getRecordByHabitAndDate: typeof getRecordByHabitAndDate
}

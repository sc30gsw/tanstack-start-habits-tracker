import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { and, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod/v4'
import { db } from '~/db'
import { records } from '~/db/schema'
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

export const stopwatchDto = {
  saveStopwatchRecord,
} as const satisfies {
  saveStopwatchRecord: typeof saveStopwatchRecord
}

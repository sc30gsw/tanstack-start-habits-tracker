import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { and, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod/v4'
import { db } from '~/db'
import { records } from '~/db/schema'
import { auth } from '~/lib/auth'

const scheduleHabitSchema = z.object({
  habitId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

const skipHabitSchema = scheduleHabitSchema

export const scheduleHabit = createServerFn({ method: 'POST' })
  .inputValidator(scheduleHabitSchema)
  .handler(async ({ data }) => {
    const session = await auth.api.getSession(getRequest())

    if (!session || !session.user) {
      throw new Error('認証が必要です')
    }

    const userId = session.user.id

    const existingRecord = await db
      .select()
      .from(records)
      .where(and(eq(records.habitId, data.habitId), eq(records.date, data.date)))
      .get()

    if (existingRecord) {
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

export const skipHabit = createServerFn({ method: 'POST' })
  .inputValidator(skipHabitSchema)
  .handler(async ({ data }) => {
    const session = await auth.api.getSession(getRequest())

    if (!session || !session.user) {
      throw new Error('認証が必要です')
    }

    const userId = session.user.id

    const existingRecord = await db
      .select()
      .from(records)
      .where(and(eq(records.habitId, data.habitId), eq(records.date, data.date)))
      .get()

    if (existingRecord) {
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

export const unscheduleHabit = createServerFn({ method: 'POST' })
  .inputValidator(scheduleHabitSchema)
  .handler(async ({ data }) => {
    const session = await auth.api.getSession(getRequest())

    if (!session || !session.user) {
      throw new Error('認証が必要です')
    }

    await db
      .delete(records)
      .where(and(eq(records.habitId, data.habitId), eq(records.date, data.date)))

    return {
      success: true,
      message: 'スケジュールを解除しました',
    }
  })

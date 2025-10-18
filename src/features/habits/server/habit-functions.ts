import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { and, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod/v4'
import { db } from '~/db'
import { habitLevels, habits } from '~/db/schema'
import type { HabitEntity } from '~/features/habits/types/habit'
import {
  createHabitSchema,
  habitSchema,
  updateHabitSchema,
} from '~/features/habits/types/schemas/habit-schemas'
import { auth } from '~/lib/auth'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

const createHabit = createServerFn({ method: 'POST' })
  .inputValidator(createHabitSchema)
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

      const existingHabit = await db.query.habits.findFirst({
        where: and(eq(habits.name, data.name), eq(habits.userId, userId)),
      })

      if (existingHabit) {
        return {
          success: false,
          error: 'Habit with this name already exists',
        }
      }

      const habitId = nanoid()

      const [habit] = await db
        .insert(habits)
        .values({
          id: habitId,
          name: data.name,
          description: data.description || null,
          color: data.color || 'blue',
          priority: data.priority ?? null,
          userId,
        })
        .returning()

      const levelId = nanoid()
      await db.insert(habitLevels).values({
        id: levelId,
        habitId: habitId,
        userId: userId,
        uniqueCompletionDays: 0,
        completionLevel: 1,
        totalHoursDecimal: 0.0,
        hoursLevel: 1,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
      })

      const parsedHabit = habitSchema.parse({
        ...habit,
        created_at: habit.createdAt ?? dayjs().tz('Asia/Tokyo').toISOString(),
        updated_at: habit.updatedAt ?? dayjs().tz('Asia/Tokyo').toISOString(),
      })

      const habitEntity = {
        ...parsedHabit,
        color: parsedHabit.color || 'blue', // nullの場合デフォルト値を設定
        created_at: new Date(parsedHabit.created_at),
        updated_at: new Date(parsedHabit.updated_at),
      } as const satisfies HabitEntity

      return {
        success: true,
        data: habitEntity,
      }
    } catch (error) {
      console.error('Error creating habit:', error)

      if (error instanceof Error) {
        return {
          success: false,
          error: error.message,
        }
      }

      return {
        success: false,
        error: 'Failed to create habit',
      }
    }
  })

const updateHabit = createServerFn({ method: 'POST' })
  .inputValidator(updateHabitSchema)
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

      const existingHabit = await db.query.habits.findFirst({
        where: and(eq(habits.id, data.id), eq(habits.userId, userId)),
      })

      if (!existingHabit) {
        return {
          success: false,
          error: 'Habit not found',
        }
      }

      if (data.name && data.name !== existingHabit.name) {
        const duplicateHabit = await db.query.habits.findFirst({
          where: and(eq(habits.name, data.name), eq(habits.userId, userId)),
        })

        if (duplicateHabit) {
          return {
            success: false,
            error: 'Habit with this name already exists',
          }
        }
      }

      const updateData: Partial<typeof habits.$inferInsert> = {
        updatedAt: dayjs().tz('Asia/Tokyo').toISOString(),
      }

      if (data.name !== undefined) {
        updateData.name = data.name
      }

      if (data.description !== undefined) {
        updateData.description = data.description
      }

      if (data.color !== undefined) {
        updateData.color = data.color
      }

      if (data.priority !== undefined) {
        updateData.priority = data.priority
      }

      const [updatedHabit] = await db
        .update(habits)
        .set(updateData)
        .where(eq(habits.id, data.id))
        .returning()

      const parsedHabit = habitSchema.parse({
        ...updatedHabit,
        created_at: updatedHabit.createdAt ?? dayjs().tz('Asia/Tokyo').toISOString(),
        updated_at: updatedHabit.updatedAt ?? dayjs().tz('Asia/Tokyo').toISOString(),
      })

      const habitEntity = {
        ...parsedHabit,
        color: parsedHabit.color || 'blue', // nullの場合デフォルト値を設定
        created_at: new Date(parsedHabit.created_at),
        updated_at: new Date(parsedHabit.updated_at),
      } as const satisfies HabitEntity

      return {
        success: true,
        data: habitEntity,
      }
    } catch (error) {
      console.error('Error updating habit:', error)

      if (error instanceof Error) {
        return {
          success: false,
          error: error.message,
        }
      }

      return {
        success: false,
        error: 'Failed to update habit',
      }
    }
  })

const deleteHabit = createServerFn({ method: 'POST' })
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

      const existingHabit = await db.query.habits.findFirst({
        where: and(eq(habits.id, data.id), eq(habits.userId, userId)),
      })

      if (!existingHabit) {
        return {
          success: false,
          error: 'Habit not found',
        }
      }

      await db.delete(habits).where(and(eq(habits.id, data.id), eq(habits.userId, userId)))

      return {
        success: true,
      }
    } catch (error) {
      console.error('Error deleting habit:', error)

      return {
        success: false,
        error: 'Failed to delete habit',
      }
    }
  })

const getHabits = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const session = await auth.api.getSession(getRequest())

    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    const allHabits = await db.query.habits.findMany({
      where: eq(habits.userId, session.user.id),
    })

    const habitEntities: HabitEntity[] = allHabits.map((habit) => {
      const parsedHabit = habitSchema.parse({
        ...habit,
        created_at: habit.createdAt ?? dayjs().tz('Asia/Tokyo').toISOString(),
        updated_at: habit.updatedAt ?? dayjs().tz('Asia/Tokyo').toISOString(),
      })

      return {
        ...parsedHabit,
        color: parsedHabit.color || 'blue',
        created_at: new Date(parsedHabit.created_at),
        updated_at: new Date(parsedHabit.updated_at),
      } as const satisfies HabitEntity
    })

    return {
      success: true,
      data: habitEntities,
      total: habitEntities.length,
    }
  } catch (error) {
    console.error('Error fetching habits:', error)

    return {
      success: false,
      error: 'Failed to fetch habits',
    }
  }
})

const getHabitById = createServerFn({ method: 'GET' })
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

      const habit = await db.query.habits.findFirst({
        where: and(eq(habits.id, data.id), eq(habits.userId, userId)),
      })

      if (!habit) {
        return {
          success: false,
          error: 'Habit not found',
        }
      }

      const parsedHabit = habitSchema.parse({
        ...habit,
        created_at: habit.createdAt ?? dayjs().tz('Asia/Tokyo').toISOString(),
        updated_at: habit.updatedAt ?? dayjs().tz('Asia/Tokyo').toISOString(),
      })

      const habitEntity = {
        ...parsedHabit,
        color: parsedHabit.color || 'blue', // nullの場合デフォルト値を設定
        created_at: new Date(parsedHabit.created_at),
        updated_at: new Date(parsedHabit.updated_at),
      } as const satisfies HabitEntity

      return {
        success: true,
        data: habitEntity,
      }
    } catch (error) {
      console.error('Error fetching habit:', error)

      return {
        success: false,
        error: 'Failed to fetch habit',
      }
    }
  })

const updateHabitNotificationSettingSchema = z.object({
  habitId: z.string(),
  notificationsEnabled: z.boolean(),
})

const updateHabitNotificationSetting = createServerFn({ method: 'POST' })
  .inputValidator(updateHabitNotificationSettingSchema)
  .handler(async ({ data }) => {
    const session = await auth.api.getSession(getRequest())

    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    const habit = await db.query.habits.findFirst({
      where: and(eq(habits.id, data.habitId), eq(habits.userId, session.user.id)),
    })

    if (!habit) {
      throw new Error('Habit not found')
    }

    await db
      .update(habits)
      .set({
        notificationsEnabled: data.notificationsEnabled,
      })
      .where(eq(habits.id, data.habitId))

    return { success: true }
  })

export const habitDto = {
  createHabit,
  updateHabit,
  deleteHabit,
  getHabits,
  getHabitById,
  updateHabitNotificationSetting,
} as const satisfies {
  createHabit: typeof createHabit
  updateHabit: typeof updateHabit
  deleteHabit: typeof deleteHabit
  getHabits: typeof getHabits
  getHabitById: typeof getHabitById
  updateHabitNotificationSetting: typeof updateHabitNotificationSetting
}

import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { and, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod/v4'
import { db } from '~/db'
import { habits } from '~/db/schema'
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

/**
 * 新しい習慣を作成する
 */
const createHabit = createServerFn({ method: 'POST' })
  .inputValidator(createHabitSchema)
  .handler(async ({ data }) => {
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

      // 習慣名の重複チェック（同一ユーザー内で）
      const existingHabit = await db.query.habits.findFirst({
        where: and(eq(habits.name, data.name), eq(habits.userId, userId)),
      })

      if (existingHabit) {
        return {
          success: false,
          error: 'Habit with this name already exists',
        }
      }

      // 新しい習慣を作成
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

      // スキーマ検証用のデータ準備（string型のタイムスタンプ）
      const parsedHabit = habitSchema.parse({
        ...habit,
        created_at: habit.createdAt ?? dayjs().tz('Asia/Tokyo').toISOString(),
        updated_at: habit.updatedAt ?? dayjs().tz('Asia/Tokyo').toISOString(),
      })

      // HabitEntityに変換（Date型のタイムスタンプ、colorのnullハンドリング）
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

/**
 * 既存の習慣を更新する
 */
const updateHabit = createServerFn({ method: 'POST' })
  .inputValidator(updateHabitSchema)
  .handler(async ({ data }) => {
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

      // 習慣の存在確認（自分の習慣かどうかもチェック）
      const existingHabit = await db.query.habits.findFirst({
        where: and(eq(habits.id, data.id), eq(habits.userId, userId)),
      })

      if (!existingHabit) {
        return {
          success: false,
          error: 'Habit not found',
        }
      }

      // 習慣名が変更される場合、重複チェック（同一ユーザー内で）
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

      // 更新データの準備
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

      // 習慣を更新
      const [updatedHabit] = await db
        .update(habits)
        .set(updateData)
        .where(eq(habits.id, data.id))
        .returning()

      // スキーマ検証用のデータ準備（string型のタイムスタンプ）
      const parsedHabit = habitSchema.parse({
        ...updatedHabit,
        created_at: updatedHabit.createdAt ?? dayjs().tz('Asia/Tokyo').toISOString(),
        updated_at: updatedHabit.updatedAt ?? dayjs().tz('Asia/Tokyo').toISOString(),
      })

      // HabitEntityに変換（Date型のタイムスタンプ、colorのnullハンドリング）
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

/**
 * 習慣を削除する
 */
const deleteHabit = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
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

      // 習慣の存在確認（自分の習慣かどうかもチェック）
      const existingHabit = await db.query.habits.findFirst({
        where: and(eq(habits.id, data.id), eq(habits.userId, userId)),
      })

      if (!existingHabit) {
        return {
          success: false,
          error: 'Habit not found',
        }
      }

      // 習慣を削除
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

/**
 * 習慣を取得する
 */
const getHabits = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const session = await auth.api.getSession(getRequest())
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    const allHabits = await db.query.habits.findMany({
      where: eq(habits.userId, session.user.id),
    })

    // HabitEntityに変換
    const habitEntities: HabitEntity[] = allHabits.map((habit) => {
      // スキーマ検証用のデータ準備（string型のタイムスタンプ）
      const parsedHabit = habitSchema.parse({
        ...habit,
        created_at: habit.createdAt ?? dayjs().tz('Asia/Tokyo').toISOString(),
        updated_at: habit.updatedAt ?? dayjs().tz('Asia/Tokyo').toISOString(),
      })

      // HabitEntityに変換（Date型のタイムスタンプ、colorのnullハンドリング）
      return {
        ...parsedHabit,
        color: parsedHabit.color || 'blue', // nullの場合デフォルト値を設定
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

/**
 * IDで特定の習慣を取得する
 */
const getHabitById = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
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

      const habit = await db.query.habits.findFirst({
        where: and(eq(habits.id, data.id), eq(habits.userId, userId)),
      })

      if (!habit) {
        return {
          success: false,
          error: 'Habit not found',
        }
      }

      // スキーマ検証用のデータ準備（string型のタイムスタンプ）
      const parsedHabit = habitSchema.parse({
        ...habit,
        created_at: habit.createdAt ?? dayjs().tz('Asia/Tokyo').toISOString(),
        updated_at: habit.updatedAt ?? dayjs().tz('Asia/Tokyo').toISOString(),
      })

      // HabitEntityに変換（Date型のタイムスタンプ、colorのnullハンドリング）
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

export const habitDto = {
  createHabit,
  updateHabit,
  deleteHabit,
  getHabits,
  getHabitById,
} as const satisfies {
  createHabit: typeof createHabit
  updateHabit: typeof updateHabit
  deleteHabit: typeof deleteHabit
  getHabits: typeof getHabits
  getHabitById: typeof getHabitById
}

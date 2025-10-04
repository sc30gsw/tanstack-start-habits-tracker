import { createServerFn } from '@tanstack/react-start'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod/v4'
import { db } from '~/db'
import { auth } from '~/lib/auth'
import type { HabitEntity, HabitResponse, HabitsListResponse } from '~/features/habits/types/habit'
import {
  createHabitSchema,
  habitSchema,
  updateHabitSchema,
} from '~/features/habits/types/schemas/habit-schemas'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

/**
 * 新しい習慣を作成する
 */
const createHabit = createServerFn({ method: 'POST' })
  .inputValidator(createHabitSchema)
  .handler(async ({ data }): Promise<HabitResponse> => {
    try {
      // TODO: セッションからuserIdを取得
      // const session = await auth.api.getSession({ headers: new Headers() })
      // if (!session?.user?.id) {
      //   return {
      //     success: false,
      //     error: 'Unauthorized',
      //   }
      // }
      const userId = 'temp-user-id' // TODO: Get from session

      // 習慣名の重複チェック
      const existingHabit = await db
        .select()
        .from(habits)
        .where(eq(habits.name, data.name))
        .limit(1)

      if (existingHabit.length > 0) {
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
          userId: userId,
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
  .handler(async ({ data }): Promise<HabitResponse> => {
    try {
      // 習慣の存在確認
      const existingHabit = await db.select().from(habits).where(eq(habits.id, data.id)).limit(1)

      if (existingHabit.length === 0) {
        return {
          success: false,
          error: 'Habit not found',
        }
      }

      // 習慣名が変更される場合、重複チェック
      if (data.name && data.name !== existingHabit[0].name) {
        const duplicateHabit = await db
          .select()
          .from(habits)
          .where(eq(habits.name, data.name))
          .limit(1)

        if (duplicateHabit.length > 0) {
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
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      // 習慣の存在確認
      const existingHabit = await db.select().from(habits).where(eq(habits.id, data.id)).limit(1)

      if (existingHabit.length === 0) {
        return {
          success: false,
          error: 'Habit not found',
        }
      }

      // 習慣を削除
      await db.delete(habits).where(eq(habits.id, data.id))

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
const getHabits = createServerFn({ method: 'GET' }).handler(
  async (): Promise<HabitsListResponse> => {
    try {
      const allHabits = await db.select().from(habits)

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
  },
)

/**
 * IDで特定の習慣を取得する
 */
const getHabitById = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }): Promise<HabitResponse> => {
    try {
      const habit = await db.select().from(habits).where(eq(habits.id, data.id)).limit(1)

      if (habit.length === 0) {
        return {
          success: false,
          error: 'Habit not found',
        }
      }

      // スキーマ検証用のデータ準備（string型のタイムスタンプ）
      const parsedHabit = habitSchema.parse({
        ...habit[0],
        created_at: habit[0].createdAt ?? dayjs().tz('Asia/Tokyo').toISOString(),
        updated_at: habit[0].updatedAt ?? dayjs().tz('Asia/Tokyo').toISOString(),
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
} as const

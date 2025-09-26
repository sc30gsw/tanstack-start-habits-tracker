import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod/v4'
import { db } from '~/db'
import { habits } from '~/db/schema'
import type { HabitEntity, HabitResponse, HabitsListResponse } from '~/features/habits/types/habit'
import {
  createHabitSchema,
  habitSchema,
  updateHabitSchema,
} from '~/features/habits/types/schemas/habit-schemas'

/**
 * 新しい習慣を作成する
 */
const createHabit = createServerFn({ method: 'POST' })
  .validator(createHabitSchema)
  .handler(async ({ data }): Promise<HabitResponse> => {
    try {
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
        })
        .returning()

      // スキーマ検証用のデータ準備（string型のタイムスタンプ）
      const parsedHabit = habitSchema.parse({
        ...habit,
        created_at: habit.created_at ?? new Date().toISOString(),
        updated_at: habit.updated_at ?? new Date().toISOString(),
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
  .validator(updateHabitSchema)
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
        updated_at: new Date().toISOString(),
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
        created_at: updatedHabit.created_at ?? new Date().toISOString(),
        updated_at: updatedHabit.updated_at ?? new Date().toISOString(),
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
  .validator(z.object({ id: z.string().min(1) }))
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
      const allHabits = await db.select().from(habits).orderBy(habits.created_at)

      // HabitEntityに変換
      const habitEntities: HabitEntity[] = allHabits.map((habit) => {
        // スキーマ検証用のデータ準備（string型のタイムスタンプ）
        const parsedHabit = habitSchema.parse({
          ...habit,
          created_at: habit.created_at ?? new Date().toISOString(),
          updated_at: habit.updated_at ?? new Date().toISOString(),
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
  .validator(z.object({ id: z.string().min(1) }))
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
        created_at: habit[0].created_at ?? new Date().toISOString(),
        updated_at: habit[0].updated_at ?? new Date().toISOString(),
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

import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from '~/db'
import { habits } from '~/db/schema'
import type {
  CreateHabitInput,
  HabitEntity,
  HabitResponse,
  HabitsListResponse,
  UpdateHabitInput,
} from '~/features/habits/types/habit'
import { createHabitSchema, updateHabitSchema } from '~/features/habits/types/schemas/habit-schemas'

/**
 * 新しい習慣を作成する
 */
export async function createHabit(input: CreateHabitInput): Promise<HabitResponse> {
  try {
    // 入力値の検証
    const validatedData = createHabitSchema.parse(input)

    // 習慣名の重複チェック
    const existingHabit = await db
      .select()
      .from(habits)
      .where(eq(habits.name, validatedData.name))
      .limit(1)

    if (existingHabit.length > 0) {
      return {
        success: false,
        error: 'Habit with this name already exists',
      }
    }

    // 新しい習慣を作成
    const habitId = nanoid()
    const now = new Date().toISOString()

    const [habit] = await db
      .insert(habits)
      .values({
        id: habitId,
        name: validatedData.name,
        description: validatedData.description || null,
        created_at: now,
        updated_at: now,
      })
      .returning()

    // HabitEntityに変換
    const habitEntity = {
      ...habit,
      created_at: new Date(habit.created_at!),
      updated_at: new Date(habit.updated_at!),
      description: habit.description,
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
}

/**
 * 既存の習慣を更新する
 */
export async function updateHabit(input: UpdateHabitInput): Promise<HabitResponse> {
  try {
    // 入力値の検証
    const validatedData = updateHabitSchema.parse(input)

    // 習慣の存在確認
    const existingHabit = await db
      .select()
      .from(habits)
      .where(eq(habits.id, validatedData.id))
      .limit(1)

    if (existingHabit.length === 0) {
      return {
        success: false,
        error: 'Habit not found',
      }
    }

    // 更新データの準備
    const updateData: Partial<typeof habits.$inferInsert> = {
      updated_at: new Date().toISOString(),
    }

    if (validatedData.name !== undefined) {
      // 名前の重複チェック（自分以外）
      const nameConflict = await db
        .select()
        .from(habits)
        .where(eq(habits.name, validatedData.name))
        .limit(1)

      if (nameConflict.length > 0 && nameConflict[0].id !== validatedData.id) {
        return {
          success: false,
          error: 'Habit with this name already exists',
        }
      }

      updateData.name = validatedData.name
    }

    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description || null
    }

    // 習慣を更新
    const [updatedHabit] = await db
      .update(habits)
      .set(updateData)
      .where(eq(habits.id, validatedData.id))
      .returning()

    // HabitEntityに変換
    const habitEntity = {
      ...updatedHabit,
      created_at: new Date(updatedHabit.created_at!),
      updated_at: new Date(updatedHabit.updated_at!),
      description: updatedHabit.description,
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
}

/**
 * 習慣を削除する
 */
export async function deleteHabit(habitId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // 習慣の存在確認
    const existingHabit = await db.select().from(habits).where(eq(habits.id, habitId)).limit(1)

    if (existingHabit.length === 0) {
      return {
        success: false,
        error: 'Habit not found',
      }
    }

    // 習慣を削除
    await db.delete(habits).where(eq(habits.id, habitId))

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
}

/**
 * すべての習慣を取得する
 */
export async function getHabits(): Promise<HabitsListResponse> {
  try {
    const allHabits = await db.select().from(habits).orderBy(habits.created_at)

    // HabitEntityに変換
    const habitEntities: HabitEntity[] = allHabits.map((habit) => ({
      ...habit,
      created_at: new Date(habit.created_at!),
      updated_at: new Date(habit.updated_at!),
      description: habit.description,
    }))

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
}

/**
 * IDで特定の習慣を取得する
 */
export async function getHabitById(habitId: string): Promise<HabitResponse> {
  try {
    const habit = await db.select().from(habits).where(eq(habits.id, habitId)).limit(1)

    if (habit.length === 0) {
      return {
        success: false,
        error: 'Habit not found',
      }
    }

    // HabitEntityに変換
    const habitEntity = {
      ...habit[0],
      created_at: new Date(habit[0].created_at!),
      updated_at: new Date(habit[0].updated_at!),
      description: habit[0].description,
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
}

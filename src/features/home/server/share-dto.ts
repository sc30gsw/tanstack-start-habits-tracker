import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { db } from '~/db'
import { habits, records } from '~/db/schema'
import { getCurrentUser } from '~/features/auth/server/server-functions'
import type { ShareDataResponse } from '~/features/home/types/share'
import { getShareDataSchema } from '~/features/home/types/share'

const getCompletedHabitsForShare = createServerFn({ method: 'POST' })
  .inputValidator(getShareDataSchema)
  .handler(async ({ data }): Promise<ShareDataResponse> => {
    try {
      const userResult = await getCurrentUser()

      if (!userResult.success || !userResult.user) {
        return {
          success: false,
          error: 'User not authenticated',
        }
      }

      const userId = userResult.user.id

      // 指定された日付の完了した記録と関連する習慣を取得
      const completedHabits = await db
        .select({
          habitId: habits.id,
          habitName: habits.name,
          habitColor: habits.color,
          notes: records.notes,
          duration: records.duration_minutes,
        })
        .from(records)
        .innerJoin(habits, eq(records.habitId, habits.id))
        .where(
          and(
            eq(habits.userId, userId),
            eq(records.date, data.date),
            eq(records.status, 'completed'),
          ),
        )
        .orderBy(habits.name)

      // 習慣名でグループ化してメモと時間をまとめる
      const groupedData = completedHabits.reduce(
        (acc, habit) => {
          const existingHabit = acc.find((h) => h.habitId === habit.habitId)

          if (existingHabit) {
            if (habit.notes) {
              existingHabit.notes.push(habit.notes)
            }

            existingHabit.duration = (existingHabit.duration ?? 0) + (habit.duration ?? 0)
          } else {
            acc.push({
              habitId: habit.habitId,
              habitName: habit.habitName,
              habitColor: habit.habitColor,
              notes: habit.notes ? [habit.notes] : [],
              duration: habit.duration ?? 0,
            })
          }

          return acc
        },
        [] as NonNullable<ShareDataResponse['data']>,
      )

      return {
        success: true,
        data: groupedData,
      }
    } catch (error) {
      console.error('Error fetching share data:', error)
      return {
        success: false,
        error: 'Failed to fetch share data',
      }
    }
  })

export const shareDto = {
  getCompletedHabitsForShare,
} as const satisfies {
  getCompletedHabitsForShare: typeof getCompletedHabitsForShare
}

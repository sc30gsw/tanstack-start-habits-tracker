import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { db } from '~/db'
import { habits, records } from '~/db/schema'
import { getCurrentUser } from '~/features/auth/server/server-functions'
import type { ShareDataResponse } from '~/features/home/types/share'
import { getShareDataSchema } from '~/features/home/types/share'

/**
 * 指定された日付の完了した習慣を共有用データとして取得する
 */
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
          habitName: habits.name,
          notes: records.notes,
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

      // 習慣名でグループ化してメモをまとめる
      const groupedData = completedHabits.reduce(
        (acc, habit) => {
          const existingHabit = acc.find((h) => h.habitName === habit.habitName)

          if (existingHabit) {
            if (habit.notes) {
              existingHabit.notes.push(habit.notes)
            }
          } else {
            acc.push({
              habitName: habit.habitName,
              notes: habit.notes ? [habit.notes] : [],
            })
          }

          return acc
        },
        [] as { habitName: string; notes: (string | null)[] }[],
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

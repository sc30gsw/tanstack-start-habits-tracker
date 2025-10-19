import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { and, asc, eq, type InferSelectModel } from 'drizzle-orm'
import { db } from '~/db'
import { habits, records } from '~/db/schema'
import { getShareDataSchema } from '~/features/home/types/share'
import { auth } from '~/lib/auth'

const getCompletedHabitsForShare = createServerFn({ method: 'GET' })
  .inputValidator(getShareDataSchema)
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

      const completedRecords = await db
        .select({
          records,
          habits,
        })
        .from(records)
        .innerJoin(habits, eq(records.habitId, habits.id))
        .where(
          and(
            eq(records.date, data.date),
            eq(records.status, 'completed'),
            eq(records.userId, userId),
          ),
        )
        .orderBy(asc(habits.createdAt))

      const shareDataMap = new Map<
        string,
        {
          habitId: string
          habitName: InferSelectModel<typeof habits>['name']
          habitColor: InferSelectModel<typeof habits>['color']
          notes: InferSelectModel<typeof records>['notes'][]
          duration: InferSelectModel<typeof records>['duration_minutes']
        }
      >()

      for (const row of completedRecords) {
        const habitId = row.records.habitId

        if (!shareDataMap.has(habitId)) {
          shareDataMap.set(habitId, {
            habitId: habitId,
            habitName: row.habits.name,
            habitColor: row.habits.color,
            notes: [],
            duration: 0,
          })
        }

        const habitData = shareDataMap.get(habitId)

        if (habitData) {
          habitData.notes.push(row.records.notes)
          habitData.duration = (habitData.duration ?? 0) + (row.records.duration_minutes ?? 0)
        }
      }

      const shareData = Array.from(shareDataMap.values())

      return {
        success: true,
        data: shareData,
      }
    } catch (error) {
      console.error('Error fetching share data:', error)

      if (error instanceof Error) {
        return {
          success: false,
          error: error.message,
        }
      }

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

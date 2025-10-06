import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { and, eq, type InferSelectModel } from 'drizzle-orm'
import { db } from '~/db'
import { type habits, records } from '~/db/schema'
import { getShareDataSchema } from '~/features/home/types/share'
import { auth } from '~/lib/auth'

/**
 * 完了した習慣とメモを取得する
 */
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

      // 指定日付の完了した記録を取得（習慣情報も含む）
      const completedRecords = await db.query.records.findMany({
        where: and(
          eq(records.date, data.date),
          eq(records.status, 'completed'),
          eq(records.userId, userId),
        ),
        with: {
          habit: true,
        },
      })

      // 習慣ごとにメモをグループ化
      const shareDataMap = new Map<
        string,
        {
          habitName: InferSelectModel<typeof habits>['name']
          notes: InferSelectModel<typeof records>['notes'][]
        }
      >()

      for (const record of completedRecords) {
        if (!record.habit) continue

        const habitId = record.habitId

        if (!shareDataMap.has(habitId)) {
          shareDataMap.set(habitId, {
            habitName: record.habit.name,
            notes: [],
          })
        }

        // メモがある場合は追加（nullの場合も追加）
        shareDataMap.get(habitId)?.notes.push(record.notes)
      }

      // Map を配列に変換
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

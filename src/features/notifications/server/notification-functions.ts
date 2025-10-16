import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import type { Session } from 'better-auth'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { and, desc, eq, lt } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { db } from '~/db'
import { habits, notifications, records } from '~/db/schema'
import { auth } from '~/lib/auth'

dayjs.extend(utc)
dayjs.extend(timezone)

function getTodayInJST() {
  return dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD')
}

const AUTO_DELETE_POLICY = {
  reminder: 2,
  habit_incomplete: 2,
  habit_skipped: 2,
  habit_scheduled: 2,
  achievement: 30,
} as const satisfies Record<string, number>

async function cleanupOldNotifications(userId: Session['userId']) {
  const now = dayjs()

  for (const [type, daysToKeep] of Object.entries(AUTO_DELETE_POLICY)) {
    const cutoffDate = now.subtract(daysToKeep, 'days').toISOString()

    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.type, type as keyof typeof AUTO_DELETE_POLICY),
          lt(notifications.createdAt, cutoffDate),
        ),
      )
  }
}

const getNotifications = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await auth.api.getSession(getRequest())

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const userNotifications = await db.query.notifications.findMany({
    where: eq(notifications.userId, session.user.id),
    orderBy: [desc(notifications.createdAt)],
    limit: 100,
    with: {
      habit: {
        columns: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  })

  return userNotifications
})

const getUnreadNotificationsCount = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await auth.api.getSession(getRequest())

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const unreadCount = await db
    .select({ count: notifications.id })
    .from(notifications)
    .where(and(eq(notifications.userId, session.user.id), eq(notifications.isRead, false)))

  return unreadCount.length
})

const markAsReadSchema = z.object({
  notificationId: z.string(),
})

type MarkAsReadInput = z.infer<typeof markAsReadSchema>

const markNotificationAsRead = createServerFn({ method: 'POST' })
  .inputValidator((data: MarkAsReadInput) => markAsReadSchema.parse(data))
  .handler(async ({ data }) => {
    const session = await auth.api.getSession(getRequest())

    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    const notification = await db.query.notifications.findFirst({
      where: and(
        eq(notifications.id, data.notificationId),
        eq(notifications.userId, session.user.id),
      ),
    })

    if (!notification) {
      throw new Error('Notification not found')
    }

    await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date().toISOString(),
      })
      .where(eq(notifications.id, data.notificationId))

    return { success: true }
  })

const markAllNotificationsAsRead = createServerFn({ method: 'POST' }).handler(async () => {
  const session = await auth.api.getSession(getRequest())

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  await db
    .update(notifications)
    .set({
      isRead: true,
      readAt: new Date().toISOString(),
    })
    .where(and(eq(notifications.userId, session.user.id), eq(notifications.isRead, false)))

  return { success: true }
})

const deleteNotificationSchema = z.object({
  notificationId: z.string(),
})

type DeleteNotificationInput = z.infer<typeof deleteNotificationSchema>

const deleteNotification = createServerFn({ method: 'POST' })
  .inputValidator((data: DeleteNotificationInput) => deleteNotificationSchema.parse(data))
  .handler(async ({ data }) => {
    const session = await auth.api.getSession(getRequest())

    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    const notification = await db.query.notifications.findFirst({
      where: and(
        eq(notifications.id, data.notificationId),
        eq(notifications.userId, session.user.id),
      ),
    })

    if (!notification) {
      throw new Error('Notification not found')
    }

    await db.delete(notifications).where(eq(notifications.id, data.notificationId))

    return { success: true }
  })

const deleteAllReadNotifications = createServerFn({ method: 'POST' }).handler(async () => {
  const session = await auth.api.getSession(getRequest())

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  await db
    .delete(notifications)
    .where(and(eq(notifications.userId, session.user.id), eq(notifications.isRead, true)))

  return { success: true }
})

const createNotificationSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.enum(['reminder', 'habit_incomplete', 'habit_skipped', 'habit_scheduled', 'achievement']),
  habitId: z.string().optional(),
  recordId: z.string().optional(),
})

type CreateNotificationInput = z.infer<typeof createNotificationSchema>

const createNotification = createServerFn({ method: 'POST' })
  .inputValidator((data: CreateNotificationInput) => createNotificationSchema.parse(data))
  .handler(async ({ data }) => {
    const session = await auth.api.getSession(getRequest())

    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    await cleanupOldNotifications(session.user.id)

    const notificationId = nanoid()

    await db.insert(notifications).values({
      id: notificationId,
      userId: session.user.id,
      title: data.title,
      message: data.message,
      type: data.type,
      habitId: data.habitId || null,
      recordId: data.recordId || null,
      isRead: false,
      readAt: null,
    })

    return { success: true, notificationId }
  })

/**
 * Get today's habit statuses for notification generation
 * Returns habits categorized by their status for today (JST timezone)
 */
const getTodayHabitStatuses = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await auth.api.getSession(getRequest())

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const todayJST = getTodayInJST()

  // Get all user's habits
  const userHabits = await db.query.habits.findMany({
    where: eq(habits.userId, session.user.id),
    columns: {
      id: true,
      name: true,
      color: true,
    },
  })

  // Get today's records for these habits
  const todayRecords = await db.query.records.findMany({
    where: and(eq(records.userId, session.user.id), eq(records.date, todayJST)),
    columns: {
      id: true,
      habitId: true,
      status: true,
    },
  })

  // Create a map of habitId -> record
  const recordMap = new Map(todayRecords.map((record) => [record.habitId, record]))

  // Categorize habits by status
  const incompleteHabits: typeof userHabits = []
  const skippedHabits: typeof userHabits = []
  const scheduledHabits: typeof userHabits = []
  const completedHabits: typeof userHabits = []

  for (const habit of userHabits) {
    const record = recordMap.get(habit.id)

    if (!record) {
      // No record for today = scheduled
      scheduledHabits.push(habit)
      continue
    }

    switch (record.status) {
      case 'completed':
        completedHabits.push(habit)
        break

      case 'skipped':
        skippedHabits.push(habit)
        break

      case 'active':
        incompleteHabits.push(habit)
        break
    }
  }

  return {
    todayJST,
    incomplete: incompleteHabits,
    skipped: skippedHabits,
    scheduled: scheduledHabits,
    completed: completedHabits,
  }
})

export const notificationDto = {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllReadNotifications,
  createNotification,
  getTodayHabitStatuses,
} as const satisfies {
  getNotifications: typeof getNotifications
  getUnreadNotificationsCount: typeof getUnreadNotificationsCount
  markNotificationAsRead: typeof markNotificationAsRead
  markAllNotificationsAsRead: typeof markAllNotificationsAsRead
  deleteNotification: typeof deleteNotification
  deleteAllReadNotifications: typeof deleteAllReadNotifications
  createNotification: typeof createNotification
  getTodayHabitStatuses: typeof getTodayHabitStatuses
}

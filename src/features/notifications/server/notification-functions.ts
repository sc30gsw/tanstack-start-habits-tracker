import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { and, desc, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { db } from '~/db'
import { notifications } from '~/db/schema'
import { auth } from '~/lib/auth'

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

export const notificationDto = {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification,
} as const satisfies {
  getNotifications: typeof getNotifications
  getUnreadNotificationsCount: typeof getUnreadNotificationsCount
  markNotificationAsRead: typeof markNotificationAsRead
  markAllNotificationsAsRead: typeof markAllNotificationsAsRead
  deleteNotification: typeof deleteNotification
  createNotification: typeof createNotification
}

import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod/v4'
import { db } from '~/db'
import { settings } from '~/db/schema'
import { auth } from '~/lib/auth'

const getUserSettings = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await auth.api.getSession(getRequest())

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  let userSettings = await db.query.settings.findFirst({
    where: eq(settings.userId, session.user.id),
  })

  if (!userSettings) {
    const newSettings = await db
      .insert(settings)
      .values({
        id: nanoid(),
        userId: session.user.id,
        theme: 'auto',
        notificationsEnabled: false,
        customReminderEnabled: false,
        dailyReminderTime: '09:00',
        incompleteReminderEnabled: true,
        skippedReminderEnabled: true,
        scheduledReminderEnabled: true,
      })
      .returning()
      .execute()

    userSettings = newSettings[0]
  }

  return userSettings
})

const updateThemeSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']),
})

type UpdateThemeInput = z.infer<typeof updateThemeSchema>

const updateTheme = createServerFn({ method: 'POST' })
  .inputValidator((data: UpdateThemeInput) => updateThemeSchema.parse(data))
  .handler(async ({ data }) => {
    const session = await auth.api.getSession(getRequest())

    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    const userSettings = await db.query.settings.findFirst({
      where: eq(settings.userId, session.user.id),
    })

    if (!userSettings) {
      await db.insert(settings).values({
        id: nanoid(),
        userId: session.user.id,
        theme: data.theme,
        notificationsEnabled: false,
        customReminderEnabled: false,
        dailyReminderTime: '09:00',
        incompleteReminderEnabled: true,
        skippedReminderEnabled: true,
        scheduledReminderEnabled: true,
      })
    } else {
      await db
        .update(settings)
        .set({
          theme: data.theme,
        })
        .where(eq(settings.id, userSettings.id))
    }

    return { success: true, theme: data.theme }
  })

const updateNotificationSettingsSchema = z
  .object({
    notificationsEnabled: z.boolean(),
    customReminderEnabled: z.boolean(),
    dailyReminderTime: z.string(),
    incompleteReminderEnabled: z.boolean(),
    skippedReminderEnabled: z.boolean(),
    scheduledReminderEnabled: z.boolean(),
  })
  .superRefine((data, ctx) => {
    // カスタムリマインダーが有効な場合のみ時刻の検証を行う
    if (data.customReminderEnabled) {
      const timeRegex = /^([01]?\d|2[0-3]):([0-5]\d)$/
      if (!data.dailyReminderTime || !timeRegex.test(data.dailyReminderTime)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Invalid time format (HH:mm)',
          path: ['dailyReminderTime'],
        })
      }
    }
  })

type UpdateNotificationSettingsInput = z.infer<typeof updateNotificationSettingsSchema>

const updateNotificationSettings = createServerFn({ method: 'POST' })
  .inputValidator((data: UpdateNotificationSettingsInput) =>
    updateNotificationSettingsSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const session = await auth.api.getSession(getRequest())

    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    const userSettings = await db.query.settings.findFirst({
      where: eq(settings.userId, session.user.id),
    })

    if (!userSettings) {
      await db.insert(settings).values({
        id: nanoid(),
        userId: session.user.id,
        theme: 'auto',
        notificationsEnabled: data.notificationsEnabled,
        customReminderEnabled: data.customReminderEnabled,
        dailyReminderTime: data.dailyReminderTime,
        incompleteReminderEnabled: data.incompleteReminderEnabled,
        skippedReminderEnabled: data.skippedReminderEnabled,
        scheduledReminderEnabled: data.scheduledReminderEnabled,
      })
    } else {
      await db
        .update(settings)
        .set({
          notificationsEnabled: data.notificationsEnabled,
          customReminderEnabled: data.customReminderEnabled,
          dailyReminderTime: data.dailyReminderTime,
          incompleteReminderEnabled: data.incompleteReminderEnabled,
          skippedReminderEnabled: data.skippedReminderEnabled,
          scheduledReminderEnabled: data.scheduledReminderEnabled,
        })
        .where(eq(settings.id, userSettings.id))
    }

    return { success: true, message: 'Notification settings updated successfully' }
  })

export const settingsDto = {
  getUserSettings,
  updateTheme,
  updateNotificationSettings,
} as const satisfies {
  getUserSettings: typeof getUserSettings
  updateTheme: typeof updateTheme
  updateNotificationSettings: typeof updateNotificationSettings
}

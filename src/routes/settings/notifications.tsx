import { Card, Skeleton, Stack, Title } from '@mantine/core'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Suspense } from 'react'
import { z } from 'zod/v4'
import { NotificationsForm } from '~/features/settings/components/notifications-form'
import { SettingsLayout } from '~/features/settings/components/settings-layout'
import { settingsDto } from '~/features/settings/server/settings-functions'

export const notificationSettingsSchema = z.object({
  notificationsEnabled: z.boolean().optional().catch(false),
  dailyReminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, '有効な時刻を入力してください (HH:mm)')
    .optional()
    .catch('09:00'),
  incompleteReminderEnabled: z.boolean().optional().catch(false),
  skippedReminderEnabled: z.boolean().optional().catch(false),
  scheduledReminderEnabled: z.boolean().optional().catch(false),
})

export type NotificationSettingsSchema = z.infer<typeof notificationSettingsSchema>

export const Route = createFileRoute('/settings/notifications')({
  validateSearch: notificationSettingsSchema,
  beforeLoad: async ({ search }) => {
    const settings = await settingsDto.getUserSettings()

    const hasAnySearchParam = Object.keys(search).length > 0

    // クエリパラメータが全て未設定の場合、DBの設定値で初期化
    if (!hasAnySearchParam) {
      throw redirect({
        to: '/settings/notifications',
        search: {
          notificationsEnabled: settings?.notificationsEnabled ?? false,
          dailyReminderTime: settings?.dailyReminderTime ?? '09:00',
          incompleteReminderEnabled: settings?.incompleteReminderEnabled ?? false,
          skippedReminderEnabled: settings?.skippedReminderEnabled ?? false,
          scheduledReminderEnabled: settings?.scheduledReminderEnabled ?? false,
        },
      })
    }

    // DBの設定値をコンテキストとして返す
    return {
      dbSettings: {
        notificationsEnabled: settings?.notificationsEnabled ?? false,
        dailyReminderTime: settings?.dailyReminderTime ?? '09:00',
        incompleteReminderEnabled: settings?.incompleteReminderEnabled ?? false,
        skippedReminderEnabled: settings?.skippedReminderEnabled ?? false,
        scheduledReminderEnabled: settings?.scheduledReminderEnabled ?? false,
      },
    }
  },
  component: RouteComponent,
})

function NotificationsFormSkeleton() {
  return (
    <Stack gap="md">
      <Skeleton height={56} />
      <Skeleton height={70} />
      <Skeleton height={56} />
      <Skeleton height={56} />
      <Skeleton height={56} />
      <Skeleton height={36} mt="md" />
    </Stack>
  )
}

function RouteComponent() {
  return (
    <SettingsLayout>
      <Stack gap="lg">
        <Title order={2}>通知設定</Title>

        <Card withBorder padding="lg">
          <Suspense fallback={<NotificationsFormSkeleton />}>
            <NotificationsForm />
          </Suspense>
        </Card>
      </Stack>
    </SettingsLayout>
  )
}

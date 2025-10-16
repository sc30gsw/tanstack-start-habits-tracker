import { Button, Stack, Switch, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { getRouteApi, useRouter } from '@tanstack/react-router'
import { useTransition } from 'react'
import { settingsDto } from '~/features/settings/server/settings-functions'
import {
  type NotificationSettingsSchema,
  notificationSettingsSchema,
} from '~/routes/settings/notifications'

export function NotificationsForm() {
  const [isPending, startTransition] = useTransition()
  const routeApi = getRouteApi('/settings/notifications')
  const router = useRouter()
  const searchParams = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const { dbSettings } = routeApi.useRouteContext()

  const currentValues = {
    notificationsEnabled: searchParams.notificationsEnabled ?? false,
    dailyReminderTime: searchParams.dailyReminderTime ?? '09:00',
    incompleteReminderEnabled: searchParams.incompleteReminderEnabled ?? false,
    skippedReminderEnabled: searchParams.skippedReminderEnabled ?? false,
    scheduledReminderEnabled: searchParams.scheduledReminderEnabled ?? false,
  } as const satisfies NotificationSettingsSchema

  const isDirty =
    currentValues.notificationsEnabled !== dbSettings.notificationsEnabled ||
    currentValues.dailyReminderTime !== dbSettings.dailyReminderTime ||
    currentValues.incompleteReminderEnabled !== dbSettings.incompleteReminderEnabled ||
    currentValues.skippedReminderEnabled !== dbSettings.skippedReminderEnabled ||
    currentValues.scheduledReminderEnabled !== dbSettings.scheduledReminderEnabled

  const form = useForm<Required<NotificationSettingsSchema>>({
    mode: 'controlled',
    initialValues: currentValues,
    validate: (values) => {
      const result = notificationSettingsSchema.safeParse(values)

      if (!result.success) {
        const errors: Partial<Record<keyof NotificationSettingsSchema, string>> = {}

        for (const issue of result.error.issues) {
          const path = issue.path[0] as keyof NotificationSettingsSchema

          if (path && !errors[path]) {
            errors[path] = issue.message
          }
        }

        return errors
      }

      return {}
    },
  })

  // フォームの値が変わったらクエリパラメータを更新
  const updateSearchParam = <K extends keyof Required<NotificationSettingsSchema>>(
    key: K,
    value: Required<NotificationSettingsSchema>[K],
  ) => {
    navigate({
      search: (prev) => ({ ...prev, [key]: value }),
    })
  }

  const handleSubmit = async () => {
    const result = form.validate()

    if (result.hasErrors) {
      return
    }

    startTransition(async () => {
      try {
        await settingsDto.updateNotificationSettings({ data: currentValues })

        notifications.show({
          title: '成功',
          message: '通知設定が更新されました',
          color: 'green',
        })

        // TanStack Routerでリフレッシュ
        router.invalidate()
      } catch (error) {
        notifications.show({
          title: 'エラー',
          message: error instanceof Error ? error.message : '通知設定の更新に失敗しました',
          color: 'red',
        })
      }
    })
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <Stack gap="md">
        <Switch
          label="通知を有効にする"
          description="習慣リマインダー通知を受け取ります"
          checked={currentValues.notificationsEnabled}
          onChange={(e) => updateSearchParam('notificationsEnabled', e.currentTarget.checked)}
        />

        <TextInput
          label="日次リマインダー時刻"
          placeholder="09:00"
          description="毎日の習慣リマインダーを送信する時刻 (HH:mm形式)"
          disabled={!currentValues.notificationsEnabled}
          value={currentValues.dailyReminderTime}
          onChange={(e) => updateSearchParam('dailyReminderTime', e.currentTarget.value)}
          error={form.errors.dailyReminderTime}
        />

        <Switch
          label="未完了習慣のリマインダー"
          description="未完了の習慣がある場合に通知します"
          disabled={!currentValues.notificationsEnabled}
          checked={currentValues.incompleteReminderEnabled}
          onChange={(e) => updateSearchParam('incompleteReminderEnabled', e.currentTarget.checked)}
        />

        <Switch
          label="スキップした習慣のリマインダー"
          description="スキップした習慣がある場合に通知します"
          disabled={!currentValues.notificationsEnabled}
          checked={currentValues.skippedReminderEnabled}
          onChange={(e) => updateSearchParam('skippedReminderEnabled', e.currentTarget.checked)}
        />

        <Switch
          label="予定された習慣のリマインダー"
          description="実行予定の習慣がある場合に通知します"
          disabled={!currentValues.notificationsEnabled}
          checked={currentValues.scheduledReminderEnabled}
          onChange={(e) => updateSearchParam('scheduledReminderEnabled', e.currentTarget.checked)}
        />

        <Button type="submit" loading={isPending} disabled={!isDirty} fullWidth mt="md">
          変更を保存
        </Button>
      </Stack>
    </form>
  )
}

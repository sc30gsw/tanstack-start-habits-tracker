import { Button, Stack, Switch, Text } from '@mantine/core'
import { TimePicker } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useTransition } from 'react'
import { z } from 'zod/v4'
import { GET_USER_SETTINGS_CACHE_KEY } from '~/constants/cache-key'
import { settingsDto } from '~/features/settings/server/settings-functions'

const notificationSettingsSchema = z.object({
  notificationsEnabled: z.boolean(),
  customReminderEnabled: z.boolean(),
  dailyReminderTime: z
    .string()
    .regex(/^([01]?\d|2[0-3]):([0-5]\d)$/, '時刻を入力してください（24時間形式: 例）14:00）'),
  incompleteReminderEnabled: z.boolean(),
  skippedReminderEnabled: z.boolean(),
  scheduledReminderEnabled: z.boolean(),
})

type NotificationSettingsSchema = z.infer<typeof notificationSettingsSchema>

export function NotificationsForm() {
  const [isPending, startTransition] = useTransition()

  const queryClient = useQueryClient()
  const { data: settings, refetch } = useSuspenseQuery({
    queryKey: [GET_USER_SETTINGS_CACHE_KEY],
    queryFn: () => settingsDto.getUserSettings(),
  })

  const form = useForm<NotificationSettingsSchema>({
    initialValues: {
      notificationsEnabled: settings?.notificationsEnabled ?? false,
      customReminderEnabled: settings?.customReminderEnabled ?? false,
      dailyReminderTime: settings?.dailyReminderTime ?? '09:00',
      incompleteReminderEnabled: settings?.incompleteReminderEnabled ?? false,
      skippedReminderEnabled: settings?.skippedReminderEnabled ?? false,
      scheduledReminderEnabled: settings?.scheduledReminderEnabled ?? false,
    },
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

  const handleSubmit = form.onSubmit(async (values) => {
    startTransition(async () => {
      try {
        await settingsDto.updateNotificationSettings({ data: values })

        notifications.show({
          title: '成功',
          message: '通知設定が更新されました',
          color: 'green',
        })

        // キャッシュを無効化してリフェッチ
        await queryClient.invalidateQueries({ queryKey: [GET_USER_SETTINGS_CACHE_KEY] })
        form.resetDirty()
        await refetch()
      } catch (error) {
        notifications.show({
          title: 'エラー',
          message: error instanceof Error ? error.message : '通知設定の更新に失敗しました',
          color: 'red',
        })
      }
    })
  })

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <Switch
          label="通知を有効にする"
          description="習慣リマインダー通知を受け取ります"
          disabled={isPending}
          {...form.getInputProps('notificationsEnabled', { type: 'checkbox' })}
        />

        <Switch
          label="カスタムリマインダーを有効にする"
          description="指定した時刻にリマインダー通知を送信します"
          disabled={!form.values.notificationsEnabled || isPending}
          {...form.getInputProps('customReminderEnabled', { type: 'checkbox' })}
        />

        <NotificationTimePicker
          disabled={
            !form.values.notificationsEnabled || !form.values.customReminderEnabled || isPending
          }
          value={form.values.dailyReminderTime}
          onChange={(value) => form.setFieldValue('dailyReminderTime', value ?? '')}
          error={form.errors.dailyReminderTime}
        />

        <Text size="sm" c="dimmed" mt="md" mb="xs">
          以下の通知は 9:00、13:00、17:00、21:00 に送信されます
        </Text>

        <Switch
          label="未完了習慣のリマインダー"
          description="未完了の習慣がある場合に通知"
          disabled={!form.values.notificationsEnabled || isPending}
          {...form.getInputProps('incompleteReminderEnabled', { type: 'checkbox' })}
        />

        <Switch
          label="スキップした習慣のリマインダー"
          description="スキップした習慣がある場合に通知"
          disabled={!form.values.notificationsEnabled || isPending}
          {...form.getInputProps('skippedReminderEnabled', { type: 'checkbox' })}
        />

        <Switch
          label="予定された習慣のリマインダー"
          description="実行予定の習慣がある場合に通知"
          disabled={!form.values.notificationsEnabled || isPending}
          {...form.getInputProps('scheduledReminderEnabled', { type: 'checkbox' })}
        />

        <Button type="submit" loading={isPending} disabled={!form.isDirty()} fullWidth mt="md">
          変更を保存
        </Button>
      </Stack>
    </form>
  )
}

type NotificationTimePickerProps = {
  disabled: boolean
  value: NotificationSettingsSchema['dailyReminderTime']
  onChange: (value: NotificationSettingsSchema['dailyReminderTime']) => void
  error?: ReturnType<typeof useForm<NotificationSettingsSchema>>['errors']['dailyReminderTime']
}

function NotificationTimePicker({ disabled, value, onChange, error }: NotificationTimePickerProps) {
  return (
    <TimePicker
      label="日次リマインダー時刻"
      description="カスタムリマインダー通知を送信する時刻"
      disabled={disabled}
      withDropdown
      clearable
      value={value}
      onChange={onChange}
      error={error}
    />
  )
}

import { Badge, Box, Button, Checkbox, Divider, Group, Stack, Switch, Text } from '@mantine/core'
import { TimePicker } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { useListState } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconDeviceFloppy, IconFlag } from '@tabler/icons-react'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, useRouter } from '@tanstack/react-router'
import { useTransition } from 'react'
import { z } from 'zod/v4'
import { GET_USER_SETTINGS_CACHE_KEY } from '~/constants/cache-key'
import { useHabitColor } from '~/features/habits/hooks/use-habit-color'
import { habitDto } from '~/features/habits/server/habit-functions'
import type { HabitColor } from '~/features/habits/types/schemas/habit-schemas'
import { settingsDto } from '~/features/settings/server/settings-functions'
import classes from './notifications-form.module.css'

const notificationSettingsSchema = z
  .object({
    notificationsEnabled: z.boolean(),
    customReminderEnabled: z.boolean(),
    dailyReminderTime: z.string(),
    incompleteReminderEnabled: z.boolean(),
    skippedReminderEnabled: z.boolean(),
    scheduledReminderEnabled: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.customReminderEnabled) {
      const timeRegex = /^([01]?\d|2[0-3]):([0-5]\d)$/

      if (!data.dailyReminderTime || !timeRegex.test(data.dailyReminderTime)) {
        ctx.addIssue({
          code: 'custom',
          message: '時刻を入力してください（24時間形式: 例）14:00）',
          path: ['dailyReminderTime'],
        })
      }
    }
  })

type NotificationSettingsSchema = z.infer<typeof notificationSettingsSchema>

export function NotificationsForm() {
  const [isPending, startTransition] = useTransition()
  const { getHabitColor } = useHabitColor()

  // 優先度の表示設定
  const getPriorityConfig = (priority: string | null) => {
    switch (priority) {
      case 'high':
        return { label: '高', color: 'red', icon: <IconFlag size={12} /> }

      case 'middle':
        return { label: '中', color: 'yellow', icon: <IconFlag size={12} /> }

      case 'low':
        return { label: '低', color: 'blue', icon: <IconFlag size={12} /> }

      default:
        return { label: 'なし', color: 'gray', icon: <IconFlag size={12} /> }
    }
  }

  const queryClient = useQueryClient()
  const { data: settings, refetch } = useSuspenseQuery({
    queryKey: [GET_USER_SETTINGS_CACHE_KEY],
    queryFn: () => settingsDto.getUserSettings(),
  })

  const routeApi = getRouteApi('/settings/notifications')
  const habitsResult = routeApi.useLoaderData()
  const router = useRouter()

  const habits = (habitsResult?.success ? habitsResult.data : []) || []

  const initialHabitNotifications = habits.map((habit) => ({
    habitId: habit.id,
    habitName: habit.name,
    habitColor: habit.color,
    habitDescription: habit.description,
    habitPriority: habit.priority,
    checked: habit.notificationsEnabled ?? true,
  }))

  const [habitNotifications, habitNotificationsHandlers] = useListState(initialHabitNotifications)

  const habitNotificationsChanged = habitNotifications.some(
    (item, index) => item.checked !== initialHabitNotifications[index].checked,
  )

  const form = useForm<NotificationSettingsSchema>({
    initialValues: {
      notificationsEnabled: settings?.notificationsEnabled ?? false,
      customReminderEnabled: settings?.customReminderEnabled ?? false,
      dailyReminderTime: settings?.dailyReminderTime ?? '',
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
        await settingsDto.updateNotificationSettings({
          data: {
            notificationsEnabled: values.notificationsEnabled,
            customReminderEnabled: values.customReminderEnabled,
            dailyReminderTime: values.dailyReminderTime,
            incompleteReminderEnabled: values.incompleteReminderEnabled,
            skippedReminderEnabled: values.skippedReminderEnabled,
            scheduledReminderEnabled: values.scheduledReminderEnabled,
          },
        })

        // useListState の状態から habitNotifications を取得
        await Promise.all(
          habitNotifications.map((item) =>
            habitDto.updateHabitNotificationSetting({
              data: {
                habitId: item.habitId,
                notificationsEnabled: item.checked,
              },
            }),
          ),
        )

        notifications.show({
          title: '成功',
          message: '通知設定が更新されました',
          color: 'green',
        })

        await queryClient.invalidateQueries({ queryKey: [GET_USER_SETTINGS_CACHE_KEY] })
        form.resetDirty()
        await refetch()

        // ルートを無効化して再読み込み（habitNotifications が最新の habits から再計算される）
        router.invalidate()
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

        {habitNotifications.length > 0 && (
          <>
            <Divider my="md" />

            <Text size="md" fw={500}>
              習慣ごとの通知設定
            </Text>
            <Text size="sm" c="dimmed" mb="sm">
              通知を受け取りたい習慣を選択してください
            </Text>

            <Stack gap="xs">
              {habitNotifications.map((item, index) => {
                const isDisabled = !form.values.notificationsEnabled || isPending

                return (
                  <Checkbox.Card
                    key={item.habitId}
                    className={classes.checkboxCard}
                    radius="md"
                    checked={item.checked}
                    data-disabled={isDisabled || undefined}
                    onClick={() => {
                      if (isDisabled) return
                      habitNotificationsHandlers.setItemProp(index, 'checked', !item.checked)
                    }}
                  >
                    <Group wrap="nowrap" align="flex-start">
                      <Checkbox.Indicator
                        disabled={isDisabled}
                        style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                      />
                      <Box style={{ flex: 1 }}>
                        <Group gap="sm" align="center" wrap="nowrap" justify="space-between">
                          <Group gap="sm" align="center" wrap="nowrap">
                            <Box
                              className={classes.colorDot}
                              style={{
                                backgroundColor: getHabitColor(item.habitColor as HabitColor),
                              }}
                            />
                            <Text className={classes.habitName}>{item.habitName}</Text>
                          </Group>
                          <Badge
                            size="sm"
                            variant="light"
                            color={getPriorityConfig(item.habitPriority).color}
                            leftSection={getPriorityConfig(item.habitPriority).icon}
                          >
                            優先度: {getPriorityConfig(item.habitPriority).label}
                          </Badge>
                        </Group>
                        {item.habitDescription && (
                          <Text className={classes.habitDescription}>{item.habitDescription}</Text>
                        )}
                      </Box>
                    </Group>
                  </Checkbox.Card>
                )
              })}
            </Stack>
          </>
        )}

        <Button
          type="submit"
          loading={isPending}
          disabled={!form.isDirty() && !habitNotificationsChanged}
          fullWidth
          mt="md"
          leftSection={<IconDeviceFloppy size={18} />}
        >
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

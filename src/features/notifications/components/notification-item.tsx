import { ActionIcon, Badge, Group, Paper, Stack, Text } from '@mantine/core'
import { IconCheck, IconTrash } from '@tabler/icons-react'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import type { InferSelectModel } from 'drizzle-orm'
import type { habits, notifications as notificationsTable } from '~/db/schema'

dayjs.extend(utc)
dayjs.extend(timezone)

const typeLabels = {
  reminder: 'リマインダー',
  habit_incomplete: '未完了',
  habit_skipped: 'スキップ',
  habit_scheduled: '予定',
  achievement: '達成',
  streak: '継続',
  level_up: 'レベルアップ',
} as const satisfies Record<string, string>

const typeColors = {
  reminder: 'blue',
  habit_incomplete: 'yellow',
  habit_skipped: 'orange',
  habit_scheduled: 'grape',
  achievement: 'green',
  streak: 'teal',
  level_up: 'violet',
} as const satisfies Record<string, string>

type NotificationItemProps = {
  notification: InferSelectModel<typeof notificationsTable> &
    Partial<Record<'habit', Pick<InferSelectModel<typeof habits>, 'id' | 'name' | 'color'> | null>>
  onMarkAsRead: (id: InferSelectModel<typeof notificationsTable>['id']) => void
  onDelete: (id: InferSelectModel<typeof notificationsTable>['id']) => void
}

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const isRead = notification.readAt !== null

  // Parse the createdAt as UTC and convert to JST
  const createdAtJST = dayjs.utc(notification.createdAt).tz('Asia/Tokyo')

  return (
    <Paper
      p="sm"
      withBorder
      radius="md"
      style={{
        backgroundColor: isRead ? undefined : 'var(--mantine-color-blue-0)',
        borderColor: isRead ? 'var(--mantine-color-gray-3)' : 'var(--mantine-color-blue-3)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
      styles={{
        root: {
          '&:hover': {
            backgroundColor: isRead ? 'var(--mantine-color-gray-0)' : 'var(--mantine-color-blue-1)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(-1px)',
          },
        },
      }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
        <Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
          <Group gap="xs" wrap="wrap">
            <Badge
              size="sm"
              color={typeColors[notification.type ?? 'reminder'] || 'gray'}
              variant={isRead ? 'light' : 'filled'}
            >
              {typeLabels[notification.type ?? 'reminder'] || notification.type}
            </Badge>
            {notification.habit && (
              <Badge size="sm" color={notification.habit.color ?? 'blue'} variant="dot" tt="none">
                {notification.habit.name}
              </Badge>
            )}
          </Group>

          <Text size="sm" fw={isRead ? 500 : 600} lineClamp={2}>
            {notification.title}
          </Text>

          <Text size="xs" c="dimmed" lineClamp={2}>
            {notification.message}
          </Text>

          <Text size="xs" c="dimmed" style={{ opacity: 0.7 }}>
            {createdAtJST.format('YYYY/MM/DD HH:mm')}
          </Text>
        </Stack>

        <Group gap={4}>
          {!isRead && (
            <ActionIcon
              variant="light"
              color="blue"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onMarkAsRead(notification.id)
              }}
              title="既読にする"
            >
              <IconCheck size={16} />
            </ActionIcon>
          )}
          <ActionIcon
            variant="light"
            color="red"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(notification.id)
            }}
            title="削除"
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Group>
    </Paper>
  )
}

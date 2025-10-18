import { ActionIcon, Badge, Group, Paper, Stack, Text, Tooltip } from '@mantine/core'
import { IconCheck, IconExternalLink, IconTrash } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
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
  habit_scheduled: '予定中',
  achievement: '達成',
} as const satisfies Record<string, string>

const typeColors = {
  reminder: 'blue',
  habit_incomplete: 'yellow',
  habit_skipped: 'orange',
  habit_scheduled: 'red',
  achievement: 'green',
} as const satisfies Record<string, string>

const HABIT_DETAIL_NOTIFICATION_TYPES = [
  'habit_incomplete',
  'habit_skipped',
  'habit_scheduled',
  'achievement',
] as const satisfies readonly InferSelectModel<typeof notificationsTable>['type'][]

function getNotificationLink(
  notification: Pick<InferSelectModel<typeof notificationsTable>, 'type'> &
    Partial<Record<'habit', Pick<InferSelectModel<typeof habits>, 'id'> | null>>,
) {
  if (
    notification.habit?.id &&
    notification.type &&
    HABIT_DETAIL_NOTIFICATION_TYPES.includes(
      notification.type as (typeof HABIT_DETAIL_NOTIFICATION_TYPES)[number],
    )
  ) {
    return `/habits/${notification.habit.id}`
  }

  return '/habits'
}

function getNotificationLinkText(type: InferSelectModel<typeof notificationsTable>['type']) {
  if (
    HABIT_DETAIL_NOTIFICATION_TYPES.includes(
      type as (typeof HABIT_DETAIL_NOTIFICATION_TYPES)[number],
    )
  ) {
    return '習慣を確認'
  }

  return '習慣一覧へ'
}

type NotificationItemProps = {
  notification: InferSelectModel<typeof notificationsTable> &
    Partial<Record<'habit', Pick<InferSelectModel<typeof habits>, 'id' | 'name' | 'color'> | null>>
  onMarkAsRead: (id: InferSelectModel<typeof notificationsTable>['id']) => void
  onDelete: (id: InferSelectModel<typeof notificationsTable>['id']) => void
  onNavigate?: () => void
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onNavigate,
}: NotificationItemProps) {
  const isRead = notification.readAt !== null

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
      }}
      styles={{
        root: {
          '&:hover': {
            backgroundColor: isRead ? 'var(--mantine-color-gray-0)' : 'var(--mantine-color-blue-1)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          },
        },
      }}
    >
      <Stack gap="xs">
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
          </Stack>

          <Group gap={4}>
            {!isRead && (
              <Tooltip label="既読にする" position="left">
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
              </Tooltip>
            )}
            <Tooltip label="削除" position="left">
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
            </Tooltip>
          </Group>
        </Group>

        <Group justify="space-between" align="center" wrap="nowrap" gap="sm">
          <Text size="xs" c="dimmed" style={{ opacity: 0.7 }}>
            {createdAtJST.format('YYYY/MM/DD HH:mm')}
          </Text>
          <Link
            to={getNotificationLink(notification)}
            className="flex items-center gap-1 text-blue-600 text-xs hover:underline"
            onClick={() => {
              if (!isRead) {
                onMarkAsRead(notification.id)
              }

              setTimeout(() => {
                onNavigate?.()
              }, 500)
            }}
          >
            {getNotificationLinkText(notification.type)}
            <IconExternalLink size={14} />
          </Link>
        </Group>
      </Stack>
    </Paper>
  )
}

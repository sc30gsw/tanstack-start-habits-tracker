import { ActionIcon, Button, Group, Popover, ScrollArea, Stack, Text } from '@mantine/core'
import { IconBell, IconBellOff, IconCheck, IconTrash } from '@tabler/icons-react'
import { Suspense, useState } from 'react'
import { NotificationItem } from '~/features/notifications/components/notification-item'
import { useNotifications } from '~/features/notifications/hooks/use-notifications'

export function NotificationPopover() {
  const [opened, setOpened] = useState(false)
  const { unreadCount } = useNotifications()

  return (
    <Popover
      width={380}
      position="bottom"
      shadow="xl"
      opened={opened}
      onChange={setOpened}
      offset={8}
      withArrow
      arrowSize={12}
      transitionProps={{ transition: 'pop', duration: 200 }}
    >
      <Popover.Target>
        <ActionIcon variant="subtle" size="lg" onClick={() => setOpened((o) => !o)} pos="relative">
          <IconBell size={20} />
          {unreadCount > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 2,
                right: 2,
                backgroundColor: 'var(--mantine-color-red-6)',
                color: 'white',
                borderRadius: '50%',
                width: 18,
                height: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 600,
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </ActionIcon>
      </Popover.Target>

      <Popover.Dropdown p={0} style={{ border: '1px solid var(--mantine-color-gray-3)' }}>
        <Suspense fallback={<NotificationPopoverLoading />}>
          <NotificationPopoverContent />
        </Suspense>
      </Popover.Dropdown>
    </Popover>
  )
}

function NotificationPopoverContent() {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllReadNotifications,
  } = useNotifications()

  const hasUnread = notifications.some((n) => n.readAt === null)
  const hasRead = notifications.some((n) => n.readAt !== null)

  if (notifications.length === 0) {
    return (
      <Stack p="md" align="center" gap="xs">
        <IconBellOff size={48} style={{ opacity: 0.3 }} />
        <Text size="sm" c="dimmed">
          通知はありません
        </Text>
      </Stack>
    )
  }

  return (
    <Stack gap={0}>
      <Group
        justify="space-between"
        p="md"
        pb="xs"
        style={{
          borderBottom: '1px solid var(--mantine-color-gray-2)',
          backgroundColor: 'var(--mantine-color-gray-0)',
        }}
      >
        <Text size="sm" fw={600} c="dark">
          通知
        </Text>
        <Group gap="xs">
          {hasUnread && (
            <Button
              variant="subtle"
              size="compact-xs"
              leftSection={<IconCheck size={14} />}
              onClick={async () => {
                await markAllAsRead()
              }}
            >
              すべて既読
            </Button>
          )}
          {hasRead && (
            <Button
              variant="subtle"
              size="compact-xs"
              color="red"
              leftSection={<IconTrash size={14} />}
              onClick={async () => {
                await deleteAllReadNotifications()
              }}
            >
              既読を削除
            </Button>
          )}
        </Group>
      </Group>

      <ScrollArea h={450} type="auto">
        <Stack gap="xs" p="sm">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
            />
          ))}
        </Stack>
      </ScrollArea>
    </Stack>
  )
}

function NotificationPopoverLoading() {
  return (
    <Stack p="md" align="center" gap="xs">
      <Text size="sm" c="dimmed">
        読み込み中...
      </Text>
    </Stack>
  )
}

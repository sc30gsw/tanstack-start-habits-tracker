import {
  ActionIcon,
  Box,
  Button,
  Group,
  Paper,
  Popover,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core'
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
            <Box
              pos="absolute"
              top={2}
              right={2}
              bg="red.6"
              c="white"
              style={{
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
            </Box>
          )}
        </ActionIcon>
      </Popover.Target>

      <Popover.Dropdown p={0} style={{ border: '1px solid var(--mantine-color-gray-3)' }}>
        <Suspense fallback={<NotificationPopoverLoading />}>
          <NotificationPopoverContent onClose={() => setOpened(false)} />
        </Suspense>
      </Popover.Dropdown>
    </Popover>
  )
}

function NotificationPopoverContent({ onClose }: Record<'onClose', () => void>) {
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
              onNavigate={onClose}
            />
          ))}
        </Stack>
      </ScrollArea>
    </Stack>
  )
}

function NotificationPopoverLoading() {
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
        <Skeleton height={20} width={60} />
        <Group gap="xs">
          <Skeleton height={24} width={100} />
        </Group>
      </Group>

      <ScrollArea h={450} type="auto">
        <Stack gap="xs" p="sm">
          {Array.from({ length: 3 }).map((_, index) => (
            <Paper
              key={index}
              p="sm"
              withBorder
              radius="md"
              style={{
                borderColor: 'var(--mantine-color-gray-3)',
              }}
            >
              <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
                <Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
                  <Group gap="xs" wrap="wrap">
                    <Skeleton height={22} width={80} radius="sm" />
                    <Skeleton height={22} width={100} radius="sm" />
                  </Group>

                  <Group gap="xs" align="center" wrap="nowrap">
                    <Skeleton height={18} style={{ flex: 1 }} />
                    <Skeleton height={16} width={80} />
                  </Group>

                  <Skeleton height={16} width="100%" />
                  <Skeleton height={16} width="60%" />

                  <Skeleton height={14} width={120} />
                </Stack>

                <Group gap={4}>
                  <Skeleton height={28} width={28} circle />
                  <Skeleton height={28} width={28} circle />
                </Group>
              </Group>
            </Paper>
          ))}
        </Stack>
      </ScrollArea>
    </Stack>
  )
}

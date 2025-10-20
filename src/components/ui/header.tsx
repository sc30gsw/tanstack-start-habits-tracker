import { AppShell, Avatar, Button, Group, Menu, Text, Tooltip, useMediaQuery } from '@mantine/core'
import {
  IconChecklist,
  IconClock,
  IconCreditCard,
  IconHeadphones,
  IconHome,
  IconList,
  IconListDetails,
  IconLogin,
  IconLogout,
  IconRocket,
  IconSettings,
  IconUserPlus,
} from '@tabler/icons-react'
import { getRouteApi, Link, useLocation } from '@tanstack/react-router'
import { Suspense, useEffect, useRef, useState } from 'react'
import { NotificationPopover } from '~/features/notifications/components/notification-popover'
import { HabitSelectorPopover } from '~/features/root/components/habit-selector-popover'
import { StopwatchModal } from '~/features/root/components/stopwatch-modal'
import { ThemeToggle } from '~/features/theme/components/theme-toggle'
import { authClient } from '~/lib/auth-client'

function HabitDetailsMenuItem() {
  const [opened, setOpened] = useState(false)
  const [targetElement, setTargetElement] = useState<HTMLButtonElement | null>(null)
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const wasDesktopRef = useRef(isDesktop)

  useEffect(() => {
    if (wasDesktopRef.current !== isDesktop) {
      setOpened(false)
      wasDesktopRef.current = isDesktop
    }
  }, [isDesktop])

  return (
    <>
      <Menu.Item
        leftSection={<IconListDetails size={14} style={{ color: 'var(--mantine-color-cyan-6)' }} />}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()

          setTargetElement(e.currentTarget)
          setOpened(true)
        }}
        closeMenuOnClick={false}
      >
        習慣詳細
      </Menu.Item>
      {targetElement && (
        <HabitSelectorPopover
          opened={opened}
          onClose={() => setOpened(false)}
          target={targetElement}
        />
      )}
    </>
  )
}

export function Header() {
  const routeApi = getRouteApi('__root__')
  const navigate = routeApi.useNavigate()
  const location = useLocation()

  const { data: session } = authClient.useSession()

  return (
    <>
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Text component={Link} size="xl" fw={700} c="blue" to="/">
            Track
          </Text>

          {/* デスクトップナビゲーション */}
          <Group gap="md" visibleFrom="sm">
            {session ? (
              <>
                <Button
                  component={Link}
                  to="/"
                  variant="subtle"
                  size="sm"
                  leftSection={<IconHome size={16} />}
                >
                  ホーム
                </Button>

                <Menu shadow="md" width={220}>
                  <Menu.Target>
                    <Button variant="subtle" size="sm" leftSection={<IconChecklist size={16} />}>
                      習慣管理
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label c="dimmed">習慣機能</Menu.Label>
                    <Menu.Item
                      leftSection={
                        <IconList size={14} style={{ color: 'var(--mantine-color-blue-6)' }} />
                      }
                      component={Link}
                      to="/habits"
                      search={
                        {
                          habitFilter: 'all',
                          habitSort: 'all',
                        } as any
                      }
                    >
                      習慣一覧
                    </Menu.Item>
                    <HabitDetailsMenuItem />
                    <Menu.Item
                      leftSection={
                        <IconClock size={14} style={{ color: 'var(--mantine-color-green-6)' }} />
                      }
                      onClick={() => {
                        navigate({
                          to: location.pathname,
                          search: (prev) => ({
                            ...prev,
                            stopwatchOpen: true,
                          }),
                        })
                      }}
                    >
                      習慣を記録
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>

                <Button
                  component={Link}
                  to="/focus"
                  variant="subtle"
                  size="sm"
                  leftSection={<IconHeadphones size={16} />}
                >
                  Focus
                </Button>
                <Button
                  component={Link}
                  to="/checkout"
                  variant="subtle"
                  size="sm"
                  leftSection={<IconRocket size={16} />}
                >
                  プラン
                </Button>

                <NotificationPopover />

                <ThemeToggle />

                <Menu shadow="md" width={200}>
                  <Menu.Target>
                    <Button
                      variant="subtle"
                      size="sm"
                      leftSection={
                        <Avatar
                          src={session.user.image}
                          alt={session.user.name}
                          name={session.user.name}
                          color="initials"
                          allowedInitialsColors={['blue']}
                          size={24}
                          radius="xl"
                        />
                      }
                    >
                      <Text truncate maw={120}>
                        {session.user.name || session.user.email}
                      </Text>
                    </Button>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Label>アカウント</Menu.Label>
                    <Menu.Item
                      leftSection={<IconSettings size={14} />}
                      component={Link}
                      to="/settings/profile"
                    >
                      設定
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconCreditCard size={14} />}
                      component={Link}
                      to="/customer/portal"
                    >
                      サブスクリプション
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      leftSection={<IconLogout size={14} />}
                      color="red"
                      onClick={() => {
                        navigate({ to: '/auth/sign-out' })
                      }}
                    >
                      サインアウト
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Button
                  component={Link}
                  to="/auth/sign-in"
                  variant="subtle"
                  size="sm"
                  leftSection={<IconLogin size={16} />}
                >
                  ログイン
                </Button>
                <Button
                  component={Link}
                  to="/auth/sign-up"
                  size="sm"
                  leftSection={<IconUserPlus size={16} />}
                >
                  新規登録
                </Button>
              </>
            )}
          </Group>

          {/* モバイルナビゲーション */}
          <Group hiddenFrom="sm">
            {session && (
              <>
                {/* モバイル用習慣メニュー */}
                <Menu shadow="md" width={220}>
                  <Menu.Target>
                    <Tooltip label="習慣管理" withArrow>
                      <Button variant="light" size="xs" color="blue">
                        <IconChecklist size={16} />
                      </Button>
                    </Tooltip>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label c="dimmed">習慣機能</Menu.Label>
                    <Menu.Item
                      leftSection={
                        <IconList size={14} style={{ color: 'var(--mantine-color-blue-6)' }} />
                      }
                      component={Link}
                      to="/habits"
                      search={
                        {
                          habitFilter: 'all',
                          habitSort: 'all',
                        } as any
                      }
                    >
                      習慣一覧
                    </Menu.Item>
                    <HabitDetailsMenuItem />
                    <Menu.Item
                      leftSection={
                        <IconClock size={14} style={{ color: 'var(--mantine-color-green-6)' }} />
                      }
                      onClick={() => {
                        navigate({
                          to: location.pathname,
                          search: (prev) => ({
                            ...prev,
                            stopwatchOpen: true,
                          }),
                        })
                      }}
                    >
                      習慣を記録
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>

                <NotificationPopover />
                <ThemeToggle />
                <Menu shadow="md" width={200}>
                  <Menu.Target>
                    <Avatar
                      src={session.user.image}
                      alt={session.user.name}
                      name={session.user.name}
                      color="initials"
                      allowedInitialsColors={['blue']}
                      size={32}
                      radius="xl"
                      style={{ cursor: 'pointer' }}
                    />
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>{session.user.name || session.user.email}</Menu.Label>
                    <Menu.Divider />
                    <Menu.Item component={Link} to="/" leftSection={<IconHome size={14} />}>
                      ホーム
                    </Menu.Item>
                    <Menu.Item
                      component={Link}
                      to="/focus"
                      leftSection={<IconHeadphones size={14} />}
                    >
                      Focus
                    </Menu.Item>
                    <Menu.Item
                      component={Link}
                      to="/checkout"
                      leftSection={<IconRocket size={14} />}
                    >
                      プラン
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      leftSection={<IconSettings size={14} />}
                      component={Link}
                      to="/settings/profile"
                    >
                      設定
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconCreditCard size={14} />}
                      component={Link}
                      to="/customer/portal"
                    >
                      サブスクリプション
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      leftSection={<IconLogout size={14} />}
                      color="red"
                      onClick={() => {
                        navigate({ to: '/auth/sign-out' })
                      }}
                    >
                      サインアウト
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </>
            )}
            {!session && (
              <Group gap="xs">
                <ThemeToggle />
                <Button
                  component={Link}
                  to="/auth/sign-in"
                  variant="subtle"
                  size="xs"
                  leftSection={<IconLogin size={14} />}
                >
                  ログイン
                </Button>
                <Button
                  component={Link}
                  to="/auth/sign-up"
                  size="xs"
                  leftSection={<IconUserPlus size={14} />}
                >
                  登録
                </Button>
              </Group>
            )}
          </Group>
        </Group>
      </AppShell.Header>
      <Suspense fallback={null}>
        <StopwatchModal />
      </Suspense>
    </>
  )
}

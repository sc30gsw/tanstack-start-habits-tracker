import { AppShell, Avatar, Button, Group, Menu, Text } from '@mantine/core'
import { IconClock, IconCreditCard, IconLogout, IconSettings } from '@tabler/icons-react'
import { getRouteApi, Link, useLocation } from '@tanstack/react-router'
import { Suspense } from 'react'
import { StopwatchModal } from '~/components/ui/stopwatch-modal'
import { ThemeToggle } from '~/features/theme/components/theme-toggle'
import { authClient } from '~/lib/auth-client'

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
                <Button component={Link} to="/" variant="subtle" size="sm">
                  ホーム
                </Button>
                <Button
                  component={Link}
                  to="/habits"
                  search={
                    {
                      habitFilter: 'all',
                      habitSort: 'all',
                    } as any
                  }
                  variant="subtle"
                  size="sm"
                >
                  習慣管理
                </Button>
                <Button component={Link} to="/checkout" variant="subtle" size="sm">
                  プラン
                </Button>

                <Button
                  variant="light"
                  size="sm"
                  leftSection={<IconClock size={16} />}
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
                  習慣を記録する
                </Button>

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
                      to="/settings"
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
                <Button component={Link} to="/auth/sign-in" variant="subtle" size="sm">
                  ログイン
                </Button>
                <Button component={Link} to="/auth/sign-up" size="sm">
                  新規登録
                </Button>
              </>
            )}
          </Group>

          {/* モバイルナビゲーション */}
          <Group hiddenFrom="sm">
            {session && (
              <>
                <Button
                  variant="light"
                  size="xs"
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
                  <IconClock size={16} />
                </Button>
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
                    <Menu.Item component={Link} to="/">
                      ホーム
                    </Menu.Item>
                    <Menu.Item
                      component={Link}
                      to="/habits"
                      search={
                        {
                          habitFilter: 'all',
                          habitSort: 'all',
                        } as any
                      }
                    >
                      習慣管理
                    </Menu.Item>
                    <Menu.Item component={Link} to="/checkout">
                      プラン
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      leftSection={<IconSettings size={14} />}
                      component={Link}
                      to="/settings"
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
                <Button component={Link} to="/auth/sign-in" variant="subtle" size="xs">
                  ログイン
                </Button>
                <Button component={Link} to="/auth/sign-up" size="xs">
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

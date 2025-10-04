import { createRootRoute, HeadContent, Outlet, redirect, Scripts } from '@tanstack/react-router'

import appCss from '../styles.css?url'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

import {
  AppShell,
  Avatar,
  Button,
  ColorSchemeScript,
  Group,
  MantineProvider,
  Menu,
  Text,
} from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { IconCreditCard, IconLogout, IconSettings } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { ClientOnly } from '~/components/client-only'
import { QueryProvider } from '~/components/providers/query-provider'
import { getCurrentUser, getCurrentUserPasskey } from '~/features/auth/server/server-functions'
import { searchSchema } from '~/features/habits/types/schemas/search-params'
import { ThemeToggle } from '~/features/theme/components/theme-toggle'
import { authClient } from '~/lib/auth-client'
import { theme } from '~/theme'

export const Route = createRootRoute({
  validateSearch: searchSchema.pick({ skip: true }),
  beforeLoad: async ({ location, search }) => {
    // 認証が不要なパブリックルート
    const result = await getCurrentUser()

    const publicRoutes = [
      '/auth/sign-in',
      '/auth/sign-up',
      '/auth/sign-out',
      '/auth/passkey-setup',
    ] as const satisfies readonly string[]

    const isPublicRoute = publicRoutes.includes(location.pathname as (typeof publicRoutes)[number])

    if (isPublicRoute) {
      return { session: result.user }
    }

    // セッションチェック
    if (!result.success) {
      throw redirect({
        to: '/auth/sign-in',
      })
    }

    const { success, passkey } = await getCurrentUserPasskey()

    if (success && !passkey && !search.skip) {
      throw redirect({ to: '/auth/passkey-setup' })
    }

    return { session: result.user }
  },

  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Track - 習慣追跡アプリ',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  component: RootComponent,
  shellComponent: RootDocument,
})

function RootComponent() {
  const { data: session } = authClient.useSession()
  const navigate = Route.useNavigate()

  return (
    <ClientOnly>
      <AppShell header={{ height: 60 }} padding="md">
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between">
            <Text component={Link} size="xl" fw={700} c="blue" to="/">
              Track
            </Text>
            <Group gap="md">
              {session ? (
                <>
                  <Button component={Link} to="/" variant="subtle" size="sm">
                    ホーム
                  </Button>
                  <Button component={Link} to="/habits" variant="subtle" size="sm">
                    習慣管理
                  </Button>
                  <Button component={Link} to="/checkout" variant="subtle" size="sm">
                    プラン
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
                            size={32}
                            radius="xl"
                          />
                        }
                      >
                        {session.user.name}
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
                        サブスクリプション管理
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
          </Group>
        </AppShell.Header>

        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
      </AppShell>
    </ClientOnly>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <HeadContent />
        <ColorSchemeScript />
      </head>
      <body>
        <QueryProvider>
          <MantineProvider theme={theme}>
            <ModalsProvider>
              <Notifications />
              {children}
            </ModalsProvider>
          </MantineProvider>
        </QueryProvider>
        {/* {(import.meta.env.DEV || process.env.NODE_ENV === 'development') && (
          <TanstackDevtools
            config={{
              position: 'bottom-left',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        )} */}
        <Scripts />
      </body>
    </html>
  )
}

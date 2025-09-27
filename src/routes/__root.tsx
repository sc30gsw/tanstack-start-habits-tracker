import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'

import appCss from '../styles.css?url'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

import { AppShell, Button, ColorSchemeScript, Group, MantineProvider, Text } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { Link } from '@tanstack/react-router'
import { ThemeToggle } from '~/features/theme/components/theme-toggle'
import { theme } from '~/theme'

export const Route = createRootRoute({
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
        title: 'Trak - 習慣追跡アプリ',
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
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Text size="xl" fw={700} c="blue">
            Trak
          </Text>
          <Group gap="md">
            <Button component={Link} to="/" variant="subtle" size="sm">
              ホーム
            </Button>
            <Button component={Link} to="/habits" variant="subtle" size="sm">
              習慣管理
            </Button>
            <ThemeToggle />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
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
        <MantineProvider theme={theme}>
          <ModalsProvider>
            <Notifications />
            {children}
          </ModalsProvider>
        </MantineProvider>
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

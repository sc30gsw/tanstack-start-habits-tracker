import { createRootRoute, HeadContent, Outlet, redirect, Scripts } from '@tanstack/react-router'

import appCss from '../styles.css?url'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

import { AppShell, ColorSchemeScript, MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { ClientOnly } from '~/components/client-only'
import { QueryProvider } from '~/components/providers/query-provider'
import { Header } from '~/components/ui/header'
import { getCurrentUser, getCurrentUserPasskey } from '~/features/auth/server/server-functions'
import { searchSchema } from '~/features/habits/types/schemas/search-params'
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
  return (
    <ClientOnly>
      <AppShell header={{ height: 60 }} padding="md">
        <Header />

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

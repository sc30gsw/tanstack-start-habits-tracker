import { AppShell, Container, NavLink, Stack, Text } from '@mantine/core'
import {
  type Icon,
  IconBell,
  IconMoon,
  type IconProps,
  IconTrash,
  IconUser,
} from '@tabler/icons-react'
import { Link, useLocation } from '@tanstack/react-router'
import type { ForwardRefExoticComponent, ReactNode, RefAttributes } from 'react'

const NAV_ITEMS = [
  {
    href: '/settings/profile',
    label: 'プロフィール',
    icon: IconUser,
  },
  {
    href: '/settings/theme',
    label: 'テーマ',
    icon: IconMoon,
  },
  {
    href: '/settings/notifications',
    label: '通知',
    icon: IconBell,
  },
  {
    href: '/settings/account',
    label: 'アカウント',
    icon: IconTrash,
  },
] as const satisfies readonly Record<
  string,
  string | ForwardRefExoticComponent<IconProps & RefAttributes<Icon>> | boolean
>[]

export function SettingsLayout({ children }: Record<'children', ReactNode>) {
  const location = useLocation()
  const currentPath = location.pathname

  return (
    <AppShell navbar={{ width: 250, breakpoint: 'sm' }} padding="md">
      <AppShell.Navbar p="md">
        <Stack gap="xs">
          <Text size="xs" fw={600} c="dimmed" tt="uppercase">
            設定
          </Text>
          {NAV_ITEMS.map((item) => {
            const isActive = currentPath === item.href

            return (
              <NavLink
                key={item.href}
                component={Link}
                to={item.href}
                label={item.label}
                leftSection={<item.icon size={20} stroke={1.5} />}
                active={isActive}
                variant="filled"
              />
            )
          })}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="md">{children}</Container>
      </AppShell.Main>
    </AppShell>
  )
}

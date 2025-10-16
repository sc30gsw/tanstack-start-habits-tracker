import { Accordion, Box, Container, Group, NavLink, Paper, Stack, Text } from '@mantine/core'
import {
  type Icon,
  IconBell,
  IconChevronDown,
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

  // 現在のページのラベルを取得
  const currentItem = NAV_ITEMS.find((item) => item.href === currentPath)
  const currentLabel = currentItem?.label || '設定'

  return (
    <Container size="xl" py="md">
      <Group align="flex-start" gap="md" wrap="nowrap">
        {/* サイドバーナビゲーション（デスクトップ） */}
        <Paper
          withBorder
          p="md"
          style={{
            width: '250px',
            minWidth: '250px',
            position: 'sticky',
            top: '80px',
          }}
          visibleFrom="md"
        >
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
        </Paper>

        {/* メインコンテンツエリア */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          {/* モバイル用ナビゲーション（アコーディオン） */}
          <Accordion
            mb="md"
            hiddenFrom="md"
            variant="filled"
            chevron={<IconChevronDown size={16} />}
          >
            <Accordion.Item value="navigation">
              <Accordion.Control icon={currentItem?.icon && <currentItem.icon size={18} />}>
                {currentLabel}
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="xs">
                  {NAV_ITEMS.map((item) => {
                    const isActive = currentPath === item.href

                    return (
                      <NavLink
                        key={item.href}
                        component={Link}
                        to={item.href}
                        label={item.label}
                        leftSection={<item.icon size={18} stroke={1.5} />}
                        active={isActive}
                        variant="filled"
                      />
                    )
                  })}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>

          {/* ページコンテンツ */}
          {children}
        </Box>
      </Group>
    </Container>
  )
}

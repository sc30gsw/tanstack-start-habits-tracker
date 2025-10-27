import { ActionIcon, Text, useMantineColorScheme } from '@mantine/core'
import { IconChecklist, IconClock, IconHome, IconListDetails } from '@tabler/icons-react'
import { getRouteApi, Link, useLocation } from '@tanstack/react-router'
import LiquidGlass from 'liquid-glass-react'
import { useRef, useState } from 'react'
import { HabitSelectorPopover } from '~/features/root/components/habit-selector-popover'
import { authClient } from '~/lib/auth-client'
import type { FileRouteTypes } from '~/routeTree.gen'

export function BottomNavBar() {
  const routeApi = getRouteApi('__root__')
  const navigate = routeApi.useNavigate()
  const location = useLocation()
  const search = routeApi.useSearch()

  const [opened, setOpened] = useState(false)

  const targetRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { colorScheme } = useMantineColorScheme()

  const { data: session } = authClient.useSession()

  if (!session?.user) {
    return null
  }

  const isActive = (path: FileRouteTypes['fullPaths'] | 'details' | 'record') => {
    switch (path) {
      case 'details': {
        return location.pathname.startsWith('/habits/')
      }

      case 'record': {
        return search?.stopwatchOpen === true
      }

      default: {
        return location.pathname === path
      }
    }
  }

  const isDark = colorScheme === 'dark'

  return (
    <div
      ref={containerRef}
      className="fixed right-0 bottom-0 left-80 z-50 flex items-center justify-center"
      style={{
        padding: 'max(env(safe-area-inset-bottom), 8px)',
      }}
    >
      <LiquidGlass
        displacementScale={20}
        blurAmount={0.2}
        saturation={100}
        elasticity={0.15}
        cornerRadius={100}
        mode="standard"
        padding="12px 20px"
        mouseContainer={containerRef}
        overLight={!isDark}
      >
        <div className="flex items-center gap-6">
          {/* ホーム */}
          <div
            style={{
              minWidth: '52px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ActionIcon component={Link} to="/" variant="transparent" size="sm">
              <IconHome
                size={20}
                stroke={1.5}
                style={{ color: isActive('/') ? 'var(--mantine-color-blue-6)' : 'inherit' }}
              />
            </ActionIcon>
            <Text
              size="10px"
              fw={isActive('/') ? 600 : 400}
              c={isActive('/') ? 'blue.6' : isDark ? 'white' : 'dark'}
            >
              ホーム
            </Text>
          </div>

          {/* 習慣一覧 */}
          <div
            style={{
              minWidth: '52px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ActionIcon
              component={Link}
              to="/habits"
              search={{ habitFilter: 'all', habitSort: 'all' } as any}
              variant="transparent"
              size="sm"
            >
              <IconChecklist
                size={20}
                stroke={1.5}
                style={{
                  color: isActive('/habits') ? 'var(--mantine-color-blue-6)' : 'inherit',
                }}
              />
            </ActionIcon>
            <Text
              size="10px"
              fw={isActive('/habits') ? 600 : 400}
              c={isActive('/habits') ? 'blue.6' : isDark ? 'white' : 'dark'}
            >
              習慣
            </Text>
          </div>

          {/* 記録 */}
          <div
            style={{
              minWidth: '52px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ActionIcon
              variant="transparent"
              size="sm"
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
              <IconClock
                size={20}
                stroke={1.5}
                style={{
                  color: isActive('record') ? 'var(--mantine-color-blue-6)' : 'inherit',
                }}
              />
            </ActionIcon>
            <Text
              size="10px"
              fw={isActive('record') ? 600 : 400}
              c={isActive('record') ? 'blue.6' : isDark ? 'white' : 'dark'}
            >
              記録
            </Text>
          </div>

          {/* 詳細 */}
          <div
            style={{
              minWidth: '52px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ActionIcon
              ref={targetRef}
              variant="transparent"
              size="sm"
              onClick={() => setOpened(true)}
            >
              <IconListDetails
                size={20}
                stroke={1.5}
                style={{
                  color: isActive('details') ? 'var(--mantine-color-blue-6)' : 'inherit',
                }}
              />
            </ActionIcon>
            <Text
              size="10px"
              fw={isActive('details') ? 600 : 400}
              c={isActive('details') ? 'blue.6' : isDark ? 'white' : 'dark'}
            >
              詳細
            </Text>
          </div>
        </div>
      </LiquidGlass>

      <HabitSelectorPopover
        opened={opened}
        onClose={() => setOpened(false)}
        target={targetRef.current}
        onNavigate={() => {
          setOpened(false)
        }}
      />
    </div>
  )
}

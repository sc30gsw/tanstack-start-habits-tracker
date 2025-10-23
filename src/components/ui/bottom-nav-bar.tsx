import { ActionIcon, Text } from '@mantine/core'
import { IconClock, IconHome, IconList, IconListDetails } from '@tabler/icons-react'
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

  const inactiveColor = 'rgba(60, 60, 67, 0.6)'

  return (
    <div
      ref={containerRef}
      className="fixed right-0 bottom-0 left-80 z-50 flex items-center justify-center"
      style={{
        padding: '8px 16px max(env(safe-area-inset-bottom), 8px)',
      }}
    >
      <div className="flex w-full items-center justify-center">
        <LiquidGlass
          displacementScale={64}
          blurAmount={0.1}
          saturation={130}
          aberrationIntensity={2}
          elasticity={0.35}
          cornerRadius={100}
          mode="prominent"
          overLight={false}
          padding="12px 20px"
          mouseContainer={containerRef}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
            border: '0.5px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50px',
          }}
        >
          <div className="flex items-center justify-center gap-6">
            {/* ホーム */}
            <div className="flex min-w-15 flex-col items-center gap-1">
              <ActionIcon component={Link} to="/" variant="transparent" size="lg" radius="xl">
                <IconHome
                  size={24}
                  stroke={2}
                  style={{
                    color: isActive('/') ? 'var(--mantine-color-blue-6)' : inactiveColor,
                  }}
                />
              </ActionIcon>
              <Text
                size="11px"
                fw={isActive('/') ? 700 : 500}
                style={{
                  color: isActive('/') ? 'var(--mantine-color-blue-6)' : inactiveColor,
                }}
              >
                ホーム
              </Text>
            </div>

            {/* 習慣一覧 */}
            <div className="flex min-w-15 flex-col items-center gap-1">
              <ActionIcon
                component={Link}
                to="/habits"
                search={{ habitFilter: 'all', habitSort: 'all' } as any}
                variant="transparent"
                size="lg"
                radius="xl"
              >
                <IconList
                  size={24}
                  stroke={2}
                  style={{
                    color: isActive('/habits') ? 'var(--mantine-color-blue-6)' : inactiveColor,
                  }}
                />
              </ActionIcon>
              <Text
                size="11px"
                fw={isActive('/habits') ? 700 : 500}
                style={{
                  color: isActive('/habits') ? 'var(--mantine-color-blue-6)' : inactiveColor,
                }}
              >
                習慣
              </Text>
            </div>

            {/* 習慣詳細 */}
            <div className="flex min-w-15 flex-col items-center gap-1">
              <ActionIcon
                ref={targetRef}
                variant="transparent"
                size="lg"
                radius="xl"
                onClick={() => setOpened(true)}
              >
                <IconListDetails
                  size={24}
                  stroke={2}
                  style={{
                    color: isActive('details') ? 'var(--mantine-color-blue-6)' : inactiveColor,
                  }}
                />
              </ActionIcon>
              <Text
                size="11px"
                fw={isActive('details') ? 700 : 500}
                style={{
                  color: isActive('details') ? 'var(--mantine-color-blue-6)' : inactiveColor,
                }}
              >
                詳細
              </Text>
            </div>

            {/* 習慣を記録 */}
            <div className="flex min-w-15 flex-col items-center gap-1">
              <ActionIcon
                variant="transparent"
                size="lg"
                radius="xl"
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
                  size={24}
                  stroke={2}
                  style={{
                    color: isActive('record') ? 'var(--mantine-color-blue-6)' : inactiveColor,
                  }}
                />
              </ActionIcon>
              <Text
                size="11px"
                fw={isActive('record') ? 700 : 500}
                style={{
                  color: isActive('record') ? 'var(--mantine-color-blue-6)' : inactiveColor,
                }}
              >
                記録
              </Text>
            </div>
          </div>
        </LiquidGlass>
      </div>

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

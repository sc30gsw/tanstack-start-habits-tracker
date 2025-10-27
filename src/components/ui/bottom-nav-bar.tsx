import { ActionIcon, Text, useMantineColorScheme } from '@mantine/core'
import { IconChecklist, IconClock, IconHome, IconListDetails } from '@tabler/icons-react'
import { getRouteApi, Link, useLocation } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { LiquidGlass } from '~/components/ui/liquid-glass'
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
      className="fixed right-0 bottom-0 left-0 z-50 flex items-center justify-center"
      style={{
        padding: 'max(env(safe-area-inset-bottom), 8px)',
      }}
    >
      {/* Liquid Glass Navigation */}
      <LiquidGlass padding="none">
        <div className="flex h-full items-stretch px-5">
          {/* ホーム */}
          <div
            className={`-ml-5 flex min-w-16 flex-1 flex-col items-center justify-center gap-1.5 rounded-lg py-2 pr-7 pl-10 transition-colors duration-200 ${
              isActive('/') ? (isDark ? 'bg-white/15' : 'bg-black/8') : 'bg-transparent'
            }`}
          >
            <ActionIcon component={Link} to="/" variant="transparent" size="lg">
              <IconHome
                size={24}
                stroke={1.5}
                className={isActive('/') ? 'text-blue-600' : isDark ? 'text-white' : 'text-black'}
              />
            </ActionIcon>
            <Text
              size="11px"
              fw={isActive('/') ? 600 : 400}
              c={isActive('/') ? 'blue.6' : isDark ? 'white' : 'dark'}
            >
              ホーム
            </Text>
          </div>

          {/* 習慣一覧 */}
          <div
            className={`flex min-w-16 flex-1 flex-col items-center justify-center gap-1.5 rounded-lg px-7 py-2 transition-colors duration-200 ${
              isActive('/habits') ? (isDark ? 'bg-white/15' : 'bg-black/8') : 'bg-transparent'
            }`}
          >
            <ActionIcon
              component={Link}
              to="/habits"
              search={{ habitFilter: 'all', habitSort: 'all' } as any}
              variant="transparent"
              size="lg"
            >
              <IconChecklist
                size={24}
                stroke={1.5}
                className={
                  isActive('/habits') ? 'text-blue-600' : isDark ? 'text-white' : 'text-black'
                }
              />
            </ActionIcon>
            <Text
              size="11px"
              fw={isActive('/habits') ? 600 : 400}
              c={isActive('/habits') ? 'blue.6' : isDark ? 'white' : 'dark'}
            >
              習慣
            </Text>
          </div>

          {/* 記録 */}
          <div
            className={`flex min-w-16 flex-1 flex-col items-center justify-center gap-1.5 rounded-lg px-7 py-2 transition-colors duration-200 ${
              isActive('record') ? (isDark ? 'bg-white/15' : 'bg-black/8') : 'bg-transparent'
            }`}
          >
            <ActionIcon
              variant="transparent"
              size="lg"
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
                stroke={1.5}
                className={
                  isActive('record') ? 'text-blue-600' : isDark ? 'text-white' : 'text-black'
                }
              />
            </ActionIcon>
            <Text
              size="11px"
              fw={isActive('record') ? 600 : 400}
              c={isActive('record') ? 'blue.6' : isDark ? 'white' : 'dark'}
            >
              記録
            </Text>
          </div>

          {/* 詳細 */}
          <div
            className={`-mr-5 flex min-w-16 flex-1 flex-col items-center justify-center gap-1.5 rounded-lg py-2 pr-12 pl-7 transition-colors duration-200 ${
              isActive('details') ? (isDark ? 'bg-white/15' : 'bg-black/8') : 'bg-transparent'
            }`}
          >
            <ActionIcon
              ref={targetRef}
              variant="transparent"
              size="lg"
              onClick={() => setOpened(true)}
            >
              <IconListDetails
                size={24}
                stroke={1.5}
                className={
                  isActive('details') ? 'text-blue-600' : isDark ? 'text-white' : 'text-black'
                }
              />
            </ActionIcon>
            <Text
              size="11px"
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

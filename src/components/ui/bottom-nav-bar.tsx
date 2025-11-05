import { Text, useMantineColorScheme } from '@mantine/core'
import { IconChecklist, IconClock, IconHome, IconListDetails } from '@tabler/icons-react'
import { getRouteApi, useLocation } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'
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
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
    height: 0,
    top: 0,
    opacity: 0,
  })

  const targetRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const navContainerRef = useRef<HTMLDivElement>(null)

  const homeRef = useRef<HTMLButtonElement>(null)
  const habitsRef = useRef<HTMLButtonElement>(null)
  const recordRef = useRef<HTMLButtonElement>(null)
  const detailsRef = useRef<HTMLDivElement>(null)

  const { colorScheme } = useMantineColorScheme()
  const { data: session } = authClient.useSession()

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

  const updateIndicator = useCallback((items: string[]) => {
    if (!navContainerRef.current || items.length === 0) {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }))

      return
    }

    const refs: React.RefObject<HTMLButtonElement | HTMLDivElement | null>[] = []
    for (const item of items) {
      switch (item) {
        case 'home':
          refs.push(homeRef)
          break

        case 'habits':
          refs.push(habitsRef)
          break

        case 'record':
          refs.push(recordRef)
          break

        case 'details':
          refs.push(detailsRef)
          break
      }
    }

    const validRefs = refs.filter((ref) => ref.current)

    if (validRefs.length === 0) {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }))

      return
    }

    const container = navContainerRef.current.getBoundingClientRect()
    const padding = 8
    const edgePadding = 16

    const firstElement = validRefs[0].current!.getBoundingClientRect()
    const lastElement = validRefs[validRefs.length - 1].current!.getBoundingClientRect()

    let left = firstElement.left - container.left - padding
    const right = lastElement.right - container.left + padding
    let width = right - left
    const height = firstElement.height + padding * 2
    const top = -padding

    if (items.includes('home')) {
      left = -padding // 左端を少し外側に
      const firstRelativeLeft = firstElement.left - container.left

      // 単一要素の場合は右側の余白も追加
      if (items.length === 1) {
        width = firstRelativeLeft + firstElement.width + edgePadding + padding
      } else {
        // 複数要素の場合は最後の要素まで
        width = right - left
      }
    }

    if (items.includes('details')) {
      const containerWidth = container.width
      const lastRelativeLeft = lastElement.left - container.left

      if (items.length === 1) {
        left = lastRelativeLeft - edgePadding
        width = containerWidth - left + padding
      } else {
        width = containerWidth - left + padding
      }
    }

    setIndicatorStyle({
      left,
      width,
      height,
      top,
      opacity: 1,
    })
  }, [])

  useEffect(() => {
    if (hoveredItem) {
      updateIndicator([hoveredItem])

      return
    }

    const activeItems: string[] = []

    switch (location.pathname) {
      case '/':
        activeItems.push('home')
        break

      case '/habits':
        activeItems.push('habits')
        break

      case '/record':
        activeItems.push('record')
        break

      case '/details':
        activeItems.push('details')
        break

      default:
        break
    }

    updateIndicator(activeItems)
  }, [hoveredItem, location.pathname, search, updateIndicator])

  if (!session?.user) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed right-0 bottom-0 left-0 z-50 flex items-center justify-center"
      style={{
        padding: 'max(env(safe-area-inset-bottom), 8px)',
      }}
    >
      {/* Liquid Glass Navigation */}
      <div className="pointer-events-auto">
        <LiquidGlass padding="none">
          <div ref={navContainerRef} className="relative flex h-full items-stretch gap-2 px-4">
            {/* Liquid Glass インジケーター */}
            {indicatorStyle.opacity > 0 && (
              <div
                className="pointer-events-none absolute transition-all duration-500 ease-out"
                style={{
                  left: `${indicatorStyle.left}px`,
                  top: `${indicatorStyle.top}px`,
                  width: `${indicatorStyle.width}px`,
                  height: `${indicatorStyle.height}px`,
                  opacity: indicatorStyle.opacity,
                  zIndex: 0,
                }}
              >
                <div
                  className="h-full w-full"
                  style={{
                    borderRadius: '20px',
                    backdropFilter: 'blur(32px) saturate(200%)',
                    WebkitBackdropFilter: 'blur(32px) saturate(200%)',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                    border: `2px solid ${isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'}`,
                    boxShadow: `
                    0px 12px 40px rgba(0, 0, 0, 0.25),
                    inset 0 0 0 1px ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.7)'},
                    0 0 20px ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}
                  `,
                    filter: 'blur(0.5px)',
                  }}
                />
              </div>
            )}

            {/* ホーム */}
            <button
              type="button"
              ref={homeRef}
              onMouseEnter={() => setHoveredItem('home')}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => navigate({ to: '/' })}
              className="relative z-10 flex min-w-20 flex-1 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-0 bg-transparent px-4 py-2 transition-colors duration-200"
            >
              <IconHome
                size={24}
                stroke={1.5}
                className={
                  isActive('/') || hoveredItem === 'home'
                    ? 'text-[#228be6]'
                    : isDark
                      ? 'text-white'
                      : 'text-black'
                }
              />
              <Text
                size="11px"
                fw={isActive('/') ? 600 : 400}
                c={isActive('/') || hoveredItem === 'home' ? 'blue.6' : isDark ? 'white' : 'dark'}
              >
                ホーム
              </Text>
            </button>

            {/* 習慣一覧 */}
            <button
              type="button"
              ref={habitsRef}
              onMouseEnter={() => setHoveredItem('habits')}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() =>
                navigate({ to: '/habits', search: { habitFilter: 'all', habitSort: 'all' } as any })
              }
              className="relative z-10 flex min-w-20 flex-1 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-0 bg-transparent px-4 py-2 transition-colors duration-200"
            >
              <IconChecklist
                size={24}
                stroke={1.5}
                className={
                  isActive('/habits') || hoveredItem === 'habits'
                    ? 'text-[#228be6]'
                    : isDark
                      ? 'text-white'
                      : 'text-black'
                }
              />
              <Text
                size="11px"
                fw={isActive('/habits') ? 600 : 400}
                c={
                  isActive('/habits') || hoveredItem === 'habits'
                    ? 'blue.6'
                    : isDark
                      ? 'white'
                      : 'dark'
                }
              >
                習慣
              </Text>
            </button>

            {/* 記録 */}
            <button
              type="button"
              ref={recordRef}
              onMouseEnter={() => setHoveredItem('record')}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => {
                navigate({
                  to: location.pathname,
                  search: (prev) => ({
                    ...prev,
                    stopwatchOpen: true,
                  }),
                })
              }}
              className="relative z-10 flex min-w-20 flex-1 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-0 bg-transparent px-4 py-2 transition-colors duration-200"
            >
              <IconClock
                size={24}
                stroke={1.5}
                className={
                  isActive('record') || hoveredItem === 'record'
                    ? 'text-[#228be6]'
                    : isDark
                      ? 'text-white'
                      : 'text-black'
                }
              />
              <Text
                size="11px"
                fw={isActive('record') ? 600 : 400}
                c={
                  isActive('record') || hoveredItem === 'record'
                    ? 'blue.6'
                    : isDark
                      ? 'white'
                      : 'dark'
                }
              >
                記録
              </Text>
            </button>

            {/* 詳細 */}
            <div
              role="button"
              tabIndex={0}
              ref={detailsRef}
              onMouseEnter={() => setHoveredItem('details')}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => setOpened(true)}
              onKeyUp={() => {}}
              className="relative z-10 flex min-w-20 flex-1 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-0 bg-transparent px-4 py-2 transition-colors duration-200"
            >
              <button type="button" ref={targetRef}>
                <IconListDetails
                  size={24}
                  stroke={1.5}
                  className={
                    isActive('details') || hoveredItem === 'details'
                      ? 'text-[#228be6]'
                      : isDark
                        ? 'text-white'
                        : 'text-black'
                  }
                />

                <Text
                  size="11px"
                  fw={isActive('details') ? 600 : 400}
                  c={
                    isActive('details') || hoveredItem === 'details'
                      ? 'blue.6'
                      : isDark
                        ? 'white'
                        : 'dark'
                  }
                >
                  詳細
                </Text>
              </button>
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

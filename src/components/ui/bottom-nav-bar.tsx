import { ActionIcon, Text } from '@mantine/core'
import { IconChecklist, IconClock, IconHome, IconList, IconListDetails } from '@tabler/icons-react'
import { getRouteApi, Link, useLocation } from '@tanstack/react-router'
import LiquidGlass from 'liquid-glass-react'
import { useRef, useState } from 'react'
import { HabitSelectorPopover } from '~/features/root/components/habit-selector-popover'
import { authClient } from '~/lib/auth-client'

export function BottomNavBar() {
  const routeApi = getRouteApi('__root__')
  const navigate = routeApi.useNavigate()
  const location = useLocation()
  const [opened, setOpened] = useState(false)
  const targetRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: session } = authClient.useSession()

  if (!session?.user) {
    return null
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <div
      ref={containerRef}
      className="fixed right-0 bottom-0 left-0 z-50 flex items-center justify-center"
      style={{
        padding: '8px 16px max(env(safe-area-inset-bottom), 8px)',
      }}
    >
      <div className="flex w-full max-w-[600px] items-center justify-around gap-3">
        {/* ホーム */}
        <LiquidGlass
          displacementScale={20}
          blurAmount={0.2}
          saturation={100}
          elasticity={0.15}
          cornerRadius={16}
          mode="standard"
          padding="10px 12px"
          mouseContainer={containerRef}
        >
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
            <Text size="10px" fw={isActive('/') ? 600 : 400}>
              ホーム
            </Text>
          </div>
        </LiquidGlass>

        {/* 習慣一覧 */}
        <LiquidGlass
          displacementScale={20}
          blurAmount={0.2}
          saturation={100}
          elasticity={0.15}
          cornerRadius={16}
          mode="standard"
          padding="10px 12px"
          mouseContainer={containerRef}
        >
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
              <IconList
                size={20}
                stroke={1.5}
                style={{ color: isActive('/habits') ? 'var(--mantine-color-blue-6)' : 'inherit' }}
              />
            </ActionIcon>
            <Text size="10px" fw={isActive('/habits') ? 600 : 400}>
              習慣
            </Text>
          </div>
        </LiquidGlass>

        {/* 習慣を記録 */}
        <LiquidGlass
          displacementScale={20}
          blurAmount={0.2}
          saturation={100}
          elasticity={0.15}
          cornerRadius={16}
          mode="standard"
          padding="10px 12px"
          mouseContainer={containerRef}
        >
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
              <IconClock size={20} stroke={1.5} />
            </ActionIcon>
            <Text size="10px" fw={400}>
              記録
            </Text>
          </div>
        </LiquidGlass>

        {/* 習慣詳細 */}
        <LiquidGlass
          displacementScale={20}
          blurAmount={0.2}
          saturation={100}
          elasticity={0.15}
          cornerRadius={16}
          mode="standard"
          padding="10px 12px"
          mouseContainer={containerRef}
        >
          <div
            style={{
              minWidth: '52px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ActionIcon ref={targetRef} variant="transparent" size="sm" onClick={() => setOpened(true)}>
              <IconListDetails size={20} stroke={1.5} />
            </ActionIcon>
            <Text size="10px" fw={400}>
              詳細
            </Text>
          </div>
        </LiquidGlass>

        {/* すべて */}
        <LiquidGlass
          displacementScale={20}
          blurAmount={0.2}
          saturation={100}
          elasticity={0.15}
          cornerRadius={16}
          mode="standard"
          padding="10px 12px"
          mouseContainer={containerRef}
        >
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
                style={{ color: isActive('/habits') ? 'var(--mantine-color-blue-6)' : 'inherit' }}
              />
            </ActionIcon>
            <Text size="10px" fw={isActive('/habits') ? 600 : 400}>
              すべて
            </Text>
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

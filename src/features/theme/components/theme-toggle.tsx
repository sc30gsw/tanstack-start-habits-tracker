import { ActionIcon, Tooltip, useComputedColorScheme, useMantineColorScheme } from '@mantine/core'
import { IconMoon, IconSun } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { GET_USER_SETTINGS_CACHE_KEY } from '~/constants/cache-key'
import { settingsDto } from '~/features/settings/server/settings-functions'

type ThemeMode = 'light' | 'dark' | 'auto'
type DisplayMode = 'light' | 'dark'

export function ThemeToggle() {
  const { setColorScheme } = useMantineColorScheme()
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: false })
  const buttonRef = useRef<HTMLButtonElement>(null)

  const { data: settings } = useSuspenseQuery({
    queryKey: [GET_USER_SETTINGS_CACHE_KEY],
    queryFn: async () => {
      try {
        return await settingsDto.getUserSettings()
      } catch {
        return null
      }
    },
    retry: false,
  })

  const dbTheme = (settings?.theme as ThemeMode) ?? 'auto'
  const isAutoMode = dbTheme === 'auto'

  // Local state for auto mode toggle (light/dark only)
  const [localDisplayMode, setLocalDisplayMode] = useState<DisplayMode>('light')

  useEffect(() => {
    if (isAutoMode) {
      const savedDisplay = localStorage.getItem('theme-display') as DisplayMode

      if (savedDisplay === 'light' || savedDisplay === 'dark') {
        setLocalDisplayMode(savedDisplay)
        setColorScheme(savedDisplay)
      } else {
        setColorScheme('auto')
        setLocalDisplayMode(computedColorScheme === 'dark' ? 'dark' : 'light')
      }
    } else {
      setColorScheme(dbTheme)
      setLocalDisplayMode(dbTheme)
    }
  }, [dbTheme, isAutoMode, setColorScheme, computedColorScheme])

  const handleToggleTheme = async () => {
    if (!isAutoMode) {
      return
    }

    const nextMode: DisplayMode = localDisplayMode === 'light' ? 'dark' : 'light'

    if (!buttonRef.current || !document.startViewTransition) {
      setLocalDisplayMode(nextMode)
      localStorage.setItem('theme-display', nextMode)
      setColorScheme(nextMode)

      return
    }

    await document.startViewTransition(() => {
      flushSync(() => {
        setLocalDisplayMode(nextMode)
        localStorage.setItem('theme-display', nextMode)
        setColorScheme(nextMode)
      })
    }).ready

    const { top, left, width, height } = buttonRef.current.getBoundingClientRect()
    const x = left + width / 2
    const y = top + height / 2
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top),
    )

    document.documentElement.animate(
      {
        clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`],
      },
      {
        duration: 400,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)',
      },
    )
  }

  const getIcon = () => {
    return localDisplayMode === 'light' ? <IconSun size={18} /> : <IconMoon size={18} />
  }

  const getTitle = () => {
    if (!isAutoMode) {
      return `${localDisplayMode === 'light' ? 'ライトモード' : 'ダークモード'}（設定で固定）`
    }

    return localDisplayMode === 'light' ? 'ダークモードに切り替え' : 'ライトモードに切り替え'
  }

  return (
    <Tooltip label={getTitle()} withArrow>
      <ActionIcon
        ref={buttonRef}
        variant="subtle"
        color={localDisplayMode === 'dark' ? 'yellow' : 'blue'}
        onClick={handleToggleTheme}
        aria-label="テーマを切り替え"
        size="lg"
        disabled={!isAutoMode}
        style={{ cursor: isAutoMode ? 'pointer' : 'not-allowed' }}
      >
        {getIcon()}
      </ActionIcon>
    </Tooltip>
  )
}

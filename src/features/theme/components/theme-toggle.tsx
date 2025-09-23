import { ActionIcon, useComputedColorScheme, useMantineColorScheme } from '@mantine/core'
import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react'
import { useEffect, useState } from 'react'

type ThemeMode = 'light' | 'dark' | 'auto'

export function ThemeToggle() {
  const { setColorScheme } = useMantineColorScheme()
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: false })
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto')

  useEffect(() => {
    // Get theme preference from localStorage on mount
    const savedTheme = localStorage.getItem('theme-mode') as ThemeMode
    if (savedTheme) {
      setThemeMode(savedTheme)
      if (savedTheme === 'auto') {
        setColorScheme('auto')
      } else {
        setColorScheme(savedTheme)
      }
    }
  }, [setColorScheme])

  const handleToggleTheme = () => {
    let nextMode: ThemeMode

    switch (themeMode) {
      case 'light':
        nextMode = 'dark'
        break
      case 'dark':
        nextMode = 'auto'
        break
      default:
        nextMode = 'light'
        break
    }

    setThemeMode(nextMode)
    localStorage.setItem('theme-mode', nextMode)

    if (nextMode === 'auto') {
      setColorScheme('auto')
    } else {
      setColorScheme(nextMode)
    }
  }

  const getIcon = () => {
    switch (themeMode) {
      case 'light':
        return <IconSun size={18} />
      case 'dark':
        return <IconMoon size={18} />
      case 'auto':
        return <IconDeviceDesktop size={18} />
    }
  }

  const getTitle = () => {
    switch (themeMode) {
      case 'light':
        return 'ライトモード'
      case 'dark':
        return 'ダークモード'
      default:
        return 'システム設定に従う'
    }
  }

  return (
    <ActionIcon
      variant="subtle"
      color={computedColorScheme === 'dark' ? 'yellow' : 'blue'}
      onClick={handleToggleTheme}
      title={getTitle()}
      aria-label="テーマを切り替え"
      size="lg"
    >
      {getIcon()}
    </ActionIcon>
  )
}

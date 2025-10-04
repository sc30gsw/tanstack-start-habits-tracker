import { useMantineTheme } from '@mantine/core'
import type { HabitColor } from '~/features/habits/types/schemas/habit-schemas'

export function useHabitColor() {
  const theme = useMantineTheme()

  const getHabitColor = (colorName: HabitColor) => {
    // Mantine theme colors or fallback colors
    if (theme.colors[colorName]) {
      return theme.colors[colorName][6] // Use the main color shade
    }

    // Fallback colors if not in theme
    const fallbackColors = {
      blue: '#2196f3',
      green: '#4caf50',
      purple: '#9c27b0',
      red: '#f44336',
      orange: '#ff9800',
      pink: '#e91e63',
      cyan: '#00bcd4',
      teal: '#009688',
    } as const satisfies Record<HabitColor, string>

    return fallbackColors[colorName]
  }

  return { getHabitColor } as const
}

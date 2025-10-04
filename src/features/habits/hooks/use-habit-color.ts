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
      yellow: '#ffd700', // 明るく目立つゴールドイエロー
      indigo: '#3f51b5', // 深い藍色（ブルーとパープルの中間）
      lime: '#32cd32', // 鮮やかなライムグリーン
    } as const satisfies Record<HabitColor, string>

    return fallbackColors[colorName]
  }

  return { getHabitColor } as const
}

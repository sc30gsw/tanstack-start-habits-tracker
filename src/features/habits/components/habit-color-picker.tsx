import { ColorSwatch, Group, Stack, Text, useMantineTheme } from '@mantine/core'
import type { ReactNode } from 'react'
import type { HabitColor } from '~/features/habits/types/schemas/habit-schemas'
import { HABIT_COLOR_OPTIONS } from '~/features/habits/types/schemas/habit-schemas'

type HabitColorPickerProps = {
  value: HabitColor
  onChange: (color: HabitColor) => void
  label?: string
  error?: ReactNode
}

export function HabitColorPicker({
  value,
  onChange,
  label = 'カラー',
  error,
}: HabitColorPickerProps) {
  const theme = useMantineTheme()

  const getColorValue = (colorName: HabitColor) => {
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

  return (
    <Stack gap="xs">
      <Text size="sm" fw={500}>
        {label}
      </Text>
      <Group gap="sm">
        {HABIT_COLOR_OPTIONS.map((option) => (
          <ColorSwatch
            key={option.value}
            color={getColorValue(option.value)}
            size={28}
            style={{
              cursor: 'pointer',
              border:
                value === option.value
                  ? `3px solid ${theme.colors.blue[6]}`
                  : '3px solid transparent',
              outline: value === option.value ? `2px solid white` : 'none',
              boxShadow: value === option.value ? `0 0 0 1px ${theme.colors.gray[3]}` : 'none',
              transform: value === option.value ? 'scale(1.1)' : 'scale(1)',
              transition: 'all 0.2s ease',
            }}
            onClick={() => onChange(option.value)}
            aria-label={`色を${option.label}に設定`}
            title={option.label}
          />
        ))}
      </Group>
      {error && (
        <Text size="xs" c="red">
          {error}
        </Text>
      )}
    </Stack>
  )
}

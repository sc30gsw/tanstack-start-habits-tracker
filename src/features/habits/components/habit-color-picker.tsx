import {
  ColorSwatch,
  Group,
  Stack,
  Text,
  useComputedColorScheme,
  useMantineTheme,
} from '@mantine/core'
import type { ReactNode } from 'react'
import { useHabitColor } from '~/features/habits/hooks/use-habit-color'
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
  const computedColorScheme = useComputedColorScheme('light')
  const { getHabitColor } = useHabitColor()

  return (
    <Stack gap="xs">
      <Text size="sm" fw={500}>
        {label}
      </Text>
      <Group gap="sm">
        {HABIT_COLOR_OPTIONS.map((option) => (
          <ColorSwatch
            key={option.value}
            color={getHabitColor(option.value)}
            size={28}
            style={{
              cursor: 'pointer',
              border:
                value === option.value
                  ? `3px solid ${theme.colors.blue[6]}`
                  : '3px solid transparent',
              outline:
                value === option.value
                  ? computedColorScheme === 'dark'
                    ? `2px solid var(--mantine-color-dark-4)`
                    : `2px solid white`
                  : 'none',
              boxShadow:
                value === option.value
                  ? computedColorScheme === 'dark'
                    ? `0 0 0 1px var(--mantine-color-gray-6)`
                    : `0 0 0 1px ${theme.colors.gray[3]}`
                  : 'none',
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

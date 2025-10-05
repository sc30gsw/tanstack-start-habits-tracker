import { Radio, Stack, Text } from '@mantine/core'
import {
  HABIT_PRIORITY_OPTIONS,
  type HabitPriority,
} from '~/features/habits/types/schemas/habit-schemas'

type HabitPriorityPickerProps = {
  value: HabitPriority
  onChange: (priority: HabitPriority) => void
  error?: React.ReactNode
}

export function HabitPriorityPicker({ value, onChange, error }: HabitPriorityPickerProps) {
  return (
    <Stack gap="xs">
      <Text size="sm" fw={500}>
        優先度
      </Text>
      <Radio.Group
        value={value?.toString() ?? 'null'}
        onChange={(val) => onChange(val === 'null' ? null : (val as HabitPriority))}
      >
        <Stack gap="xs">
          {HABIT_PRIORITY_OPTIONS.map((option) => (
            <Radio
              key={option.value?.toString() ?? 'null'}
              value={option.value?.toString() ?? 'null'}
              label={option.label}
            />
          ))}
        </Stack>
      </Radio.Group>
      {error && (
        <Text size="sm" c="red">
          {error}
        </Text>
      )}
    </Stack>
  )
}

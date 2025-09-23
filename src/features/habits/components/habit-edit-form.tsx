import { Button, Group, Stack, Textarea, TextInput } from '@mantine/core'
import { HabitColorPicker } from '~/features/habits/components/habit-color-picker'
import type { HabitColor } from '~/features/habits/types/schemas/habit-schemas'

type HabitEditFormProps = {
  name: string
  description: string
  color: HabitColor
  isLoading: boolean
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onColorChange: (value: HabitColor) => void
  onSave: () => void
  onCancel: () => void
}

export function HabitEditForm({
  name,
  description,
  color,
  isLoading,
  onNameChange,
  onDescriptionChange,
  onColorChange,
  onSave,
  onCancel,
}: HabitEditFormProps) {
  return (
    <Stack gap={4}>
      <TextInput
        value={name}
        onChange={(e) => onNameChange(e.currentTarget.value)}
        label="習慣名"
        size="sm"
      />
      <Textarea
        value={description}
        onChange={(e) => onDescriptionChange(e.currentTarget.value)}
        label="説明"
        size="sm"
        minRows={2}
      />
      <HabitColorPicker value={color} onChange={onColorChange} />
      <Group gap="xs">
        <Button size="xs" loading={isLoading} onClick={onSave}>
          保存
        </Button>
        <Button size="xs" variant="outline" onClick={onCancel} disabled={isLoading}>
          キャンセル
        </Button>
      </Group>
    </Stack>
  )
}

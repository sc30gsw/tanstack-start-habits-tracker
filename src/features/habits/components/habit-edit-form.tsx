import { Button, Group, Stack, Textarea, TextInput } from '@mantine/core'

type HabitEditFormProps = {
  name: string
  description: string
  isLoading: boolean
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onSave: () => void
  onCancel: () => void
}

export function HabitEditForm({
  name,
  description,
  isLoading,
  onNameChange,
  onDescriptionChange,
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

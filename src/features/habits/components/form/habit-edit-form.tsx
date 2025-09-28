import { Alert, Button, Group, Stack, Text, Textarea, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconAlertTriangle } from '@tabler/icons-react'
import { useRouter } from '@tanstack/react-router'
import type { useTransition } from 'react'
import { HabitColorPicker } from '~/features/habits/components/habit-color-picker'
import { habitDto } from '~/features/habits/server/habit-functions'
import type { HabitEntity, HabitTable } from '~/features/habits/types/habit'
import { type HabitColor, updateHabitSchema } from '~/features/habits/types/schemas/habit-schemas'

type HabitEditFormProps = {
  habit: HabitEntity
  onCancel: () => void
  useTransition: ReturnType<typeof useTransition>
}

export function HabitEditForm({ habit, onCancel, useTransition }: HabitEditFormProps) {
  const [isPending, startTransition] = useTransition
  const router = useRouter()

  const form = useForm<Pick<HabitTable, 'name' | 'description'> & Record<'color', HabitColor>>({
    initialValues: {
      name: habit.name,
      description: habit.description ?? '',
      color: (habit.color as HabitColor) ?? 'blue',
    },
    validate: (values) => {
      const result = updateHabitSchema.safeParse({
        id: habit.id,
        ...values,
      })

      if (result.success) {
        return {}
      }

      // convert Zod issues into Mantine field errors map
      const fieldErrors: Record<string, string> = {}

      for (const issue of result.error.issues) {
        const path = issue.path[0]

        if (typeof path === 'string' && !fieldErrors[path]) {
          fieldErrors[path] = issue.message
        }
      }

      return fieldErrors
    },
    transformValues: (
      values: Pick<HabitTable, 'name' | 'description'> & Record<'color', HabitColor>,
    ) => ({
      name: values.name.trim(),
      description: values.description ? values.description.trim() : 'blue',
      color: values.color,
    }),
  })

  const handleSubmit = (
    values: Pick<HabitTable, 'name' | 'description'> & Record<'color', HabitColor>,
  ) => {
    startTransition(async () => {
      try {
        const result = await habitDto.updateHabit({
          data: {
            id: habit.id,
            name: values.name,
            description: values.description ?? '',
            color: values.color,
          },
        })

        if (result.success) {
          onCancel()

          notifications.show({
            title: '成功',
            message: `習慣（${values.name}）が更新されました`,
            color: 'green',
          })

          router.invalidate()
        } else {
          form.setErrors({ name: result.error || `習慣（${values.name}）の更新に失敗しました` })

          notifications.show({
            title: 'エラー',
            message: result.error || `習慣（${values.name}）の更新に失敗しました`,
            color: 'red',
          })
        }
      } catch (_err) {
        form.setErrors({ name: `習慣（${habit.name}）の更新に失敗しました` })

        notifications.show({
          title: 'エラー',
          message: `習慣（${habit.name}）の更新中に予期しないエラーが発生しました`,
          color: 'red',
        })
      }
    })
  }

  const handleCancel = () => {
    form.reset()
    onCancel()
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
      <Stack gap={4}>
        {(form.errors.name || form.errors.description || form.errors.color) && (
          <Alert color="red" title="エラー" icon={<IconAlertTriangle stroke={2} />}>
            <Text c="red">{form.errors.name || form.errors.description || form.errors.color}</Text>
          </Alert>
        )}

        <TextInput
          label="習慣名"
          size="sm"
          key={form.key('name')}
          {...form.getInputProps('name')}
          disabled={isPending}
          error={form.errors.name}
        />
        <Textarea
          label="説明"
          size="sm"
          minRows={2}
          key={form.key('description')}
          {...form.getInputProps('description')}
          disabled={isPending}
          error={form.errors.description}
        />
        <HabitColorPicker
          value={form.values.color}
          onChange={(color) => form.setFieldValue('color', color)}
          error={form.errors.color}
        />
        <Group gap="xs">
          <Button
            type="submit"
            size="xs"
            loading={isPending}
            disabled={isPending}
            style={{ width: 85 }}
          >
            更新
          </Button>
          <Button size="xs" variant="outline" onClick={handleCancel} disabled={isPending}>
            キャンセル
          </Button>
        </Group>
      </Stack>
    </form>
  )
}

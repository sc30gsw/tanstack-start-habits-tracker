import { Alert, Button, Card, Group, Stack, Text, Textarea, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconAlertTriangle } from '@tabler/icons-react'
import { useRouter } from '@tanstack/react-router'
import { useTransition } from 'react'
import { HabitColorPicker } from '~/features/habits/components/habit-color-picker'
import { HabitPriorityPicker } from '~/features/habits/components/habit-priority-picker'
import { habitDto } from '~/features/habits/server/habit-functions'
import {
  createHabitSchema,
  type HabitColor,
  type HabitPriority,
} from '~/features/habits/types/schemas/habit-schemas'

type FormValues = {
  name: string
  description?: string
  color: HabitColor
  priority: HabitPriority
}

type HabitCreateFormProps = {
  onSuccess: () => void
  onCancel: () => void
}

export function HabitCreateForm({ onSuccess, onCancel }: HabitCreateFormProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<FormValues>({
    initialValues: {
      name: '',
      description: '',
      color: 'blue',
      priority: null,
    },
    validate: (values) => {
      const result = createHabitSchema.safeParse(values)

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
    transformValues: (values: FormValues) => ({
      name: values.name.trim(),
      description: values.description ? values.description.trim() : undefined,
      color: values.color,
      priority: values.priority,
    }),
  })

  const handleSubmit = (values: typeof form.values) => {
    startTransition(async () => {
      form.clearErrors()

      try {
        const result = await habitDto.createHabit({
          data: {
            name: values.name,
            description: values.description || undefined,
            color: values.color,
            priority: values.priority,
          },
        })

        if (result.success) {
          router.invalidate()

          onSuccess()
          form.reset()

          notifications.show({
            title: '成功',
            message: `習慣（${values.name}）が作成されました`,
            color: 'green',
          })
        } else {
          form.setErrors({ name: result.error || `習慣（${values.name}）の作成に失敗しました` })
        }
      } catch (_err) {
        form.setErrors({ name: `習慣（${values.name}）の作成に失敗しました` })

        notifications.show({
          title: 'エラー',
          message: `習慣（${values.name}）の作成中に予期しないエラーが発生しました`,
          color: 'red',
        })
      }
    })
  }

  return (
    <Card withBorder padding="lg">
      <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
        <Stack gap="md">
          <Title order={3}>新しい習慣を作成</Title>

          {(form.errors.name ||
            form.errors.description ||
            form.errors.color ||
            form.errors.priority) && (
            <Alert color="red" title="エラー" icon={<IconAlertTriangle stroke={2} />}>
              <Text c="red">
                {form.errors.name ||
                  form.errors.description ||
                  form.errors.color ||
                  form.errors.priority}
              </Text>
            </Alert>
          )}

          <TextInput
            label="習慣名"
            placeholder="例: 読書、運動、瞑想"
            key={form.key('name')}
            {...form.getInputProps('name')}
            required
            disabled={isPending}
            aria-invalid={!!form.errors.name}
            error={form.errors.name}
          />

          <Textarea
            label="説明（任意）"
            placeholder="この習慣について詳しく説明してください"
            key={form.key('description')}
            {...form.getInputProps('description')}
            minRows={3}
            disabled={isPending}
            aria-invalid={!!form.errors.description}
            error={form.errors.description}
          />

          <HabitColorPicker
            value={form.values.color}
            onChange={(color) => form.setFieldValue('color', color)}
            error={form.errors.color}
          />

          <HabitPriorityPicker
            value={form.values.priority}
            onChange={(priority) => form.setFieldValue('priority', priority)}
            error={form.errors.priority}
          />

          <Group gap="sm" wrap="nowrap">
            <Button type="submit" loading={isPending} disabled={isPending} color="habit">
              習慣を作成
            </Button>
            {onCancel && (
              <Button variant="outline" onClick={onCancel} disabled={isPending}>
                キャンセル
              </Button>
            )}
          </Group>
        </Stack>
      </form>
    </Card>
  )
}

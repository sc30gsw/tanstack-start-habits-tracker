import { Alert, Button, Card, Stack, Textarea, TextInput, Title, Group } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { createHabitSchema } from '~/features/habits/types/schemas/habit-schemas'
import { createHabit } from '../server/habit-functions'

type HabitCreateFormProps = {
  onSuccess?: () => void
  onCancel?: () => void
}

export function HabitCreateForm({ onSuccess, onCancel }: HabitCreateFormProps) {
  // 旧ローカル state は Mantine Form に置換
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  interface FormValues {
    name: string
    description?: string
  }
  const form = useForm<FormValues>({
    initialValues: {
      name: '',
      description: '',
    },
    validate: (values) => {
      const result = createHabitSchema.safeParse(values)
      if (result.success) return {}
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
    }),
  })

  const handleSubmit = async (values: typeof form.values) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await createHabit({
        name: values.name,
        description: values.description || undefined,
      })

      if (result.success) {
        router.invalidate()
        onSuccess?.()
        form.reset()
      } else {
        setError(result.error || '習慣の作成に失敗しました')
      }
    } catch (_err) {
      setError('予期しないエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card withBorder padding="lg">
      <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
        <Stack gap="md">
          <Title order={3}>新しい習慣を作成</Title>

          {error && (
            <Alert color="red" title="エラー">
              {error}
            </Alert>
          )}

          <TextInput
            label="習慣名"
            placeholder="例: 読書、運動、瞑想"
            key={form.key('name')}
            {...form.getInputProps('name')}
            required
            disabled={isSubmitting}
            aria-invalid={!!form.errors.name}
            error={form.errors.name}
          />

          <Textarea
            label="説明（任意）"
            placeholder="この習慣について詳しく説明してください"
            key={form.key('description')}
            {...form.getInputProps('description')}
            minRows={3}
            disabled={isSubmitting}
            aria-invalid={!!form.errors.description}
            error={form.errors.description}
          />

          <Group gap="sm" wrap="nowrap">
            <Button type="submit" loading={isSubmitting} disabled={isSubmitting} color="habit">
              習慣を作成
            </Button>
            {onCancel && (
              <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
                キャンセル
              </Button>
            )}
          </Group>
        </Stack>
      </form>
    </Card>
  )
}

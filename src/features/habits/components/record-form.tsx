import { Alert, Button, Group, NumberInput, Stack, Switch } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { createRecord } from '~/features/habits/server/record-functions'
import { createRecordSchema } from '../types/schemas/record-schemas'

type RecordFormProps = {
  habitId: string
  date: string
  onSuccess: () => void
  onCancel: () => void
}

export function RecordForm({ habitId, date, onSuccess, onCancel }: RecordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  interface FormValues {
    completed: boolean
    duration_minutes: number | ''
  }
  const form = useForm<FormValues>({
    initialValues: { completed: false, duration_minutes: 0 },
    validate: (values) => {
      // duration_minutes が '' のときは 0 として扱う
      const parsed = createRecordSchema
        .pick({ completed: true, duration_minutes: true, habit_id: true, date: true })
        .safeParse({
          habit_id: habitId,
          date,
          completed: values.completed,
          duration_minutes:
            typeof values.duration_minutes === 'number' ? values.duration_minutes : 0,
        })
      if (parsed.success) return {}
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const path = issue.path[0]
        if (typeof path === 'string' && !fieldErrors[path]) fieldErrors[path] = issue.message
      }
      return fieldErrors
    },
    transformValues: (values) => ({
      completed: values.completed,
      duration_minutes: typeof values.duration_minutes === 'number' ? values.duration_minutes : 0,
    }),
  })

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const result = await createRecord({
        habit_id: habitId,
        date,
        completed: values.completed,
        duration_minutes: typeof values.duration_minutes === 'number' ? values.duration_minutes : 0,
      })
      if (result.success) {
        router.invalidate()
        onSuccess()
        form.reset()
      } else {
        setError(result.error || '記録の作成に失敗しました')
      }
    } catch (_err) {
      setError('予期しないエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
      <Stack gap="md">
        {error && (
          <Alert color="red" title="エラー">
            {error}
          </Alert>
        )}
        <Switch
          label="習慣を完了しましたか？"
          key={form.key('completed')}
          checked={form.values.completed}
          onChange={(e) => form.setFieldValue('completed', e.currentTarget.checked)}
        />
        <NumberInput
          label="実行時間（分）"
          placeholder="0"
          min={0}
          max={1440}
          key={form.key('duration_minutes')}
          value={form.values.duration_minutes}
          onChange={(value) =>
            form.setFieldValue('duration_minutes', typeof value === 'string' ? '' : (value ?? 0))
          }
          error={form.errors.duration_minutes}
        />
        <Group gap="sm">
          <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
            記録を保存
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            キャンセル
          </Button>
        </Group>
      </Stack>
    </form>
  )
}

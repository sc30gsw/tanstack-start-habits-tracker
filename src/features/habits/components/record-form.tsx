import { Alert, Button, Group, NumberInput, Stack, Switch, Text } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconAlertTriangle } from '@tabler/icons-react'
import { useRouter } from '@tanstack/react-router'
import { useTransition } from 'react'
import { recordDto } from '~/features/habits/server/record-functions'
import type { RecordEntity } from '~/features/habits/types/habit'
import { createRecordSchema } from '~/features/habits/types/schemas/record-schemas'

type RecordFormProps = {
  habitId: string
  date: string
  onSuccess: () => void
  onCancel: () => void
  existingRecord?: RecordEntity
}

type FormValues = {
  completed: boolean
  durationMinutes: number | ''
}

export function RecordForm({
  habitId,
  date,
  onSuccess,
  onCancel,
  existingRecord,
}: RecordFormProps) {
  console.log('🚀 ~ RecordForm ~ existingRecord:', existingRecord)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<FormValues>({
    initialValues: {
      completed: existingRecord?.completed ?? false,
      durationMinutes: existingRecord?.duration_minutes ?? 0,
    },
    validate: (values) => {
      // durationMinutes が '' のときは 0 として扱う
      const parsed = createRecordSchema
        .pick({ completed: true, durationMinutes: true, habitId: true, date: true })
        .safeParse({
          habitId: habitId,
          date,
          completed: values.completed,
          durationMinutes: typeof values.durationMinutes === 'number' ? values.durationMinutes : 0,
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
      durationMinutes: typeof values.durationMinutes === 'number' ? values.durationMinutes : 0,
    }),
  })

  const handleSubmit = (values: FormValues) => {
    startTransition(async () => {
      form.clearErrors()

      notifications.show({
        title: '成功',
        message: existingRecord ? '記録が更新されました' : '記録が作成されました',
        color: 'green',
      })
      try {
        const durationMinutes =
          typeof values.durationMinutes === 'number' ? values.durationMinutes : 0

        const result = existingRecord
          ? await recordDto.updateRecord({
              data: {
                id: existingRecord.id,
                completed: values.completed,
                durationMinutes,
              }
            })
          : await recordDto.createRecord({
              data: {
                habitId,
                date,
                completed: values.completed,
                durationMinutes,
              }
            })

        if (result.success) {
          router.invalidate()
          onSuccess()
          form.reset()
          notifications.show({
            title: '成功',
            message: existingRecord ? '記録が更新されました' : '記録が作成されました',
            color: 'green',
          })
        } else {
          notifications.show({
            title: 'エラー',
            message: result.error || `記録の${existingRecord ? '更新' : '作成'}に失敗しました`,
            color: 'red',
          })
          form.setErrors({ durationMinutes: result.error || '記録の保存に失敗しました' })
        }
      } catch (_err) {
        notifications.show({
          title: 'エラー',
          message: '予期しないエラーが発生しました',
          color: 'red',
        })
        form.setErrors({ durationMinutes: '予期しないエラーが発生しました' })
      }
    })
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
      <Stack gap="md">
        {form.errors.durationMinutes && (
          <Alert color="red" title="エラー" icon={<IconAlertTriangle stroke={2} />}>
            <Text c="red">{form.errors.durationMinutes}</Text>
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
          key={form.key('durationMinutes')}
          value={form.values.durationMinutes}
          onChange={(value) =>
            form.setFieldValue('durationMinutes', typeof value === 'string' ? '' : (value ?? 0))
          }
          error={form.errors.durationMinutes}
        />
        <Group gap="sm">
          <Button type="submit" loading={isPending} disabled={isPending}>
            {existingRecord ? '記録を更新' : '記録を保存'}
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={isPending}>
            キャンセル
          </Button>
        </Group>
      </Stack>
    </form>
  )
}

import {
  Alert,
  Button,
  Group,
  NumberInput,
  Stack,
  Switch,
  Text,
  Textarea,
  useComputedColorScheme,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { IconAlertTriangle } from '@tabler/icons-react'
import { useRouter } from '@tanstack/react-router'
import { useTransition } from 'react'
import { recordDto } from '~/features/habits/server/record-functions'
import type { RecordEntity } from '~/features/habits/types/habit'
import { createRecordSchema } from '~/features/habits/types/schemas/record-schemas'
import { hoursToMinutes, minutesToHours } from '~/features/habits/utils/time-utils'

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
  durationHours: number | ''
  notes: string
}

export function RecordForm({
  habitId,
  date,
  onSuccess,
  onCancel,
  existingRecord,
}: RecordFormProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const computedColorScheme = useComputedColorScheme('light')

  const form = useForm<FormValues>({
    initialValues: {
      completed: existingRecord?.completed ?? false,
      durationMinutes: existingRecord?.duration_minutes ?? 0,
      durationHours: existingRecord?.duration_minutes
        ? minutesToHours(existingRecord.duration_minutes)
        : 0,
      notes: existingRecord?.notes ?? '',
    },
    validate: (values) => {
      // durationMinutes が '' のときは 0 として扱う
      const parsed = createRecordSchema
        .pick({ completed: true, durationMinutes: true, habitId: true, date: true, notes: true })
        .safeParse({
          habitId: habitId,
          date,
          completed: values.completed,
          durationMinutes: typeof values.durationMinutes === 'number' ? values.durationMinutes : 0,
          notes: values.notes,
        })

      if (parsed.success) {
        return {}
      }

      const fieldErrors: Record<string, string> = {}

      for (const issue of parsed.error.issues) {
        const path = issue.path[0]
        if (typeof path === 'string' && !fieldErrors[path]) {
          fieldErrors[path] = issue.message
        }
      }

      return fieldErrors
    },
    transformValues: (values) => ({
      completed: values.completed,
      durationMinutes: typeof values.durationMinutes === 'number' ? values.durationMinutes : 0,
      durationHours: typeof values.durationHours === 'number' ? values.durationHours : 0,
      notes: values.notes,
    }),
  })

  const handleSubmit = (values: FormValues) => {
    const durationMinutes = typeof values.durationMinutes === 'number' ? values.durationMinutes : 0

    // 未完了かつ時間が0でメモが空の場合、メモ入力を促す
    if (!values.completed && durationMinutes === 0 && !values.notes.trim()) {
      modals.openConfirmModal({
        title: '未完了の記録について',
        children: (
          <Text size="sm">
            習慣を実行しなかった理由や今後の改善点をメモに記録しませんか？
            <br />
            記録することで習慣の継続に役立ちます。
          </Text>
        ),
        labels: { confirm: 'メモを記入する', cancel: 'このまま保存' },
        confirmProps: { color: 'blue' },
        onConfirm: () => {
          // メモ欄にフォーカスを当てる（モーダルが閉じてからフォーカス）
          setTimeout(() => {
            const textarea = document.querySelector(
              'textarea[placeholder*="今日の感想"]',
            ) as HTMLTextAreaElement
            if (textarea) {
              textarea.focus()
              textarea.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          }, 100)
        },
        onCancel: () => {
          // そのまま保存処理を実行
          executeSubmit(values, durationMinutes)
        },
      })
      return
    }

    // 通常の保存処理
    executeSubmit(values, durationMinutes)
  }

  const executeSubmit = (values: FormValues, durationMinutes: number) => {
    // 事前にZodバリデーションを実行してエラーをチェック
    const validationResult = createRecordSchema.safeParse({
      habitId,
      date,
      completed: values.completed,
      durationMinutes,
      notes: values.notes,
    })

    if (!validationResult.success) {
      // Zodバリデーションエラーをフォームエラーとして表示（toast不要）
      const fieldErrors: Record<string, string> = {}

      for (const issue of validationResult.error.issues) {
        const path = issue.path[0]

        if (typeof path === 'string' && !fieldErrors[path]) {
          fieldErrors[path] = issue.message
        }
      }

      form.setErrors(fieldErrors)

      return
    }

    startTransition(async () => {
      form.clearErrors()

      try {
        const result = existingRecord
          ? await recordDto.updateRecord({
              data: {
                id: existingRecord.id,
                completed: values.completed,
                durationMinutes,
                notes: values.notes,
              },
            })
          : await recordDto.createRecord({
              data: {
                habitId,
                date,
                completed: values.completed,
                durationMinutes,
                notes: values.notes,
              },
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
          // サーバーエラーの場合はtoastとフォームエラー両方表示
          notifications.show({
            title: 'エラー',
            message: result.error || `記録の${existingRecord ? '更新' : '作成'}に失敗しました`,
            color: 'red',
          })
          form.setErrors({ durationMinutes: result.error || '記録の保存に失敗しました' })
        }
      } catch (_err) {
        // ネットワークエラーなど予期しないエラーの場合
        notifications.show({
          title: 'エラー',
          message: '予期しないエラーが発生しました',
          color: 'red',
        })

        form.setErrors({ durationMinutes: '予期しないエラーが発生しました' })
      }
    })
  }

  // 分入力変更時に時間入力を同期
  const handleMinutesChange = (value: string | number) => {
    const minutes = typeof value === 'string' ? '' : (value ?? 0)
    form.setFieldValue('durationMinutes', minutes)

    if (typeof minutes === 'number') {
      form.setFieldValue('durationHours', minutesToHours(minutes))
    } else {
      form.setFieldValue('durationHours', '')
    }
  }

  // 時間入力変更時に分入力を同期
  const handleHoursChange = (value: string | number) => {
    const hours = typeof value === 'string' ? '' : (value ?? 0)
    form.setFieldValue('durationHours', hours)

    if (typeof hours === 'number') {
      form.setFieldValue('durationMinutes', hoursToMinutes(hours))
    } else {
      form.setFieldValue('durationMinutes', '')
    }
  }

  return (
    <form onSubmit={form.onSubmit((values: FormValues) => handleSubmit(values))} noValidate>
      <Stack gap="md">
        {(form.errors.completed || form.errors.durationMinutes || form.errors.notes) && (
          <Alert color="red" title="エラー" icon={<IconAlertTriangle stroke={2} />}>
            <Text c="red">
              {form.errors.completed || form.errors.durationMinutes || form.errors.notes}
            </Text>
          </Alert>
        )}
        <Switch
          label="習慣を完了しましたか？"
          key={form.key('completed')}
          checked={form.values.completed}
          onChange={(e) => form.setFieldValue('completed', e.currentTarget.checked)}
          disabled={isPending}
          error={form.errors.completed}
        />
        <Group gap="md">
          <NumberInput
            label="実行時間（時間）"
            placeholder="0"
            min={0}
            max={24}
            step={0.25}
            decimalScale={2}
            key={form.key('durationHours')}
            value={form.values.durationHours}
            onChange={handleHoursChange}
            error={!!form.errors.durationMinutes}
            disabled={isPending}
            style={{ flex: 1 }}
          />
          <NumberInput
            label="実行時間（分）"
            placeholder="0"
            min={0}
            max={1440}
            key={form.key('durationMinutes')}
            value={form.values.durationMinutes}
            onChange={handleMinutesChange}
            error={!!form.errors.durationMinutes}
            disabled={isPending}
            style={{ flex: 1 }}
          />
        </Group>
        <Textarea
          label="メモ・感想"
          placeholder="今日の感想や具体的に何をやったかを記録..."
          rows={4}
          maxLength={500}
          key={form.key('notes')}
          value={form.values.notes}
          onChange={(e) => form.setFieldValue('notes', e.currentTarget.value)}
          error={form.errors.notes}
          disabled={isPending}
          description={`${form.values.notes.length}/500文字`}
          data-autofocus
          styles={{
            input: {
              backgroundColor:
                computedColorScheme === 'dark'
                  ? 'var(--mantine-color-dark-6)'
                  : 'var(--mantine-color-white)',
              color:
                computedColorScheme === 'dark'
                  ? 'var(--mantine-color-gray-1)'
                  : 'var(--mantine-color-dark-8)',
              border:
                computedColorScheme === 'dark'
                  ? '1px solid var(--mantine-color-dark-4)'
                  : '1px solid var(--mantine-color-gray-3)',
            },
          }}
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

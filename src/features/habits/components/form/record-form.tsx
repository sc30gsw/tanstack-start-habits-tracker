import { Alert, Button, Group, NumberInput, Select, Stack, Text } from '@mantine/core'
import { useForm } from '@mantine/form'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { IconAlertTriangle } from '@tabler/icons-react'
import { useRouter } from '@tanstack/react-router'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { useEffect, useMemo, useState, useTransition } from 'react'
import 'dayjs/locale/ja'

// dayjsプラグインと日本のロケールを設定
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('ja')
dayjs.tz.setDefault('Asia/Tokyo')

import { RichTextEditor } from '~/components/ui/rich-text-editor/rich-text-editor'
import { recordDto } from '~/features/habits/server/record-functions'
import type { HabitTable, RecordEntity, RecordTable } from '~/features/habits/types/habit'
import { createRecordSchema } from '~/features/habits/types/schemas/record-schemas'
import { hoursToMinutes, minutesToHours } from '~/features/habits/utils/time-utils'

type RecordFormProps = {
  habitId: HabitTable['id']
  date: RecordTable['date']
  onSuccess: () => void
  onCancel: () => void
  existingRecord?: RecordEntity
}

type FormValues = Pick<RecordTable, 'status' | 'notes'> & {
  durationMinutes: RecordTable['duration_minutes']
  durationHours: number | ''
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

  const [editorContent, setEditorContent] = useState(existingRecord?.notes ?? '')

  const form = useForm<FormValues>({
    initialValues: {
      status: existingRecord?.status ?? 'active',
      durationMinutes: existingRecord?.duration_minutes ?? 0,
      durationHours: existingRecord?.duration_minutes
        ? minutesToHours(existingRecord.duration_minutes)
        : 0,
      notes: existingRecord?.notes ?? '',
    },
    validate: (values) => {
      // durationMinutes が '' のときは 0 として扱う
      const parsed = createRecordSchema
        .pick({ status: true, durationMinutes: true, habitId: true, date: true, notes: true })
        .safeParse({
          habitId: habitId,
          date,
          status: values.status,
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
      status: values.status,
      durationMinutes: typeof values.durationMinutes === 'number' ? values.durationMinutes : 0,
      durationHours: typeof values.durationHours === 'number' ? values.durationHours : 0,
      notes: values.notes,
    }),
  })

  // 未来の日付かどうかを判定
  const isFutureDate = useMemo(() => {
    const todayJST = dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD')
    return date > todayJST
  }, [date])

  // ステータス選択肢を未来の日付に応じて動的に変更
  const statusOptions = useMemo(() => {
    if (isFutureDate) {
      return [{ value: 'active', label: '📋 予定中' }]
    }
    return [
      { value: 'active', label: '📋 予定中' },
      { value: 'completed', label: '✅ 完了' },
      { value: 'skipped', label: '⏭️ スキップ' },
    ]
  }, [isFutureDate])

  // 未来の日付では強制的に 'active' に設定
  useEffect(() => {
    if (isFutureDate && form.values.status !== 'active') {
      form.setFieldValue('status', 'active')
    }
  }, [isFutureDate, form])

  // Sync editor content with form
  useEffect(() => {
    form.setFieldValue('notes', editorContent)
  }, [editorContent])

  const handleSubmit = (values: FormValues) => {
    const durationMinutes = typeof values.durationMinutes === 'number' ? values.durationMinutes : 0

    // スキップ状態かつメモが空の場合、メモ入力を促す
    if (values.status === 'skipped' && !values.notes?.trim()) {
      modals.openConfirmModal({
        title: 'スキップの理由を記録しませんか？',
        children: (
          <Text size="sm">
            なぜスキップしたのか、どうすれば改善できるかを記録することで、
            <br />
            今後の習慣継続に役立ちます。
          </Text>
        ),
        labels: {
          confirm: '理由を記入する',
          cancel: existingRecord ? 'このまま更新' : 'このまま保存',
        },
        confirmProps: { color: 'blue' },
        onConfirm: () => {
          // メモ欄にフォーカスを当てる（モーダルが閉じてからフォーカス）
          setTimeout(() => {
            const editor = document.querySelector('.tiptap.ProseMirror') as HTMLElement
            if (editor) {
              editor.focus()
              editor.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
      status: values.status,
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
                status: values.status,
                durationMinutes,
                notes: values.notes ?? '',
              },
            })
          : await recordDto.createRecord({
              data: {
                habitId,
                date,
                status: values.status,
                durationMinutes,
                notes: values.notes ?? '',
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
    const minutes = typeof value === 'string' ? 0 : (value ?? 0)
    form.setFieldValue('durationMinutes', minutes)

    if (typeof minutes === 'number') {
      form.setFieldValue('durationHours', minutesToHours(minutes))
    } else {
      form.setFieldValue('durationHours', 0)
    }
  }

  // 時間入力変更時に分入力を同期
  const handleHoursChange = (value: string | number) => {
    const hours = typeof value === 'string' ? 0 : (value ?? 0)
    form.setFieldValue('durationHours', hours)

    if (typeof hours === 'number') {
      form.setFieldValue('durationMinutes', hoursToMinutes(hours))
    } else {
      form.setFieldValue('durationMinutes', 0)
    }
  }

  return (
    <form onSubmit={form.onSubmit((values: FormValues) => handleSubmit(values))} noValidate>
      <Stack gap="md">
        {isFutureDate && (
          <Alert color="blue" title="未来の日付" variant="light">
            <Text size="sm">
              未来の日付には「予定中」ステータスのみ記録できます。
              <br />
              完了やスキップの記録は、その日が来てから行ってください。
            </Text>
          </Alert>
        )}
        {(form.errors.status || form.errors.durationMinutes || form.errors.notes) && (
          <Alert color="red" title="エラー" icon={<IconAlertTriangle stroke={2} />}>
            <Text c="red">
              {form.errors.status || form.errors.durationMinutes || form.errors.notes}
            </Text>
          </Alert>
        )}
        <Select
          label="ステータス"
          placeholder="ステータスを選択"
          key={form.key('status')}
          value={form.values.status}
          onChange={(value) =>
            form.setFieldValue('status', value as 'active' | 'completed' | 'skipped')
          }
          data={statusOptions}
          disabled={isPending}
          error={form.errors.status}
          description={isFutureDate ? '未来の日付は予定中のみ選択可能です' : undefined}
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
            value={form.values.durationMinutes ?? 0}
            onChange={handleMinutesChange}
            error={!!form.errors.durationMinutes}
            disabled={isPending}
            style={{ flex: 1 }}
          />
        </Group>
        <Stack gap="xs">
          <Text size="sm" fw={500}>
            実施内容・振り返り
          </Text>
          <RichTextEditor
            content={editorContent}
            onChange={setEditorContent}
            placeholder="例：
・ランニング 30分（5km）
・ストレッチ 10分

できなかった部分：
・筋トレは時間がなくてスキップ
・明日は朝の時間を使って取り組む"
            disabled={isPending}
          />
        </Stack>
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

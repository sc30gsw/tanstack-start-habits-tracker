import { Text } from '@mantine/core'
import { useForm } from '@mantine/form'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { useRouter } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState, useTransition } from 'react'
import { recordDto } from '~/features/habits/server/record-functions'
import type { HabitTable, RecordEntity, RecordTable } from '~/features/habits/types/habit'
import { createRecordSchema } from '~/features/habits/types/schemas/record-schemas'
import { hoursToMinutes, minutesToHours } from '~/features/habits/utils/time-utils'

const EMPTY_PATTERNS = [
  /^<p><\/p>$/,
  /^<p>\s*<\/p>$/,
  /^<p><br><\/p>$/,
  /^<p>\s*<br>\s*<\/p>$/,
] as const satisfies readonly RegExp[]

const STRUCTURAL_ELEMENTS_REGEX = /<(hr|img|ul|ol|pre|code|blockquote|h[1-6]|div)/i
const LINK_PREVIEW_REGEX = /data-type="link-preview"/i
const TAGS_REGEX = /<[^>]*>/g

export function isEmptyContent(html?: string | null) {
  if (!html) {
    return true
  }

  const trimmed = html.trim()

  if (trimmed.length === 0) {
    return true
  }

  if (EMPTY_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return true
  }

  const hasLinkPreview = LINK_PREVIEW_REGEX.test(trimmed)

  if (hasLinkPreview) {
    return false
  }

  const hasStructuralElements = STRUCTURAL_ELEMENTS_REGEX.test(trimmed)

  if (hasStructuralElements) {
    return false
  }

  const text = html.replace(TAGS_REGEX, '').trim()

  return text.length === 0
}

export type FormValues = Pick<RecordTable, 'status' | 'notes'> & {
  durationMinutes: RecordTable['duration_minutes']
  durationHours: number | ''
  recoveryDate: RecordTable['recoveryDate']
}

export function useRecordForm(
  habitId: HabitTable['id'],
  date: RecordTable['date'],
  onSuccess: () => void,
  existingRecord?: RecordEntity,
) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const [editorContent, setEditorContent] = useState(existingRecord?.notes ?? '')
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false)
  const [editorKey, setEditorKey] = useState(crypto.randomUUID())

  const form = useForm<FormValues>({
    initialValues: {
      status: existingRecord?.status ?? 'active',
      durationMinutes: existingRecord?.duration_minutes ?? 0,
      durationHours: existingRecord?.duration_minutes
        ? minutesToHours(existingRecord.duration_minutes)
        : 0,
      notes: existingRecord?.notes ?? '',
      recoveryDate: existingRecord?.recoveryDate ?? null,
    },
    validate: (values) => {
      const parsed = createRecordSchema
        .pick({
          status: true,
          durationMinutes: true,
          habitId: true,
          date: true,
          notes: true,
          recoveryDate: true,
        })
        .safeParse({
          habitId,
          date,
          status: values.status,
          durationMinutes: typeof values.durationMinutes === 'number' ? values.durationMinutes : 0,
          notes: values.notes,
          recoveryDate: values.recoveryDate,
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
      recoveryDate: values.recoveryDate,
    }),
  })

  const isFutureDate = useMemo(() => {
    const todayJST = dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD')
    return date > todayJST
  }, [date])

  const statusOptions = useMemo(() => {
    if (isFutureDate) {
      return [
        {
          value: 'active',
          label: '予定中',
        },
        {
          value: 'skipped',
          label: 'スキップ',
        },
      ]
    }

    return [
      {
        value: 'active',
        label: '予定中',
      },
      {
        value: 'completed',
        label: '完了',
      },
      {
        value: 'skipped',
        label: 'スキップ',
      },
    ]
  }, [isFutureDate])

  useEffect(() => {
    if (isFutureDate && form.values.status === 'completed') {
      form.setFieldValue('status', 'active')
    }
  }, [isFutureDate, form])

  useEffect(() => {
    form.setFieldValue('notes', editorContent)
  }, [editorContent])

  const handleSubmit = (values: FormValues) => {
    const durationMinutes = typeof values.durationMinutes === 'number' ? values.durationMinutes : 0

    if (values.status === 'skipped' && isEmptyContent(values.notes)) {
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
          setIsEditorModalOpen(true)
        },
        onCancel: () => {
          executeSubmit(values, durationMinutes)
        },
      })
      return
    }

    executeSubmit(values, durationMinutes)
  }

  const executeSubmit = (values: FormValues, durationMinutes: number) => {
    const validationResult = createRecordSchema.safeParse({
      habitId,
      date,
      status: values.status,
      durationMinutes,
      notes: values.notes,
      recoveryDate: values.recoveryDate,
    })

    if (!validationResult.success) {
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
                recoveryDate: values.recoveryDate,
              },
            })
          : await recordDto.createRecord({
              data: {
                habitId,
                date,
                status: values.status,
                durationMinutes,
                notes: values.notes ?? '',
                recoveryDate: values.recoveryDate,
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

  const handleMinutesChange = (value: string | number) => {
    const minutes = typeof value === 'string' ? 0 : (value ?? 0)
    form.setFieldValue('durationMinutes', minutes)

    if (typeof minutes === 'number') {
      form.setFieldValue('durationHours', minutesToHours(minutes))
    } else {
      form.setFieldValue('durationHours', 0)
    }
  }

  const handleHoursChange = (value: string | number) => {
    const hours = typeof value === 'string' ? 0 : (value ?? 0)
    form.setFieldValue('durationHours', hours)

    if (typeof hours === 'number') {
      form.setFieldValue('durationMinutes', hoursToMinutes(hours))
    } else {
      form.setFieldValue('durationMinutes', 0)
    }
  }

  const getNotesConfig = () => {
    switch (form.values.status) {
      case 'completed':
        return {
          label: '実施内容・振り返り',
          placeholder: `例：
・ランニング 30分（5km）
・ストレッチ 10分
・筋トレ（腕立て20回×3セット）

良かった点：
・早朝に実施できて気持ちよかった
・前回より楽に走れた

改善点：
・ストレッチの時間をもう少し増やしたい`,
        }

      case 'skipped':
        return {
          label: 'スキップの理由・今後の対策',
          placeholder: `例：
スキップした理由：
・仕事の緊急対応で時間が取れなかった
・体調が優れなかった

今後の対策：
・明日の朝に実施する
・週末にまとめて取り組む
・次回は時間を短縮してでも実施する`,
        }

      default:
        return {
          label: '実施予定・メモ',
          placeholder: `例：
実施予定：
・ランニング 30分
・ストレッチ 10分

目標・意識すること：
・フォームに気をつける
・無理せず自分のペースで`,
        }
    }
  }

  const notesConfig = getNotesConfig()

  const triggerSubmit = () => {
    const values = form.values

    handleSubmit(values)
  }

  return {
    form,
    isPending,
    statusOptions,
    isFutureDate,
    editorContent,
    setEditorContent,
    isEditorModalOpen,
    setIsEditorModalOpen,
    editorKey,
    setEditorKey,
    handleSubmit,
    handleMinutesChange,
    handleHoursChange,
    notesConfig,
    triggerSubmit,
  } as const
}

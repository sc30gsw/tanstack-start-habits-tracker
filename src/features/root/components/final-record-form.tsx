import { Button, Group, Kbd, Stack, Text, Tooltip } from '@mantine/core'
import { useForm } from '@mantine/form'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { IconDeviceFloppy } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, useRouter } from '@tanstack/react-router'
import dayjs from 'dayjs'
import type { InferSelectModel } from 'drizzle-orm'
import { useEffect, useState, useTransition } from 'react'
import { z } from 'zod/v4'
import { RichTextEditor } from '~/components/ui/rich-text-editor/rich-text-editor-lazy'
import { GET_RECORD_BY_HABIT_AND_DATE_CACHE_KEY } from '~/constants/cache-key'
import type { habits as HabitTable } from '~/db/schema'
import { stopwatchDto } from '~/features/root/server/stopwatch-functions'
import { convertSecondsToMinutes } from '~/features/root/utils/stopwatch-utils'

const finishRecordFormSchema = z.object({
  notes: z.string().optional(),
})

type FinishRecordFormProps = {
  elapsedSeconds: number
  habitId: InferSelectModel<typeof HabitTable>['id']
}

export function FinishRecordForm({ elapsedSeconds, habitId }: FinishRecordFormProps) {
  const routeApi = getRouteApi('__root__')
  const navigate = routeApi.useNavigate()
  const router = useRouter()

  const [isPending, startTransition] = useTransition()

  const today = dayjs().format('YYYY-MM-DD')
  const durationMinutes = convertSecondsToMinutes(elapsedSeconds)

  const { data: existingRecordResponse } = useSuspenseQuery({
    queryKey: [GET_RECORD_BY_HABIT_AND_DATE_CACHE_KEY, habitId, today],
    queryFn: () => stopwatchDto.getRecordByHabitAndDate({ data: { habitId, date: today } }),
  })

  const existingRecord = existingRecordResponse?.data

  const [editorContent, setEditorContent] = useState(existingRecord?.notes || '')

  const form = useForm<z.infer<typeof finishRecordFormSchema>>({
    initialValues: {
      notes: existingRecord?.notes || '',
    },
    validate: (values) => {
      const result = finishRecordFormSchema.safeParse(values)

      if (result.success) {
        return {}
      }

      const fieldErrors: Record<string, string> = {}

      for (const issue of result.error.issues) {
        const path = issue.path[0]

        if (typeof path === 'string' && !fieldErrors[path]) {
          fieldErrors[path] = issue.message
        }
      }

      return fieldErrors
    },
  })

  // Sync editor content with form
  useEffect(() => {
    form.setFieldValue('notes', editorContent)
  }, [editorContent])

  const handleSubmit = (values: z.infer<typeof finishRecordFormSchema>) => {
    startTransition(async () => {
      try {
        const today = dayjs().format('YYYY-MM-DD')

        const result = await stopwatchDto.saveStopwatchRecord({
          data: {
            habitId,
            durationMinutes,
            status: existingRecord ? 'completed' : durationMinutes === 0 ? 'skipped' : 'completed',
            notes: values.notes !== undefined ? values.notes.trim() : undefined,
            date: today,
          },
        })

        if (result.success) {
          router.invalidate()

          notifications.show({
            title: '✅ 記録完了',
            message: `${durationMinutes}分の習慣を記録しました`,
            color: 'green',
          })

          modals.closeAll()

          navigate({
            to: '/habits/$habitId',
            params: { habitId },
            search: {
              stopwatchOpen: false,
              stopwatchHabitId: null,
              stopwatchRunning: false,
              stopwatchStartTime: null,
              stopwatchElapsed: 0,
            },
          })
        } else {
          notifications.show({
            title: 'エラー',
            message: result.error ?? '記録に失敗しました',
            color: 'red',
          })
        }
      } catch {
        notifications.show({
          title: 'エラー',
          message: '記録に失敗しました',
          color: 'red',
        })
      }
    })
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
      <Stack gap="md">
        {existingRecord ? (
          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              本日はすでに記録があります。時間とメモを追加します。
            </Text>
            <Group gap="md">
              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  既存:
                </Text>
                <Text size="sm" fw={600}>
                  {existingRecord.duration_minutes}分
                </Text>
              </Group>
              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  追加:
                </Text>
                <Text size="sm" fw={600} c="blue">
                  +{durationMinutes}分
                </Text>
              </Group>
              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  合計:
                </Text>
                <Text size="lg" fw={700} c="green">
                  {(existingRecord.duration_minutes ?? 0) + durationMinutes}分
                </Text>
              </Group>
            </Group>
          </Stack>
        ) : (
          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              ここまでの習慣を記録しますか？
            </Text>
            <Group gap="xs">
              <Text size="lg" fw={600}>
                記録時間:
              </Text>
              <Text size="lg" fw={700} c="blue">
                {durationMinutes}分
              </Text>
            </Group>
          </Stack>
        )}

        <Stack gap="xs">
          <Text size="sm" fw={500}>
            {existingRecord
              ? '実施内容・振り返り（既存のメモに追記されます）'
              : '実施内容・振り返り'}
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
            onSubmit={() => form.onSubmit(handleSubmit)()}
          />
        </Stack>

        <Group gap="sm" align="center">
          <Tooltip
            label={
              <Stack gap={4} align="center">
                <Text size="sm">Record now</Text>
                <Group gap={4}>
                  <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                    ⌘
                  </Kbd>
                  <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                    Return
                  </Kbd>
                </Group>
              </Stack>
            }
            position="top"
            withArrow
          >
            <Button
              type="submit"
              loading={isPending}
              disabled={isPending}
              leftSection={<IconDeviceFloppy size={18} />}
            >
              記録する
            </Button>
          </Tooltip>
          <Button variant="outline" onClick={() => modals.closeAll()} disabled={isPending}>
            キャンセル
          </Button>
        </Group>
      </Stack>
    </form>
  )
}

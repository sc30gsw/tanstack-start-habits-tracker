import { Badge, Button, Card, Group, Stack, Text, useComputedColorScheme } from '@mantine/core'
import { IconCalendarEvent, IconCheck, IconEdit, IconPlus, IconX } from '@tabler/icons-react'
import { useRouter } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { RecordDeleteButton } from '~/features/habits/components/record-delete-button'
import { RecordForm } from '~/features/habits/components/record-form'
import type { RecordEntity } from '~/features/habits/types/habit'
import { formatDuration } from '~/features/habits/utils/time-utils'

type DateDetailProps = {
  selectedDate: Date | null
  selectedDateRecord: RecordEntity | null
  habitId: string
  showRecordForm: boolean
  editingRecord: RecordEntity | null
  onShowRecordForm: (show: boolean) => void
  onEditingRecord: (record: RecordEntity | null) => void
}

export function DateDetail({
  selectedDate,
  selectedDateRecord,
  habitId,
  showRecordForm,
  editingRecord,
  onShowRecordForm,
  onEditingRecord,
}: DateDetailProps) {
  const router = useRouter()
  const computedColorScheme = useComputedColorScheme('light')
  const titleColor = computedColorScheme === 'dark' ? 'gray.1' : 'dark.8'
  const textColor = 'gray.6' // ユニバーサルカラー（light/dark両対応）

  return (
    <Card withBorder padding="lg" radius="md" shadow="sm">
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="xs" align="center">
            <IconCalendarEvent size={24} color="var(--mantine-color-blue-6)" />
            <Text size="lg" fw={600} c={titleColor}>
              {selectedDate ? dayjs(selectedDate).format('YYYY年MM月DD日') : '日付を選択'}
            </Text>
          </Group>
          {selectedDate && !selectedDateRecord && !editingRecord && (
            <Button
              size="sm"
              leftSection={<IconPlus size={16} />}
              onClick={() => onShowRecordForm(true)}
            >
              記録追加
            </Button>
          )}
          {selectedDateRecord && !editingRecord && !showRecordForm && (
            <Group gap="xs">
              <Button
                size="sm"
                variant="outline"
                leftSection={<IconEdit size={16} />}
                onClick={() => onEditingRecord(selectedDateRecord)}
              >
                編集
              </Button>
              <RecordDeleteButton recordId={selectedDateRecord.id} variant="button" />
            </Group>
          )}
        </Group>

        {selectedDateRecord && !editingRecord && !showRecordForm ? (
          <Stack gap="sm">
            <Group gap="sm">
              <Badge
                variant="filled"
                color={selectedDateRecord.completed ? 'green' : 'yellow'}
                leftSection={
                  selectedDateRecord.completed ? <IconCheck size={14} /> : <IconX size={14} />
                }
              >
                {selectedDateRecord.completed ? '完了' : '未完了'}
              </Badge>
              {(selectedDateRecord.duration_minutes || 0) > 0 && (
                <Badge variant="light" color="blue">
                  {formatDuration(selectedDateRecord.duration_minutes || 0)}
                </Badge>
              )}
            </Group>
            {selectedDateRecord.notes && (
              <Stack gap="xs">
                <Text size="sm" fw={500} c={textColor}>
                  メモ・感想
                </Text>
                <Text
                  size="sm"
                  c={titleColor}
                  style={{
                    whiteSpace: 'pre-wrap',
                    backgroundColor: 'var(--mantine-color-gray-0)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--mantine-color-gray-2)',
                  }}
                >
                  {selectedDateRecord.notes}
                </Text>
              </Stack>
            )}
          </Stack>
        ) : selectedDate && !editingRecord && !showRecordForm ? (
          <Text c="dimmed" fs="italic">
            この日の記録はありません
          </Text>
        ) : (
          <Text c="dimmed" fs="italic">
            カレンダーから日付を選択してください
          </Text>
        )}

        {(showRecordForm || editingRecord) && selectedDate && (
          <RecordForm
            habitId={habitId}
            date={dayjs(selectedDate).format('YYYY-MM-DD')}
            existingRecord={editingRecord || undefined}
            onSuccess={() => {
              onShowRecordForm(false)
              onEditingRecord(null)
              router.invalidate()
            }}
            onCancel={() => {
              onShowRecordForm(false)
              onEditingRecord(null)
            }}
          />
        )}
      </Stack>
    </Card>
  )
}

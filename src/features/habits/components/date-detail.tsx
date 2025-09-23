import { Badge, Button, Card, Group, Stack, Text } from '@mantine/core'
import { useRouter } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { RecordDeleteButton } from '~/features/habits/components/record-delete-button'
import { RecordForm } from '~/features/habits/components/record-form'
import type { RecordEntity } from '~/features/habits/types/habit'

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

  return (
    <Card withBorder padding="lg">
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="lg" fw={500}>
            {selectedDate ? dayjs(selectedDate).format('YYYY年MM月DD日') : '日付を選択'}
          </Text>
          {selectedDate && !selectedDateRecord && !editingRecord && (
            <Button size="sm" onClick={() => onShowRecordForm(true)}>
              記録追加
            </Button>
          )}
          {selectedDateRecord && !editingRecord && !showRecordForm && (
            <Group gap="xs">
              <Button
                size="sm"
                variant="outline"
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
              <Badge variant="filled" color={selectedDateRecord.completed ? 'green' : 'yellow'}>
                {selectedDateRecord.completed ? '完了' : '未完了'}
              </Badge>
              {(selectedDateRecord.duration_minutes || 0) > 0 && (
                <Badge variant="light" color="blue">
                  {selectedDateRecord.duration_minutes}分
                </Badge>
              )}
            </Group>
          </Stack>
        ) : selectedDate && !editingRecord && !showRecordForm ? (
          <Text c="dimmed">この日の記録はありません</Text>
        ) : (
          <Text c="dimmed">カレンダーから日付を選択してください</Text>
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

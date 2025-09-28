import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Text,
  useComputedColorScheme,
} from '@mantine/core'
import { IconCalendarEvent, IconCheck, IconEdit, IconPlus, IconX } from '@tabler/icons-react'
import { getRouteApi, useRouter } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { RecordForm } from '~/features/habits/components/form/record-form'
import { RecordDeleteButton } from '~/features/habits/components/record-delete-button'
import type { HabitTable, RecordEntity } from '~/features/habits/types/habit'
import { getValidatedDate } from '~/features/habits/types/schemas/search-params'
import { formatDuration } from '~/features/habits/utils/time-utils'

type DateDetailProps = {
  selectedDateRecord: RecordEntity | null
  habitId: HabitTable['id']
}

export function DateDetail({ selectedDateRecord, habitId }: DateDetailProps) {
  const apiRoute = getRouteApi('/habits/$habitId')
  const searchParams = apiRoute.useSearch()
  const selectedDate = getValidatedDate(searchParams?.selectedDate)
  const showRecordForm = searchParams?.showRecordForm
  const navigate = apiRoute.useNavigate()

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
          {showRecordForm ? (
            <ActionIcon
              size="sm"
              variant="transparent"
              radius="xl"
              color="gray"
              onClick={() => {
                navigate({
                  search: (prev) => ({
                    ...prev,
                    showRecordForm: false,
                  }),
                })
              }}
            >
              <IconX size={18} />
            </ActionIcon>
          ) : (
            <>
              {selectedDate && !selectedDateRecord && (
                <Button
                  size="sm"
                  leftSection={<IconPlus size={16} />}
                  onClick={() => {
                    navigate({
                      search: (prev) => ({
                        ...prev,
                        showRecordForm: true,
                      }),
                    })
                  }}
                >
                  記録追加
                </Button>
              )}
              {selectedDateRecord && (
                <Group gap="xs">
                  <Button
                    size="sm"
                    variant="outline"
                    leftSection={<IconEdit size={16} />}
                    onClick={() => {
                      navigate({
                        search: (prev) => ({
                          ...prev,
                          showRecordForm: true,
                        }),
                      })
                    }}
                  >
                    編集
                  </Button>
                  <RecordDeleteButton recordId={selectedDateRecord.id} variant="button" />
                </Group>
              )}
            </>
          )}
        </Group>

        {selectedDateRecord && !showRecordForm ? (
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
                    backgroundColor:
                      computedColorScheme === 'dark'
                        ? 'var(--mantine-color-dark-6)'
                        : 'var(--mantine-color-gray-0)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border:
                      computedColorScheme === 'dark'
                        ? '1px solid var(--mantine-color-dark-4)'
                        : '1px solid var(--mantine-color-gray-2)',
                  }}
                >
                  {selectedDateRecord.notes}
                </Text>
              </Stack>
            )}
          </Stack>
        ) : selectedDate && !showRecordForm ? (
          <Text c="dimmed" fs="italic">
            この日の記録はありません
          </Text>
        ) : (
          <Text c="dimmed" fs="italic">
            カレンダーから日付を選択してください
          </Text>
        )}

        {showRecordForm && selectedDate && (
          <RecordForm
            habitId={habitId}
            date={dayjs(selectedDate).format('YYYY-MM-DD')}
            existingRecord={selectedDateRecord || undefined}
            onSuccess={() => {
              navigate({
                search: (prev) => ({
                  ...prev,
                  showRecordForm: false,
                }),
              })
              router.invalidate()
            }}
            onCancel={() => {
              navigate({
                search: (prev) => ({
                  ...prev,
                  showRecordForm: false,
                }),
              })
            }}
          />
        )}
      </Stack>
    </Card>
  )
}

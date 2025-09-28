import { Card, Stack, Text } from '@mantine/core'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import type { RecordEntity } from '~/features/habits/types/habit'
import { getValidatedDate } from '~/features/habits/types/schemas/search-params'
import { formatDuration } from '~/features/habits/utils/time-utils'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

export function DayView({ selectedDateRecord }: Record<'selectedDateRecord', RecordEntity | null>) {
  const apiRoute = getRouteApi('/habits/$habitId')
  const searchParams = apiRoute.useSearch()
  const selectedDate = getValidatedDate(searchParams?.selectedDate)

  const formattedDate = selectedDate ? dayjs(selectedDate).format('YYYY/MM/DD (ddd)') : '日付未選択'

  const recordDetails = selectedDateRecord
    ? ([
        { label: '状態', value: selectedDateRecord.completed ? '完了' : '未完了' },
        { label: '時間', value: formatDuration(selectedDateRecord.duration_minutes || 0) },
        { label: '作成', value: dayjs(selectedDateRecord.created_at).format('HH:mm') },
      ] as const satisfies readonly Record<string, string>[])
    : []

  return (
    <Card withBorder padding="sm">
      <Stack gap={4}>
        <Text size="sm" fw={500}>
          {formattedDate}
        </Text>
        {selectedDateRecord ? (
          <Stack gap={4}>
            {recordDetails.map(({ label, value }) => (
              <Text key={label} size="sm">
                {label}: {value}
              </Text>
            ))}
          </Stack>
        ) : (
          <Text size="sm" c="dimmed">
            記録はありません
          </Text>
        )}
      </Stack>
    </Card>
  )
}

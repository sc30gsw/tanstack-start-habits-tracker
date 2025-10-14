import { Card, Stack, Text } from '@mantine/core'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { getValidatedDate } from '~/features/habits/types/schemas/search-params'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

export function HomeDayView() {
  const apiRoute = getRouteApi('/')
  const searchParams = apiRoute.useSearch()
  const selectedDate = getValidatedDate(searchParams?.selectedDate)
  const { records } = apiRoute.useLoaderData()

  const formattedDate = selectedDate ? dayjs(selectedDate).format('YYYY/MM/DD (ddd)') : '日付未選択'

  const dateString = selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : null
  const completedRecords = dateString
    ? (records.data?.filter((r) => r.date === dateString && r.status === 'completed') ?? [])
    : []

  return (
    <Card withBorder padding="sm">
      <Stack gap={4}>
        <Text size="sm" fw={500}>
          選択日: {formattedDate}
        </Text>
        {completedRecords.length > 0 && (
          <Stack gap={4} mt={8}>
            <Text size="xs" c="dimmed" fw={500}>
              完了した習慣 ({completedRecords.length}件)
            </Text>
            <Stack gap={2}>
              {completedRecords.map((record) => (
                <Text
                  key={record.id}
                  size="sm"
                  style={{
                    backgroundColor: 'rgba(34,139,230,0.1)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {record.habit?.name}
                </Text>
              ))}
            </Stack>
          </Stack>
        )}
      </Stack>
    </Card>
  )
}

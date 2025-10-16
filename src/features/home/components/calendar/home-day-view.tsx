import { Box, Card, Flex, Stack, Text } from '@mantine/core'
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
                <Flex
                  key={record.id}
                  gap={6}
                  align="center"
                  style={{
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    w={4}
                    h={18}
                    style={{
                      backgroundColor: `var(--mantine-color-${record.habit?.color ?? 'blue'}-6)`,
                      borderRadius: '2px',
                      flexShrink: 0,
                    }}
                  />
                  <Text
                    size="sm"
                    ta="left"
                    style={{
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {record.habit?.name}
                  </Text>
                </Flex>
              ))}
            </Stack>
          </Stack>
        )}
      </Stack>
    </Card>
  )
}

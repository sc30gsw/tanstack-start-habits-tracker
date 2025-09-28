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

  const formattedDate = selectedDate ? dayjs(selectedDate).format('YYYY/MM/DD (ddd)') : '日付未選択'

  return (
    <Card withBorder padding="sm">
      <Stack gap={4}>
        <Text size="sm" fw={500}>
          選択日: {formattedDate}
        </Text>
      </Stack>
    </Card>
  )
}

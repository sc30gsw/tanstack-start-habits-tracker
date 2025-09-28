import { Group, Stack, Text } from '@mantine/core'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { getValidatedDate } from '~/features/habits/types/schemas/search-params'
import { HomeCalendarDateCell } from '~/features/home/components/calendar/home-calendar-date-cell'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

const WEEK_DAYS = ['日', '月', '火', '水', '木', '金', '土'] as const satisfies readonly string[]

export function HomeWeekView() {
  const apiRoute = getRouteApi('/')
  const searchParams = apiRoute.useSearch()
  const selectedDate = getValidatedDate(searchParams?.selectedDate)

  const startOfWeek = selectedDate
    ? dayjs(selectedDate).tz('Asia/Tokyo').startOf('week')
    : dayjs().tz('Asia/Tokyo').startOf('week')
  const weekDates = Array.from({ length: 7 }).map((_, i) => startOfWeek.add(i, 'day'))

  return (
    <Stack gap={4}>
      <Group gap={4} justify="space-between" wrap="nowrap">
        {WEEK_DAYS.map((d, index) => (
          <Text
            key={d}
            size="xs"
            c={index === 0 ? 'red.7' : index === 6 ? 'blue.7' : 'dimmed'}
            style={{
              flex: 1,
              textAlign: 'center',
              fontWeight: index === 0 || index === 6 ? 600 : 400,
            }}
          >
            {d}
          </Text>
        ))}
      </Group>

      <Group gap={4} wrap="nowrap" justify="space-between">
        {weekDates.map((date) => (
          <HomeCalendarDateCell key={date.format('YYYY-MM-DD')} date={date} variant="week" />
        ))}
      </Group>
    </Stack>
  )
}

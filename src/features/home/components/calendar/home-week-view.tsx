import { ActionIcon, Center, Group, Stack, Text } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { getValidatedDate } from '~/features/habits/types/schemas/search-params'
import { WEEK_DAYS } from '~/features/habits/utils/calendar-utils'
import { HomeCalendarDateCell } from '~/features/home/components/calendar/home-calendar-date-cell'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

export function HomeWeekView() {
  const apiRoute = getRouteApi('/')
  const navigate = useNavigate({ from: '/' })
  const searchParams = apiRoute.useSearch()
  const selectedDate = getValidatedDate(searchParams?.selectedDate)

  const currentDate = selectedDate ? dayjs(selectedDate).tz('Asia/Tokyo') : dayjs().tz('Asia/Tokyo')
  const startOfWeek = currentDate.startOf('week')
  const weekDates = Array.from({ length: 7 }).map((_, i) => startOfWeek.add(i, 'day'))

  const weekEnd = weekDates[6]
  const weekRangeText =
    startOfWeek.year() !== weekEnd.year()
      ? `${startOfWeek.format('YYYY/MM/DD')} - ${weekEnd.format('YYYY/MM/DD')}`
      : `${startOfWeek.format('YYYY/MM/DD')} - ${weekEnd.format('MM/DD')}`

  const handlePrevWeek = () => {
    const newDate = currentDate.subtract(1, 'week')

    navigate({
      search: (prev) => ({
        ...prev,
        selectedDate: newDate.format('YYYY-MM-DD'),
        preset: undefined,
      }),
    })
  }

  const handleNextWeek = () => {
    const newDate = currentDate.add(1, 'week')

    navigate({
      search: (prev) => ({
        ...prev,
        selectedDate: newDate.format('YYYY-MM-DD'),
        preset: undefined,
      }),
    })
  }

  return (
    <Stack gap={4}>
      <Center>
        <DateInput
          size="sm"
          value={currentDate.toDate()}
          onChange={(date) => {
            if (date) {
              navigate({
                search: (prev) => ({
                  ...prev,
                  selectedDate: dayjs(date).format('YYYY-MM-DD'),
                  preset: undefined,
                }),
              })
            }
          }}
          valueFormat="YYYY年MM月DD日"
          placeholder="日付を選択"
          popoverProps={{ position: 'bottom', withinPortal: true }}
        />
      </Center>

      <Group justify="space-between" mb={4}>
        <ActionIcon variant="subtle" aria-label="前週" onClick={handlePrevWeek}>
          <IconChevronLeft size={16} />
        </ActionIcon>
        <Text fw={500} size="sm">
          {weekRangeText}
        </Text>
        <ActionIcon variant="subtle" aria-label="翌週" onClick={handleNextWeek}>
          <IconChevronRight size={16} />
        </ActionIcon>
      </Group>

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

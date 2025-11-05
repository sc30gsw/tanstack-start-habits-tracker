import { ActionIcon, Group, Stack, Text } from '@mantine/core'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import type { NavigateOptions } from '@tanstack/react-router'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { CalendarDateCell } from '~/features/habits/components/calendar/calendar-date-cell'
import { CALENDAR_VIEW_HASH_TARGET } from '~/features/habits/constants/hash-target-ids'
import type { RecordEntity } from '~/features/habits/types/habit'
import type { SearchParams } from '~/features/habits/types/schemas/search-params'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

type WeekViewProps = {
  weekDates: dayjs.Dayjs[]
  recordMap: Record<string, RecordEntity>
  selectedDate: SearchParams['selectedDate']
  navigate: (options: NavigateOptions) => void
}

export function WeekView({ weekDates, recordMap, selectedDate, navigate }: WeekViewProps) {
  const currentDate = dayjs(selectedDate)
  const weekStart = weekDates[0]
  const weekEnd = weekDates[6]

  const weekRangeText =
    weekStart.year() !== weekEnd.year()
      ? `${weekStart.format('YYYY/MM/DD')} - ${weekEnd.format('YYYY/MM/DD')}`
      : `${weekStart.format('YYYY/MM/DD')} - ${weekEnd.format('MM/DD')}`

  const allRecords = Object.values(recordMap)

  const handlePrevWeek = () => {
    const newDate = currentDate.subtract(1, 'week')

    navigate({
      search: (prev) => ({
        ...prev,
        selectedDate: newDate.format('YYYY-MM-DD'),
        currentMonth: newDate.format('YYYY-MM'),
        preset: undefined,
        showRecordForm: false,
      }),
      hash: CALENDAR_VIEW_HASH_TARGET,
    })
  }

  const handleNextWeek = () => {
    const newDate = currentDate.add(1, 'week')

    navigate({
      search: (prev) => ({
        ...prev,
        selectedDate: newDate.format('YYYY-MM-DD'),
        currentMonth: newDate.format('YYYY-MM'),
        preset: undefined,
        showRecordForm: false,
      }),
      hash: CALENDAR_VIEW_HASH_TARGET,
    })
  }

  return (
    <Stack gap={16}>
      <Group justify="space-between" mb={4}>
        <ActionIcon variant="subtle" aria-label="前週" onClick={handlePrevWeek}>
          <IconChevronLeft size={16} />
        </ActionIcon>
        <Text fw={500}>{weekRangeText}</Text>
        <ActionIcon variant="subtle" aria-label="翌週" onClick={handleNextWeek}>
          <IconChevronRight size={16} />
        </ActionIcon>
      </Group>

      <Group gap={4} wrap="nowrap" justify="space-between">
        {weekDates.map((currentDate) => (
          <CalendarDateCell
            key={currentDate.format('YYYY-MM-DD')}
            date={currentDate}
            record={recordMap[currentDate.format('YYYY-MM-DD')]}
            allRecords={allRecords}
            variant="week"
            selectedDate={selectedDate}
            navigate={navigate}
          />
        ))}
      </Group>
    </Stack>
  )
}

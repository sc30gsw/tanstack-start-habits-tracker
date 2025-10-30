import { Group, Stack } from '@mantine/core'
import type { NavigateOptions } from '@tanstack/react-router'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { CalendarDateCell } from '~/features/habits/components/calendar/calendar-date-cell'
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
  return (
    <Stack gap={4}>
      <Group gap={4} wrap="nowrap" justify="space-between">
        {weekDates.map((currentDate) => (
          <CalendarDateCell
            key={currentDate.format('YYYY-MM-DD')}
            date={currentDate}
            record={recordMap[currentDate.format('YYYY-MM-DD')]}
            variant="week"
            selectedDate={selectedDate}
            navigate={navigate}
          />
        ))}
      </Group>
    </Stack>
  )
}

import { Group, Stack } from '@mantine/core'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import type { RecordEntity } from '~/features/habits/types/habit'
import { CalendarDateCell } from './calendar-date-cell'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

type WeekViewProps = {
  weekDates: dayjs.Dayjs[]
  recordMap: Record<string, RecordEntity>
}

export function WeekView({ weekDates, recordMap }: WeekViewProps) {
  return (
    <Stack gap={4}>
      <Group gap={4} wrap="nowrap" justify="space-between">
        {weekDates.map((currentDate) => (
          <CalendarDateCell
            key={currentDate.format('YYYY-MM-DD')}
            date={currentDate}
            record={recordMap[currentDate.format('YYYY-MM-DD')]}
            variant="week"
          />
        ))}
      </Group>
    </Stack>
  )
}

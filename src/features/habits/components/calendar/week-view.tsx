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
  onSelectedDateChange: (date: Date) => void
  recordMap: Record<string, RecordEntity>
}

export function WeekView({ weekDates, onSelectedDateChange, recordMap }: WeekViewProps) {
  return (
    <Stack gap={4}>
      <Group gap={4} wrap="nowrap" justify="space-between">
        {weekDates.map((currentDate) => (
          <CalendarDateCell
            key={currentDate.format('YYYY-MM-DD')}
            date={currentDate}
            record={recordMap[currentDate.format('YYYY-MM-DD')]}
            selectedDate={dayjs().tz('Asia/Tokyo').toDate()} // 週表示では今日の日付を選択状態とする
            onDateChange={onSelectedDateChange}
            variant="week"
          />
        ))}
      </Group>
    </Stack>
  )
}

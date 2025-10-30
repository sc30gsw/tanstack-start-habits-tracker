import { Stack, Text } from '@mantine/core'
import { DatePicker } from '@mantine/dates'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { PeriodSelector } from '~/features/habits/components/chart/period-selector'
import type { SearchParams } from '~/features/habits/types/schemas/search-params'
import { getDateColor, getDateType } from '~/features/habits/utils/calendar-utils'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

type TimePeriodControlsProps = {
  selectedDate?: string
  calendarView: SearchParams['calendarView']
  onDateChange: (date: string) => void
  onPeriodChange: (period: SearchParams['calendarView']) => void
}

export function TimePeriodControls({
  selectedDate,
  calendarView,
  onDateChange,
  onPeriodChange,
}: TimePeriodControlsProps) {
  const dateValue = selectedDate ? dayjs.tz(selectedDate, 'Asia/Tokyo').toDate() : dayjs().tz('Asia/Tokyo').toDate()

  return (
    <Stack gap="md">
      <div>
        <Text size="sm" fw={500} mb={8}>
          期間
        </Text>
        <PeriodSelector value={calendarView || 'month'} onChange={onPeriodChange} />
      </div>
      <div>
        <Text size="sm" fw={500} mb={8}>
          基準日
        </Text>
        <DatePicker
          value={dateValue}
          onChange={(date) => {
            if (date) {
              onDateChange(dayjs(date).tz('Asia/Tokyo').format('YYYY-MM-DD'))
            }
          }}
          getDayProps={(date) => {
            const dayjsDate = dayjs(date).tz('Asia/Tokyo')
            const dateType = getDateType(dayjsDate)
            const color = getDateColor(dateType, false, false, 7)

            return {
              style: {
                color,
              },
            }
          }}
        />
      </div>
    </Stack>
  )
}

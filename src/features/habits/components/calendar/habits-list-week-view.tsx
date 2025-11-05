import { ActionIcon, Group, Stack, Text } from '@mantine/core'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import type { NavigateOptions } from '@tanstack/react-router'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { HabitsListCalendarDateCell } from '~/features/habits/components/calendar/habits-list-calendar-date-cell'
import { CALENDAR_VIEW_HASH_TARGET } from '~/features/habits/constants/hash-target-ids'
import type { RecordEntity } from '~/features/habits/types/habit'
import { WEEK_DAYS } from '~/features/habits/utils/calendar-utils'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

type HabitsListWeekViewProps = {
  weekDates: dayjs.Dayjs[]
  records: RecordEntity[]
  navigate: (options: NavigateOptions) => void
}

export function HabitsListWeekView({ weekDates, records, navigate }: HabitsListWeekViewProps) {
  const currentDate = weekDates[0] || dayjs()
  const startOfWeek = currentDate.startOf('week')
  const endOfWeek = currentDate.endOf('week')
  const weekRange = `${startOfWeek.format('YYYY/MM/DD')} - ${endOfWeek.format('MM/DD')}`

  const handlePrevWeek = () => {
    const newMonth = currentDate.subtract(1, 'week')

    navigate({
      search: (prev) => ({
        ...prev,
        currentMonth: newMonth.format('YYYY-MM'),
      }),
      hash: CALENDAR_VIEW_HASH_TARGET,
    })
  }

  const handleNextWeek = () => {
    const newMonth = currentDate.add(1, 'week')

    navigate({
      search: (prev) => ({
        ...prev,
        currentMonth: newMonth.format('YYYY-MM'),
      }),
      hash: CALENDAR_VIEW_HASH_TARGET,
    })
  }

  return (
    <Stack gap={16}>
      <Text size="xs" c="dimmed" ta="center">
        ※ カレンダーには完了済みの習慣のみ表示されます
      </Text>

      <Group justify="space-between" mb={4}>
        <ActionIcon variant="subtle" aria-label="前週" onClick={handlePrevWeek}>
          <IconChevronLeft size={16} />
        </ActionIcon>
        <Text fw={500}>{weekRange}</Text>
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
          <HabitsListCalendarDateCell
            key={date.format('YYYY-MM-DD')}
            date={date}
            records={records}
            variant="week"
            showWeekday={false}
            selectedDate={undefined}
            navigate={navigate}
          />
        ))}
      </Group>
    </Stack>
  )
}

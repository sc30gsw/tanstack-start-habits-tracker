import { ActionIcon, Group, Stack, Text } from '@mantine/core'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import type { NavigateOptions } from '@tanstack/react-router'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { chunk } from 'remeda'
import { CalendarDateCell } from '~/features/habits/components/calendar/calendar-date-cell'
import { CalendarPresetsCombobox } from '~/features/habits/components/calendar/calendar-presets-combobox'
import type { RecordEntity } from '~/features/habits/types/habit'
import type { SearchParams } from '~/features/habits/types/schemas/search-params'
import { WEEK_DAYS } from '~/features/habits/utils/calendar-utils'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

function generateMonthDates(currentMonth: dayjs.Dayjs) {
  const monthStart = currentMonth.startOf('month')
  const monthEnd = currentMonth.endOf('month')
  const leadingDays = monthStart.day()
  const daysInMonth = monthEnd.date()

  const leadingDates = Array.from({ length: leadingDays }, (_, i) =>
    monthStart.subtract(leadingDays - i, 'day'),
  )

  const monthDates = Array.from({ length: daysInMonth }, (_, d) => monthStart.add(d, 'day'))

  const totalDates = [...leadingDates, ...monthDates] as const satisfies readonly dayjs.Dayjs[]
  const remainingCells = 42 - totalDates.length
  const trailingDates = Array.from({ length: remainingCells }, (_, i) =>
    totalDates[totalDates.length - 1].add(i + 1, 'day'),
  )

  return [...totalDates, ...trailingDates] as const satisfies readonly dayjs.Dayjs[]
}

function createWeekGroups(dates: readonly dayjs.Dayjs[]) {
  return chunk(dates, 7)
}

type MonthViewProps = {
  recordMap: Record<string, RecordEntity>
  selectedDate: SearchParams['selectedDate']
  currentMonth: SearchParams['currentMonth']
  navigate: (options: NavigateOptions) => void
}

export function MonthView({
  recordMap,
  selectedDate,
  currentMonth: currentMonthString,
  navigate,
}: MonthViewProps) {
  const currentMonth = dayjs
    .tz(currentMonthString || dayjs(selectedDate).format('YYYY-MM'), 'Asia/Tokyo')
    .isValid()
    ? dayjs
        .tz(currentMonthString || dayjs(selectedDate).format('YYYY-MM'), 'Asia/Tokyo')
        .startOf('month')
    : dayjs(selectedDate).startOf('month')
  const monthDates = generateMonthDates(currentMonth)
  const weeks = createWeekGroups(monthDates)

  return (
    <Stack gap={16}>
      <CalendarPresetsCombobox selectedDate={selectedDate} navigate={navigate} />

      <Group justify="space-between" mb={4}>
        <ActionIcon
          variant="subtle"
          aria-label="前月"
          onClick={() => {
            navigate({
              search: (prev) => ({
                ...prev,
                currentMonth: currentMonth.subtract(1, 'month').format('YYYY-MM'),
                preset: undefined,
              }),
            })
          }}
        >
          <IconChevronLeft size={16} />
        </ActionIcon>
        <Text fw={500}>{currentMonth.format('YYYY年MM月')}</Text>
        <ActionIcon
          variant="subtle"
          aria-label="翌月"
          onClick={() => {
            navigate({
              search: (prev) => ({
                ...prev,
                currentMonth: currentMonth.add(1, 'month').format('YYYY-MM'),
                preset: undefined,
              }),
            })
          }}
        >
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

      <Stack gap={4}>
        {weeks.map((week, weekIndex) => (
          <Group key={weekIndex} gap={4} wrap="nowrap" justify="space-between">
            {week.map((currentDate) => (
              <CalendarDateCell
                key={currentDate.format('YYYY-MM-DD')}
                date={currentDate}
                record={recordMap[currentDate.format('YYYY-MM-DD')]}
                isCurrentMonth={currentDate.month() === currentMonth.month()}
                variant="month"
                selectedDate={selectedDate}
                navigate={navigate}
              />
            ))}
          </Group>
        ))}
      </Stack>
    </Stack>
  )
}

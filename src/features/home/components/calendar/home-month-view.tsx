import { ActionIcon, Group, Select, Stack, Text } from '@mantine/core'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { chunk } from 'remeda'
import { getValidatedDate } from '~/features/habits/types/schemas/search-params'
import { getDatePresets, WEEK_DAYS } from '~/features/habits/utils/calendar-utils'
import { HomeCalendarDateCell } from '~/features/home/components/calendar/home-calendar-date-cell'
import { CALENDAR_ID } from '~/features/home/components/home-calendar-view'

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

  return [...totalDates, ...trailingDates] as const
}

function createWeekGroups(dates: readonly dayjs.Dayjs[]) {
  return chunk(dates, 7)
}

export function HomeMonthView() {
  const apiRoute = getRouteApi('/')
  const searchParams = apiRoute.useSearch()
  const selectedDate = getValidatedDate(searchParams?.selectedDate)
  const currentMonthString = searchParams?.currentMonth || dayjs(selectedDate).format('YYYY-MM')
  const currentMonth = dayjs.tz(currentMonthString, 'Asia/Tokyo').isValid()
    ? dayjs.tz(currentMonthString, 'Asia/Tokyo').startOf('month')
    : dayjs(selectedDate).startOf('month')
  const monthDates = generateMonthDates(currentMonth)
  const weeks = createWeekGroups(monthDates)

  const navigate = apiRoute.useNavigate()
  const allPresets = getDatePresets()

  const datePresets = allPresets.reduce(
    (acc, preset) => {
      if (!acc.some((p) => p.value === preset.value)) {
        acc.push({ value: preset.value, label: preset.label })
      }
      return acc
    },
    [] as Record<'value' | 'label', string>[],
  )

  const handlePresetChange = (value: string | null) => {
    if (value) {
      navigate({
        search: (prev) => ({
          ...prev,
          selectedDate: value,
          currentMonth: dayjs(value).format('YYYY-MM'),
          preset: value,
        }),
        hash: CALENDAR_ID,
      })
    } else {
      navigate({
        search: (prev) => ({
          ...prev,
          preset: undefined,
        }),
        hash: CALENDAR_ID,
      })
    }
  }

  return (
    <Stack gap={4}>
      <Select
        placeholder="日付プリセットを選択"
        data={datePresets.map((preset) => ({
          value: preset.value,
          label: preset.label,
        }))}
        value={searchParams?.preset || dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD')}
        onChange={handlePresetChange}
        comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
        clearable
        searchable
        size="xs"
      />

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
              hash: CALENDAR_ID,
            })
          }}
        >
          ‹
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
              hash: CALENDAR_ID,
            })
          }}
        >
          ›
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
              <HomeCalendarDateCell
                key={currentDate.format('YYYY-MM-DD')}
                date={currentDate}
                isCurrentMonth={currentDate.month() === currentMonth.month()}
                variant="month"
              />
            ))}
          </Group>
        ))}
      </Stack>
    </Stack>
  )
}

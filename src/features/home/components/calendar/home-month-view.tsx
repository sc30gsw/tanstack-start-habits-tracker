import type { SelectProps } from '@mantine/core'
import { ActionIcon, Badge, Group, Select, Stack, Text } from '@mantine/core'
import {
  IconCalendar,
  IconCalendarMonth,
  IconCalendarWeek,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
} from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { chunk } from 'remeda'
import { getValidatedDate } from '~/features/habits/types/schemas/search-params'
import {
  getDateColor,
  getDatePresets,
  type getDateType,
  WEEK_DAYS,
} from '~/features/habits/utils/calendar-utils'
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

// TODO: グループごとにアイコンを表示する場合は以下を使用
const iconProps = { size: 16, stroke: 1.5 }
const _groupIcons: Record<string, React.ReactNode> = {
  基本: <IconCalendar {...iconProps} />,
  週: <IconCalendarWeek {...iconProps} />,
  月: <IconCalendarMonth {...iconProps} />,
  年: <IconClock {...iconProps} />,
}

const renderSelectOption: SelectProps['renderOption'] = ({ option, checked }) => {
  const item: Record<'label' | 'value', string> &
    Partial<Record<'dateStr' | 'dayOfWeek', string>> &
    Partial<Record<'dateType', ReturnType<typeof getDateType>>> = option

  return (
    <Group flex="1" gap="xs">
      {item.label}
      {item.dateStr && <Text size="sm">{item.dateStr}</Text>}
      {item.dayOfWeek && item.dateType && (
        <Badge size="sm" color={getDateColor(item.dateType, undefined, undefined, 4)}>
          {item.dayOfWeek}
        </Badge>
      )}
      {checked && <IconCheck style={{ marginInlineStart: 'auto' }} stroke={1.5} size={16} />}
    </Group>
  )
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

  const seenValues = new Set<string>()
  const selectData = allPresets.map((preset) => ({
    group: preset.groupLabel,
    items: preset.items.filter((item) => {
      if (seenValues.has(item.value)) {
        return false
      }

      seenValues.add(item.value)

      return true
    }),
  }))

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
        placeholder="日付を選択 (昨日、今日、明日など)"
        data={selectData}
        value={searchParams?.preset || dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD')}
        onChange={handlePresetChange}
        comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
        renderOption={renderSelectOption}
        clearable
        searchable
        size="xs"
        leftSection={<IconCalendar size={18} stroke={1.5} />}
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
              hash: CALENDAR_ID,
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

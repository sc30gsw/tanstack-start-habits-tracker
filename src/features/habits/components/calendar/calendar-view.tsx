import { Card, Group, SegmentedControl, Stack, Text, useComputedColorScheme } from '@mantine/core'
import { IconCalendar } from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { DayView } from '~/features/habits/components/calendar/day-view'
import { MonthView } from '~/features/habits/components/calendar/month-view'
import { WeekView } from '~/features/habits/components/calendar/week-view'
import type { RecordEntity } from '~/features/habits/types/habit'
import type { SearchParams } from '~/features/habits/types/schemas/search-params'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

type CalendarViewProps = {
  onCalendarViewChange: (view: NonNullable<SearchParams['calendarView']>) => void
  currentMonth: dayjs.Dayjs
  onCurrentMonthChange: (month: dayjs.Dayjs) => void
  onSelectedDateChange: (date: Date) => void
  selectedDateRecord: RecordEntity | null
  recordMap: Record<string, RecordEntity>
}

export function CalendarView({
  onCalendarViewChange,
  currentMonth,
  onCurrentMonthChange,
  onSelectedDateChange,
  selectedDateRecord,
  recordMap,
}: CalendarViewProps) {
  const apiRoute = getRouteApi('/habits/$habitId')
  const searchParams = apiRoute.useSearch()
  const calendarView = searchParams?.calendarView || 'month'
  const selectedDate = searchParams?.selectedDate

  const startOfWeek = selectedDate
    ? dayjs(selectedDate).tz('Asia/Tokyo').startOf('week')
    : dayjs().tz('Asia/Tokyo').startOf('week')
  const weekDates = Array.from({ length: 7 }).map((_, i) => startOfWeek.add(i, 'day'))
  const computedColorScheme = useComputedColorScheme('light')
  const titleColor = computedColorScheme === 'dark' ? 'gray.1' : 'dark.8'

  return (
    <Card withBorder padding="lg" radius="md" shadow="sm">
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Group gap="xs" align="center">
            <IconCalendar size={24} color="var(--mantine-color-blue-6)" />
            <Text size="lg" fw={600} c={titleColor}>
              カレンダー
            </Text>
          </Group>
          <SegmentedControl
            size="xs"
            value={calendarView}
            onChange={(v) => onCalendarViewChange(v as NonNullable<SearchParams['calendarView']>)}
            data={[
              { label: '月', value: 'month' },
              { label: '週', value: 'week' },
              { label: '日', value: 'day' },
            ]}
          />
        </Group>

        <div className="relative">
          <div
            className={`${calendarView === 'month' ? 'relative z-10' : 'invisible absolute inset-0 z-0'}`}
          >
            <MonthView
              currentMonth={currentMonth}
              onCurrentMonthChange={onCurrentMonthChange}
              onSelectedDateChange={onSelectedDateChange}
              recordMap={recordMap}
            />
          </div>

          <div
            className={`${calendarView === 'week' ? 'relative z-10' : 'invisible absolute inset-0 z-0'}`}
          >
            <WeekView
              weekDates={weekDates}
              onSelectedDateChange={onSelectedDateChange}
              recordMap={recordMap}
            />
          </div>

          <div
            className={`${calendarView === 'day' ? 'relative z-10' : 'invisible absolute inset-0 z-0'}`}
          >
            <DayView selectedDateRecord={selectedDateRecord} />
          </div>
        </div>
      </Stack>
    </Card>
  )
}

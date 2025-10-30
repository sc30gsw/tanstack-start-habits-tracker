import { Card, Group, SegmentedControl, Stack, Text, useComputedColorScheme } from '@mantine/core'
import { IconCalendar } from '@tabler/icons-react'
import type { NavigateOptions } from '@tanstack/react-router'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { useMemo } from 'react'
import { DayView } from '~/features/habits/components/calendar/day-view'
import { MonthView } from '~/features/habits/components/calendar/month-view'
import { WeekView } from '~/features/habits/components/calendar/week-view'
import { CALENDAR_VIEW_HASH_TARGET } from '~/features/habits/constants/hash-target-ids'
import type { HabitEntity, RecordEntity } from '~/features/habits/types/habit'
import type { SearchParams } from '~/features/habits/types/schemas/search-params'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

type CalendarViewProps = {
  recordMap: Record<string, RecordEntity>
  calendarView: SearchParams['calendarView']
  selectedDate: SearchParams['selectedDate']
  currentMonth: SearchParams['currentMonth']
  navigate: (options: NavigateOptions) => void
  habits?: HabitEntity[]
}

export function CalendarView({
  recordMap,
  calendarView,
  selectedDate,
  currentMonth,
  navigate,
  habits = [],
}: CalendarViewProps) {
  const startOfWeek = selectedDate
    ? dayjs(selectedDate).tz('Asia/Tokyo').startOf('week')
    : dayjs().tz('Asia/Tokyo').startOf('week')
  const weekDates = Array.from({ length: 7 }).map((_, i) => startOfWeek.add(i, 'day'))
  const computedColorScheme = useComputedColorScheme('light')
  const titleColor = computedColorScheme === 'dark' ? 'gray.1' : 'dark.8'

  const selectedDateRecords = useMemo(() => {
    if (!selectedDate) {
      return []
    }

    const targetDate = dayjs(selectedDate)

    return Object.values(recordMap).filter((record) => dayjs(record.date).isSame(targetDate, 'day'))
  }, [selectedDate, recordMap])

  return (
    <Card withBorder padding="lg" radius="md" shadow="sm" id={CALENDAR_VIEW_HASH_TARGET}>
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
            onChange={(v) =>
              navigate({
                search: (prev) => ({
                  ...prev,
                  calendarView: v as SearchParams['calendarView'],
                }),
              })
            }
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
              recordMap={recordMap}
              selectedDate={selectedDate}
              currentMonth={currentMonth}
              navigate={navigate}
            />
          </div>

          <div
            className={`${calendarView === 'week' ? 'relative z-10' : 'invisible absolute inset-0 z-0'}`}
          >
            <WeekView
              weekDates={weekDates}
              recordMap={recordMap}
              selectedDate={selectedDate}
              navigate={navigate}
            />
          </div>

          <div
            className={`${calendarView === 'day' ? 'relative z-10' : 'invisible absolute inset-0 z-0'}`}
          >
            <DayView
              selectedDateRecords={selectedDateRecords}
              selectedDate={selectedDate}
              habits={habits}
              navigate={navigate}
            />
          </div>
        </div>
      </Stack>
    </Card>
  )
}

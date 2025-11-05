import {
  Card,
  Center,
  Group,
  SegmentedControl,
  Stack,
  Text,
  useComputedColorScheme,
} from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { IconCalendar } from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import type { SearchParams } from '~/features/habits/types/schemas/search-params'
import { HomeDayView } from '~/features/home/components/calendar/home-day-view'
import { HomeMonthView } from '~/features/home/components/calendar/home-month-view'
import { HomeWeekView } from '~/features/home/components/calendar/home-week-view'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

export const CALENDAR_ID = 'calendar'

export function HomeCalendarView() {
  const apiRoute = getRouteApi('/')
  const searchParams = apiRoute.useSearch()
  const calendarView = searchParams?.calendarView || 'month'

  const navigate = apiRoute.useNavigate()

  const computedColorScheme = useComputedColorScheme('light')
  const titleColor = computedColorScheme === 'dark' ? 'gray.1' : 'dark.8'

  // DateInputの値を決定（selectedDateが最優先）
  const selectedDate = searchParams.selectedDate
    ? dayjs.tz(searchParams.selectedDate, 'Asia/Tokyo')
    : searchParams.currentMonth
      ? dayjs.tz(searchParams.currentMonth, 'Asia/Tokyo').startOf('month')
      : dayjs().tz('Asia/Tokyo')

  const dateInputValue = selectedDate.toDate()

  return (
    <Card id={CALENDAR_ID} withBorder padding="lg" radius="md" shadow="sm">
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Group gap="xs" align="center">
            <IconCalendar size={24} color="var(--mantine-color-blue-6)" />
            <Text size="lg" fw={600} c={titleColor}>
              カレンダー
            </Text>
          </Group>
          <Center>
            <DateInput
              size="sm"
              value={dateInputValue}
              onChange={(date) => {
                if (date) {
                  const newDate = dayjs(date)
                  navigate({
                    search: (prev) => ({
                      ...prev,
                      selectedDate: newDate.format('YYYY-MM-DD'),
                      currentMonth: newDate.format('YYYY-MM'),
                    }),
                    hash: CALENDAR_ID,
                  })
                }
              }}
              valueFormat="YYYY年MM月DD日"
              placeholder="日付を選択"
              popoverProps={{ position: 'bottom', withinPortal: true }}
            />
          </Center>
          <SegmentedControl
            size="xs"
            value={calendarView}
            onChange={(v) =>
              navigate({
                search: (prev) => ({
                  ...prev,
                  calendarView: v as SearchParams['calendarView'],
                }),
                hash: CALENDAR_ID,
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
            <HomeMonthView />
          </div>

          <div
            className={`${calendarView === 'week' ? 'relative z-10' : 'invisible absolute inset-0 z-0'}`}
          >
            <HomeWeekView />
          </div>

          <div
            className={`${calendarView === 'day' ? 'relative z-10' : 'invisible absolute inset-0 z-0'}`}
          >
            <HomeDayView />
          </div>
        </div>
      </Stack>
    </Card>
  )
}

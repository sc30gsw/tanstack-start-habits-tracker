import { ActionIcon, Group, Stack, Text } from '@mantine/core'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { chunk } from 'remeda'
import { CalendarDateCell } from '~/features/habits/components/calendar/calendar-date-cell'
import type { RecordEntity } from '~/features/habits/types/habit'
import { getValidatedDate } from '~/features/habits/types/schemas/search-params'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

const WEEK_DAYS = ['日', '月', '火', '水', '木', '金', '土'] as const satisfies readonly string[]

// 月の日付データを生成する関数
function generateMonthDates(currentMonth: dayjs.Dayjs) {
  const monthStart = currentMonth.startOf('month')
  const monthEnd = currentMonth.endOf('month')
  const leadingDays = monthStart.day()
  const daysInMonth = monthEnd.date()

  // 先頭の空白日（前月の末尾日）を生成
  const leadingDates = Array.from({ length: leadingDays }, (_, i) =>
    monthStart.subtract(leadingDays - i, 'day'),
  )

  // 当月の日付を生成
  const monthDates = Array.from({ length: daysInMonth }, (_, d) => monthStart.add(d, 'day'))

  // 6週間分（42セル）になるまで末尾の日付を追加
  const totalDates = [...leadingDates, ...monthDates] as const satisfies readonly dayjs.Dayjs[]
  const remainingCells = 42 - totalDates.length
  const trailingDates = Array.from({ length: remainingCells }, (_, i) =>
    totalDates[totalDates.length - 1].add(i + 1, 'day'),
  )

  return [...totalDates, ...trailingDates] as const
}

// 週ごとのグループに分割する関数
function createWeekGroups(dates: readonly dayjs.Dayjs[]) {
  return chunk(dates, 7)
}

export function MonthView({ recordMap }: Record<'recordMap', Record<string, RecordEntity>>) {
  // 日付計算ロジックを抽出した関数を使用
  // URLパラメータから安全に初期値を取得
  const apiRoute = getRouteApi('/habits/$habitId')
  const searchParams = apiRoute.useSearch()
  const selectedDate = getValidatedDate(searchParams?.selectedDate)
  // currentMonthをsearchParamsから取得し、無効な値の場合はselectedDateの月を使用
  const currentMonthString = searchParams?.currentMonth || dayjs(selectedDate).format('YYYY-MM')
  const currentMonth = dayjs.tz(currentMonthString, 'Asia/Tokyo').isValid()
    ? dayjs.tz(currentMonthString, 'Asia/Tokyo').startOf('month')
    : dayjs(selectedDate).startOf('month')
  const monthDates = generateMonthDates(currentMonth)
  const weeks = createWeekGroups(monthDates)

  const navigate = apiRoute.useNavigate()

  return (
    <Stack gap={4}>
      <Group justify="space-between" mb={4}>
        <ActionIcon
          variant="subtle"
          aria-label="前月"
          onClick={() => {
            navigate({
              search: (prev) => ({
                ...prev,
                currentMonth: currentMonth.subtract(1, 'month').format('YYYY-MM'),
              }),
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
              }),
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
              <CalendarDateCell
                key={currentDate.format('YYYY-MM-DD')}
                date={currentDate}
                record={recordMap[currentDate.format('YYYY-MM-DD')]}
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

import {
  ActionIcon,
  Badge,
  Card,
  type CSSProperties,
  Group,
  SegmentedControl,
  Stack,
  Text,
  Tooltip,
  useComputedColorScheme,
} from '@mantine/core'
import { IconCalendar } from '@tabler/icons-react'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

import type { RecordEntity } from '~/features/habits/types/habit'
import { getDateColor, getDateTextColor, getDateType } from '~/features/habits/utils/calendar-utils'
import { formatDuration } from '~/features/habits/utils/time-utils'

type CalendarViewProps = {
  calendarView: 'month' | 'week' | 'day'
  onCalendarViewChange: (view: 'month' | 'week' | 'day') => void
  currentMonth: dayjs.Dayjs
  onCurrentMonthChange: (month: dayjs.Dayjs) => void
  selectedDate: Date | null
  onSelectedDateChange: (date: Date) => void
  selectedDateRecord: RecordEntity | null
  recordMap: Record<string, RecordEntity>
}

export function CalendarView({
  calendarView,
  onCalendarViewChange,
  currentMonth,
  onCurrentMonthChange,
  selectedDate,
  onSelectedDateChange,
  selectedDateRecord,
  recordMap,
}: CalendarViewProps) {
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
            onChange={(v) => onCalendarViewChange(v as 'month' | 'week' | 'day')}
            data={[
              { label: '月', value: 'month' },
              { label: '週', value: 'week' },
              { label: '日', value: 'day' },
            ]}
          />
        </Group>

        {calendarView === 'month' && (
          <MonthView
            currentMonth={currentMonth}
            onCurrentMonthChange={onCurrentMonthChange}
            selectedDate={selectedDate}
            onSelectedDateChange={onSelectedDateChange}
            recordMap={recordMap}
          />
        )}

        {calendarView === 'week' && (
          <WeekView
            weekDates={weekDates}
            onSelectedDateChange={onSelectedDateChange}
            recordMap={recordMap}
          />
        )}

        {calendarView === 'day' && (
          <DayView selectedDate={selectedDate} selectedDateRecord={selectedDateRecord} />
        )}
      </Stack>
    </Card>
  )
}

type MonthViewProps = {
  currentMonth: dayjs.Dayjs
  onCurrentMonthChange: (month: dayjs.Dayjs) => void
  selectedDate: Date | null
  onSelectedDateChange: (date: Date) => void
  recordMap: Record<string, RecordEntity>
}

function MonthView({
  currentMonth,
  onCurrentMonthChange,
  selectedDate,
  onSelectedDateChange,
  recordMap,
}: MonthViewProps) {
  const start = currentMonth.startOf('month')
  const end = currentMonth.endOf('month')
  const days: dayjs.Dayjs[] = []
  const leading = start.day()

  for (let i = 0; i < leading; i++) {
    days.push(start.subtract(leading - i, 'day'))
  }
  for (let d = 0; d < end.date(); d++) {
    days.push(start.add(d, 'day'))
  }

  // trailing to fill 42 cells (6 weeks)
  while (days.length % 7 !== 0 || days.length < 42) {
    days.push(days[days.length - 1].add(1, 'day'))
  }

  const weeks: dayjs.Dayjs[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return (
    <Stack gap={4}>
      <Group justify="space-between" mb={4}>
        <ActionIcon
          variant="subtle"
          aria-label="前月"
          onClick={() => onCurrentMonthChange(currentMonth.subtract(1, 'month'))}
        >
          ‹
        </ActionIcon>
        <Text fw={500}>{currentMonth.format('YYYY年MM月')}</Text>
        <ActionIcon
          variant="subtle"
          aria-label="翌月"
          onClick={() => onCurrentMonthChange(currentMonth.add(1, 'month'))}
        >
          ›
        </ActionIcon>
      </Group>

      <Group gap={4} justify="space-between" wrap="nowrap">
        {['日', '月', '火', '水', '木', '金', '土'].map((d, index) => (
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
        {weeks.map((week, wi) => (
          <Group key={wi} gap={4} wrap="nowrap" justify="space-between">
            {week.map((d) => {
              const iso = d.format('YYYY-MM-DD')
              const rec = recordMap[iso]
              const isCurrentMonth = d.month() === currentMonth.month()
              const isSelected = !!(selectedDate && d.isSame(selectedDate, 'day'))
              const isFuture = d.isAfter(dayjs().tz('Asia/Tokyo'), 'day')
              const dateType = getDateType(d)
              const hasRecord = !!rec

              // 背景色とボーダーを分けて管理
              let backgroundColor: string
              let borderColor: string = 'transparent'
              const borderWidth: string = '2px'

              if (rec) {
                // 記録がある場合
                backgroundColor = rec.completed
                  ? isSelected
                    ? 'var(--mantine-color-green-7)' // 選択された完了日は濃い緑
                    : 'var(--mantine-color-green-6)' // 通常の完了日
                  : isSelected
                    ? 'var(--mantine-color-yellow-6)' // 選択された未完了日は濃い黄
                    : 'var(--mantine-color-yellow-5)' // 通常の未完了日

                // 選択時は青いボーダーを追加
                if (isSelected) {
                  borderColor = 'var(--mantine-color-blue-6)'
                }
              } else {
                // 記録がない場合
                if (isSelected) {
                  backgroundColor = 'var(--mantine-color-blue-6)'
                  borderColor = 'var(--mantine-color-blue-8)'
                } else {
                  backgroundColor = getDateColor(dateType, false, hasRecord)
                }
              }

              const textColor = getDateTextColor(dateType, isSelected, hasRecord, isFuture)

              return (
                <Tooltip
                  key={iso}
                  withinPortal
                  label={
                    rec
                      ? `${rec.completed ? '完了' : '未完了'} / ${formatDuration(rec.duration_minutes || 0)}`
                      : '記録なし'
                  }
                >
                  <Card
                    onClick={() => !isFuture && onSelectedDateChange(d.toDate())}
                    padding="xs"
                    withBorder
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      cursor: isFuture ? 'not-allowed' : 'pointer',
                      opacity: isCurrentMonth ? (isFuture ? 0.3 : 1) : 0.35,
                      backgroundColor,
                      color: textColor,
                      minWidth: 34,
                      border: `${borderWidth} solid ${borderColor}`,
                      boxShadow: isSelected ? '0 0 0 1px var(--mantine-color-blue-6)' : undefined,
                    }}
                  >
                    <Text size="sm" fw={500}>
                      {d.date()}
                    </Text>
                  </Card>
                </Tooltip>
              )
            })}
          </Group>
        ))}
      </Stack>
    </Stack>
  )
}

type WeekViewProps = {
  weekDates: dayjs.Dayjs[]
  onSelectedDateChange: (date: Date) => void
  recordMap: Record<string, RecordEntity>
}

function WeekView({ weekDates, onSelectedDateChange, recordMap }: WeekViewProps) {
  return (
    <Stack gap={4}>
      <Group gap={4} wrap="nowrap" justify="space-between">
        {weekDates.map((d) => {
          const iso = d.format('YYYY-MM-DD')
          const rec = recordMap[iso]
          const isFuture = d.isAfter(dayjs().tz('Asia/Tokyo'), 'day')
          const dateType = getDateType(d)
          const hasRecord = !!rec

          // 選択状態の判定（週表示では現在日付をベースに判定）
          const isSelected = d.isSame(dayjs().tz('Asia/Tokyo'), 'day')

          // 背景色とボーダーを分けて管理
          let backgroundColor: CSSProperties['backgroundColor']
          let borderColor: CSSProperties['borderColor'] = 'transparent'
          const borderWidth: CSSProperties['borderWidth'] = '2px'

          if (rec) {
            // 記録がある場合
            backgroundColor = rec.completed
              ? isSelected
                ? 'var(--mantine-color-green-7)' // 選択された完了日は濃い緑
                : 'var(--mantine-color-green-6)' // 通常の完了日
              : isSelected
                ? 'var(--mantine-color-yellow-6)' // 選択された未完了日は濃い黄
                : 'var(--mantine-color-yellow-5)' // 通常の未完了日

            // 選択時は青いボーダーを追加
            if (isSelected) {
              borderColor = 'var(--mantine-color-blue-6)'
            }
          } else {
            // 記録がない場合
            if (isSelected) {
              backgroundColor = 'var(--mantine-color-blue-6)'
              borderColor = 'var(--mantine-color-blue-8)'
            } else {
              backgroundColor = getDateColor(dateType, false, hasRecord)
            }
          }

          const textColor = getDateTextColor(dateType, isSelected, hasRecord, isFuture)

          return (
            <Card
              key={iso}
              withBorder
              padding="xs"
              style={{
                flex: 1,
                textAlign: 'center',
                cursor: isFuture ? 'not-allowed' : 'pointer',
                opacity: isFuture ? 0.5 : 1,
                backgroundColor,
                color: textColor,
                border: `${borderWidth} solid ${borderColor}`,
                boxShadow: isSelected ? '0 0 0 1px var(--mantine-color-blue-6)' : undefined,
              }}
              onClick={() => !isFuture && onSelectedDateChange(d.toDate())}
            >
              <Text
                size="xs"
                c={dateType === 'sunday' ? 'red.7' : dateType === 'saturday' ? 'blue.7' : 'dimmed'}
              >
                {d.format('dd')}
              </Text>
              <Text fw={500}>{d.date()}</Text>
              {rec && (
                <Badge size="xs" color={rec.completed ? 'green' : 'yellow'} variant="filled" mt={4}>
                  {formatDuration(rec.duration_minutes || 0)}
                </Badge>
              )}
            </Card>
          )
        })}
      </Group>
    </Stack>
  )
}

type DayViewProps = {
  selectedDate: Date | null
  selectedDateRecord: RecordEntity | null
}

function DayView({ selectedDate, selectedDateRecord }: DayViewProps) {
  return (
    <Card withBorder padding="sm">
      <Stack gap={4}>
        <Text size="sm" fw={500}>
          {selectedDate ? dayjs(selectedDate).format('YYYY/MM/DD (ddd)') : '日付未選択'}
        </Text>
        {selectedDateRecord ? (
          <Stack gap={4}>
            <Text size="sm">状態: {selectedDateRecord.completed ? '完了' : '未完了'}</Text>
            <Text size="sm">時間: {formatDuration(selectedDateRecord.duration_minutes || 0)}</Text>
            <Text size="sm">作成: {dayjs(selectedDateRecord.created_at).format('HH:mm')}</Text>
          </Stack>
        ) : (
          <Text size="sm" c="dimmed">
            記録はありません
          </Text>
        )}
      </Stack>
    </Card>
  )
}

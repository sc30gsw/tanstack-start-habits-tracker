import {
  ActionIcon,
  Badge,
  Card,
  Group,
  SegmentedControl,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core'
import dayjs from 'dayjs'
import type { RecordEntity } from '~/features/habits/types/habit'

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
  const startOfWeek = selectedDate ? dayjs(selectedDate).startOf('week') : dayjs().startOf('week')
  const weekDates = Array.from({ length: 7 }).map((_, i) => startOfWeek.add(i, 'day'))

  return (
    <Card withBorder padding="lg">
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Text size="lg" fw={500}>
            カレンダー
          </Text>
          <SegmentedControl
            size="xs"
            value={calendarView}
            onChange={(v: any) => onCalendarViewChange(v)}
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
        {['日', '月', '火', '水', '木', '金', '土'].map((d) => (
          <Text key={d} size="xs" c="dimmed" style={{ flex: 1, textAlign: 'center' }}>
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
              const isSelected = selectedDate && d.isSame(selectedDate, 'day')
              const isFuture = d.isAfter(dayjs(), 'day')
              const bg = rec
                ? rec.completed
                  ? 'var(--mantine-color-green-6)'
                  : 'var(--mantine-color-yellow-5)'
                : isSelected
                  ? 'var(--mantine-color-blue-6)'
                  : 'var(--mantine-color-dark-4)'

              return (
                <Tooltip
                  key={iso}
                  withinPortal
                  label={
                    rec
                      ? `${rec.completed ? '完了' : '未完了'} / ${rec.duration_minutes}分`
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
                      backgroundColor: isSelected || rec ? bg : undefined,
                      color:
                        isSelected || rec
                          ? '#fff'
                          : isFuture
                            ? 'var(--mantine-color-gray-5)'
                            : undefined,
                      minWidth: 34,
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
          const isFuture = d.isAfter(dayjs(), 'day')

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
                color: isFuture ? 'var(--mantine-color-gray-5)' : undefined,
              }}
              onClick={() => !isFuture && onSelectedDateChange(d.toDate())}
            >
              <Text size="xs" c="dimmed">
                {d.format('dd')}
              </Text>
              <Text fw={500}>{d.date()}</Text>
              {rec && (
                <Badge size="xs" color={rec.completed ? 'green' : 'yellow'} variant="filled" mt={4}>
                  {rec.duration_minutes || 0}分
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
            <Text size="sm">時間: {selectedDateRecord.duration_minutes}分</Text>
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

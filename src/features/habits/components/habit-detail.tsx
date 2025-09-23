import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Fieldset,
  Grid,
  Group,
  List,
  Radio,
  SegmentedControl,
  Select,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core'
import { useNavigate, useRouter } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useState } from 'react'
import { HabitHeatmap } from '~/features/habits/components/habit-heatmap'
import { RecordForm } from '~/features/habits/components/record-form'
import type { HabitEntity, RecordEntity } from '~/features/habits/types/habit'

type HabitDetailProps = {
  habit: HabitEntity
  records: RecordEntity[]
  habitsList?: HabitEntity[]
}

export function HabitDetail({ habit, records, habitsList = [] }: HabitDetailProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [showRecordForm, setShowRecordForm] = useState(false)
  const router = useRouter()
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month')
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'))
  const [metric, setMetric] = useState<'duration' | 'completion'>('duration')
  const navigate = useNavigate({ from: '/habits/$habitId' })

  // 日付 -> record 集計マップ
  const recordMap = records.reduce<Record<string, RecordEntity>>((acc, r) => {
    acc[r.date] = r
    return acc
  }, {})

  const startOfWeek = selectedDate ? dayjs(selectedDate).startOf('week') : dayjs().startOf('week')
  const weekDates = Array.from({ length: 7 }).map((_, i) => startOfWeek.add(i, 'day'))

  // 選択された日付の記録を取得
  const selectedDateRecord = selectedDate
    ? records.find((record) => dayjs(record.date).isSame(dayjs(selectedDate), 'day'))
    : null

  // 統計情報の計算
  const totalRecords = records.length
  const completedRecords = records.filter((r) => r.completed).length
  const completionRate = totalRecords > 0 ? completedRecords / totalRecords : 0
  const totalDuration = records.reduce((sum, r) => sum + (r.duration_minutes || 0), 0)

  return (
    <Stack gap="lg">
      {/* 習慣情報カード */}
      <Card withBorder padding="lg">
        <Stack gap="sm">
          <Text size="lg" fw={500}>
            習慣詳細
          </Text>
          {habitsList.length > 1 && (
            <Select
              label="習慣を切り替える"
              size="xs"
              searchable
              value={habit.id}
              onChange={(value) => {
                if (value && value !== habit.id) {
                  navigate({ to: '/habits/$habitId', params: { habitId: value } })
                }
              }}
              data={habitsList.map((h) => ({ value: h.id, label: h.name }))}
            />
          )}
          {habit.description && <Text c="dimmed">{habit.description}</Text>}
          <Group gap="md">
            <Badge variant="light" color="habit">
              総記録数: {totalRecords}
            </Badge>
            <Badge variant="light" color="success">
              達成率: {Math.round(completionRate * 100)}%
            </Badge>
            <Badge variant="light" color="duration">
              総時間: {totalDuration}分
            </Badge>
          </Group>
        </Stack>
      </Card>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder padding="lg">
            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <Text size="lg" fw={500}>
                  カレンダー
                </Text>
                <SegmentedControl
                  size="xs"
                  value={calendarView}
                  onChange={(v: any) => setCalendarView(v)}
                  data={[
                    { label: '月', value: 'month' },
                    { label: '週', value: 'week' },
                    { label: '日', value: 'day' },
                  ]}
                />
              </Group>
              {calendarView === 'month' && (
                <Stack gap={4}>
                  <Group justify="space-between" mb={4}>
                    <ActionIcon
                      variant="subtle"
                      aria-label="前月"
                      onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))}
                    >
                      ‹
                    </ActionIcon>
                    <Text fw={500}>{currentMonth.format('YYYY年MM月')}</Text>
                    <ActionIcon
                      variant="subtle"
                      aria-label="翌月"
                      onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))}
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
                  {(() => {
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
                        {weeks.map((week, wi) => (
                          <Group key={wi} gap={4} wrap="nowrap" justify="space-between">
                            {week.map((d) => {
                              const iso = d.format('YYYY-MM-DD')
                              const rec = recordMap[iso]
                              const isCurrentMonth = d.month() === currentMonth.month()
                              const isSelected = selectedDate && d.isSame(selectedDate, 'day')
                              const isFuture = d.isAfter(dayjs(), 'day') // 明日以降かどうか
                              const bg = rec
                                ? rec.completed
                                  ? 'var(--mantine-color-green-6)'
                                  : 'var(--mantine-color-yellow-5)'
                                : isSelected
                                  ? 'var(--mantine-color-blue-6)'
                                  : 'var(--mantine-color-dark-4)' // fallback border color
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
                                    onClick={() => !isFuture && setSelectedDate(d.toDate())}
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
                    )
                  })()}
                </Stack>
              )}
              {calendarView === 'week' && (
                <Stack gap={4}>
                  <Group gap={4} wrap="nowrap" justify="space-between">
                    {weekDates.map((d) => {
                      const iso = d.format('YYYY-MM-DD')
                      const rec = recordMap[iso]
                      const isFuture = d.isAfter(dayjs(), 'day') // 明日以降かどうか
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
                          onClick={() => !isFuture && setSelectedDate(d.toDate())}
                        >
                          <Text size="xs" c="dimmed">
                            {d.format('dd')}
                          </Text>
                          <Text fw={500}>{d.date()}</Text>
                          {rec && (
                            <Badge
                              size="xs"
                              color={rec.completed ? 'green' : 'yellow'}
                              variant="filled"
                              mt={4}
                            >
                              {rec.duration_minutes || 0}分
                            </Badge>
                          )}
                        </Card>
                      )
                    })}
                  </Group>
                </Stack>
              )}
              {calendarView === 'day' && (
                <Card withBorder padding="sm">
                  <Stack gap={4}>
                    <Text size="sm" fw={500}>
                      {selectedDate ? dayjs(selectedDate).format('YYYY/MM/DD (ddd)') : '日付未選択'}
                    </Text>
                    {selectedDateRecord ? (
                      <List size="sm" spacing={4}>
                        <List.Item>
                          状態: {selectedDateRecord.completed ? '完了' : '未完了'}
                        </List.Item>
                        <List.Item>時間: {selectedDateRecord.duration_minutes}分</List.Item>
                        <List.Item>
                          作成: {dayjs(selectedDateRecord.created_at).format('HH:mm')}
                        </List.Item>
                      </List>
                    ) : (
                      <Text size="sm" c="dimmed">
                        記録はありません
                      </Text>
                    )}
                  </Stack>
                </Card>
              )}
            </Stack>
          </Card>
        </Grid.Col>

        {/* 選択された日付の詳細 */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder padding="lg">
            <Stack gap="md">
              <Group justify="space-between">
                <Text size="lg" fw={500}>
                  {selectedDate ? dayjs(selectedDate).format('YYYY年MM月DD日') : '日付を選択'}
                </Text>
                {selectedDate && !selectedDateRecord && (
                  <Button size="sm" onClick={() => setShowRecordForm(true)}>
                    記録追加
                  </Button>
                )}
              </Group>

              {selectedDateRecord ? (
                <Stack gap="sm">
                  <Group gap="sm">
                    <Badge
                      variant="filled"
                      color={selectedDateRecord.completed ? 'green' : 'yellow'}
                    >
                      {selectedDateRecord.completed ? '完了' : '未完了'}
                    </Badge>
                    {(selectedDateRecord.duration_minutes || 0) > 0 && (
                      <Badge variant="light" color="blue">
                        {selectedDateRecord.duration_minutes}分
                      </Badge>
                    )}
                  </Group>
                </Stack>
              ) : selectedDate ? (
                <Text c="dimmed">この日の記録はありません</Text>
              ) : (
                <Text c="dimmed">カレンダーから日付を選択してください</Text>
              )}

              {showRecordForm && selectedDate && (
                <RecordForm
                  habitId={habit.id}
                  date={dayjs(selectedDate).format('YYYY-MM-DD')}
                  onSuccess={() => {
                    setShowRecordForm(false)
                    router.invalidate()
                  }}
                  onCancel={() => setShowRecordForm(false)}
                />
              )}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* ヒートマップ */}
      <Card withBorder padding="lg">
        <Stack gap="md">
          <Text size="lg" fw={500}>
            年間ヒートマップ
          </Text>
          <Fieldset legend="表示指標" style={{ border: 'none', padding: 0 }}>
            <Radio.Group value={metric} onChange={(v: any) => setMetric(v)}>
              <Group gap="sm">
                <Radio value="duration" label="時間 (分)" />
                <Radio value="completion" label="達成状況" />
              </Group>
            </Radio.Group>
          </Fieldset>
          <HabitHeatmap
            records={records}
            onSelectDate={(date) => {
              setSelectedDate(dayjs(date).toDate())
            }}
            selectedDate={selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : null}
            metric={metric}
          />
        </Stack>
      </Card>
    </Stack>
  )
}

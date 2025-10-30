import { Badge, Card, Group, Stack, Text } from '@mantine/core'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import type { HabitEntity, RecordEntity } from '~/features/habits/types/habit'
import type { SearchParams } from '~/features/habits/types/schemas/search-params'
import { formatDuration } from '~/features/habits/utils/time-utils'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

const COLOR_MAP = {
  'purple.6': '#9c36b5',
  'blue.6': '#228be6',
  'yellow.6': '#fab005',
  'green.6': '#40c057',
  'red.6': '#fa5252',
  'orange.6': '#fd7e14',
  'pink.6': '#e64980',
  'grape.6': '#be4bdb',
  'violet.6': '#7950f2',
  'indigo.6': '#4c6ef5',
  'cyan.6': '#15aabf',
  'teal.6': '#12b886',
  'lime.6': '#82c91e',
  'gray.6': '#868e96',
} as const satisfies Record<string, string>

type DayViewProps = {
  selectedDateRecords: RecordEntity[]
  selectedDate: SearchParams['selectedDate']
  habits: HabitEntity[]
}

export function DayView({ selectedDateRecords, selectedDate, habits }: DayViewProps) {
  const formattedDate = selectedDate ? dayjs(selectedDate).format('YYYY/MM/DD (ddd)') : '日付未選択'

  const habitMap = new Map(habits.map((habit) => [habit.id, habit]))

  const recordsWithHabits = selectedDateRecords
    .map((record) => ({
      record,
      habit: habitMap.get(record.habitId),
    }))
    .filter((item) => item.habit)
    .sort((a, b) => (a.habit?.name || '').localeCompare(b.habit?.name || ''))

  const getStatusBadge = (status: RecordEntity['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge color="green" size="sm">
            完了
          </Badge>
        )
      case 'skipped':
        return (
          <Badge color="gray" size="sm">
            スキップ
          </Badge>
        )
      default:
        return (
          <Badge color="blue" size="sm">
            予定中
          </Badge>
        )
    }
  }

  return (
    <Card withBorder padding="lg" radius="md" shadow="sm">
      <Stack gap="md">
        <Text size="lg" fw={600}>
          {formattedDate}
        </Text>

        {recordsWithHabits.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="md">
            この日の記録はありません
          </Text>
        ) : (
          <Stack gap="sm">
            {recordsWithHabits.map(({ record, habit }) => {
              // データベースには "blue" のような形式で保存されているので、".6" を追加
              const habitColorRaw = habit?.color || 'gray'
              const habitColor = habitColorRaw.includes('.') ? habitColorRaw : `${habitColorRaw}.6`
              const color =
                COLOR_MAP[habitColor as keyof typeof COLOR_MAP] ||
                `var(--mantine-color-${habitColor.replace('.', '-')})`
              console.log(
                'Habit color raw:',
                habitColorRaw,
                'Habit color:',
                habitColor,
                'Resolved color:',
                color,
              )

              return (
                <Card key={record.id} withBorder padding="sm" radius="sm">
                  <Stack gap="xs">
                    <Group justify="space-between" align="center">
                      <Group gap="xs" align="center">
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: color,
                          }}
                        />
                        <Text size="sm" fw={500}>
                          {habit?.name}
                        </Text>
                      </Group>
                      {getStatusBadge(record.status)}
                    </Group>

                    <Text size="sm" c="dimmed">
                      実行時間: {formatDuration(record.duration_minutes || 0)}
                    </Text>
                  </Stack>
                </Card>
              )
            })}
          </Stack>
        )}
      </Stack>
    </Card>
  )
}

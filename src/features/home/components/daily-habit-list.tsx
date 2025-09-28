import { Badge, Card, Group, Stack, Text, Tooltip, useComputedColorScheme } from '@mantine/core'
import { IconCheck, IconClock, IconX } from '@tabler/icons-react'
import { getRouteApi, Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import type { HabitEntity, RecordEntity } from '~/features/habits/types/habit'
import { getValidatedDate } from '~/features/habits/types/schemas/search-params'
import { formatDuration } from '~/features/habits/utils/time-utils'

type DailyHabitListProps = {
  habits: HabitEntity[]
  records: RecordEntity[]
}

export function DailyHabitList({ habits, records }: DailyHabitListProps) {
  const apiRoute = getRouteApi('/')
  const searchParams = apiRoute.useSearch()
  const selectedDate = getValidatedDate(searchParams.selectedDate)

  const computedColorScheme = useComputedColorScheme('light')
  const titleColor = computedColorScheme === 'dark' ? 'gray.1' : 'dark.8'

  // 選択された日付の記録をマップ化
  const recordsMap = records.reduce(
    (acc, record) => {
      if (record.date === dayjs(selectedDate).format('YYYY-MM-DD')) {
        acc[record.habit_id] = record
      }
      return acc
    },
    {} as Record<string, RecordEntity>,
  )

  // 習慣と記録を結合し、完了/未完了で分類
  const habitsWithRecords = habits.map((habit) => {
    const record = recordsMap[habit.id]

    return {
      habit,
      record,
      isCompleted: record?.completed || false,
    }
  })

  const completedHabits = habitsWithRecords.filter((h) => h.isCompleted)
  const incompletedHabits = habitsWithRecords.filter((h) => !h.isCompleted)

  const formatDate = dayjs(selectedDate).format('YYYY年MM月DD日（dd）')

  return (
    <Card withBorder padding="lg" radius="md" shadow="sm">
      <Stack gap="md">
        <Group gap="xs" align="center">
          <IconCheck size={24} color="var(--mantine-color-green-6)" />
          <Text size="lg" fw={600} c={titleColor}>
            {formatDate}の習慣状況
          </Text>
        </Group>

        {/* 完了した習慣 */}
        <div>
          <Group gap="xs" align="center" mb="sm">
            <IconCheck size={18} color="var(--mantine-color-green-6)" />
            <Text size="md" fw={500} c="green.6">
              完了済み ({completedHabits.length})
            </Text>
          </Group>

          {completedHabits.length > 0 ? (
            <Stack gap="xs">
              {completedHabits.map(({ habit, record }) => (
                <Tooltip
                  key={habit.id}
                  label={
                    <>
                      <Text size="xs">✅ {habit.name}を完了しました！お疲れ様でした。</Text>
                      <br />
                      {record?.duration_minutes && record.duration_minutes > 0 ? (
                        <Text size="xs">実行時間: {formatDuration(record.duration_minutes)}</Text>
                      ) : (
                        ''
                      )}
                    </>
                  }
                  position="top"
                  withArrow
                >
                  <Link to="/habits/$habitId" params={() => ({ habitId: habit.id })}>
                    <Card withBorder radius="sm" p="sm" bg="green.0" style={{ cursor: 'pointer' }}>
                      <Group justify="space-between" align="center">
                        <Group gap="sm" align="center">
                          <div
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: `var(--mantine-color-${habit.color}-6)`,
                            }}
                          />
                          <Text size="sm" fw={500}>
                            {habit.name}
                          </Text>
                        </Group>
                        <Group gap="xs" align="center">
                          {record?.duration_minutes && record.duration_minutes > 0 && (
                            <Badge
                              variant="light"
                              color="blue"
                              size="sm"
                              leftSection={<IconClock size={12} />}
                            >
                              {formatDuration(record.duration_minutes)}
                            </Badge>
                          )}
                          <Badge variant="filled" color="green" size="sm">
                            完了
                          </Badge>
                        </Group>
                      </Group>
                    </Card>
                  </Link>
                </Tooltip>
              ))}
            </Stack>
          ) : (
            <Text size="sm" c="dimmed" fs="italic">
              完了した習慣がありません
            </Text>
          )}
        </div>

        {/* 未完了の習慣 */}
        <div>
          <Group gap="xs" align="center" mb="sm">
            <IconX size={18} color="var(--mantine-color-gray-6)" />
            <Text size="md" fw={500} c="gray.6">
              未完了 ({incompletedHabits.length})
            </Text>
          </Group>

          {incompletedHabits.length > 0 ? (
            <Stack gap="xs">
              {incompletedHabits.map(({ habit, record }) => (
                <Tooltip
                  key={habit.id}
                  label={
                    <Text size="xs">
                      💪 {habit.name}
                      に取り組んでみませんか？今日はまだ時間があります！
                      <br />
                      クリックして詳細を確認できます。
                    </Text>
                  }
                  position="top"
                  withArrow
                  color="blue"
                >
                  <Link to="/habits/$habitId" params={() => ({ habitId: habit.id })}>
                    <Card withBorder radius="sm" p="sm" bg="gray.0" style={{ cursor: 'pointer' }}>
                      <Group justify="space-between" align="center">
                        <Group gap="sm" align="center">
                          <div
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: `var(--mantine-color-${habit.color}-6)`,
                              opacity: 0.5,
                            }}
                          />
                          <Text size="sm" fw={500} c="gray.7">
                            {habit.name}
                          </Text>
                        </Group>
                        <Group gap="xs" align="center">
                          {record?.duration_minutes && record.duration_minutes > 0 && (
                            <Badge
                              variant="light"
                              color="gray"
                              size="sm"
                              leftSection={<IconClock size={12} />}
                            >
                              {formatDuration(record.duration_minutes)}
                            </Badge>
                          )}
                          <Badge variant="outline" color="gray" size="sm">
                            未完了
                          </Badge>
                        </Group>
                      </Group>
                      {record?.notes && (
                        <Text size="xs" c="dimmed" mt="xs">
                          {record.notes}
                        </Text>
                      )}
                    </Card>
                  </Link>
                </Tooltip>
              ))}
            </Stack>
          ) : (
            <Text size="sm" c="dimmed" fs="italic">
              未完了の習慣がありません
            </Text>
          )}
        </div>

        {/* 統計情報 */}
        <Card
          withBorder
          radius="sm"
          p="sm"
          bg={computedColorScheme === 'dark' ? 'dark.6' : 'gray.1'}
        >
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              完了率
            </Text>
            <Text
              size="sm"
              fw={600}
              c={completedHabits.length === habits.length ? 'green.6' : 'blue.6'}
            >
              {habits.length > 0 ? Math.round((completedHabits.length / habits.length) * 100) : 0}%
            </Text>
          </Group>
        </Card>
      </Stack>
    </Card>
  )
}

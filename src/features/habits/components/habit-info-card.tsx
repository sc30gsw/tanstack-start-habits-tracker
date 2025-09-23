import { Badge, Card, Group, Select, Stack, Text } from '@mantine/core'
import { useNavigate } from '@tanstack/react-router'
import type { HabitEntity, RecordEntity } from '~/features/habits/types/habit'

type HabitInfoCardProps = {
  habit: HabitEntity
  records: RecordEntity[]
  habitsList?: HabitEntity[]
}

export function HabitInfoCard({ habit, records, habitsList = [] }: HabitInfoCardProps) {
  const navigate = useNavigate({ from: '/habits/$habitId' })

  // 統計情報の計算
  const totalRecords = records.length
  const completedRecords = records.filter((r) => r.completed).length
  const completionRate = totalRecords > 0 ? completedRecords / totalRecords : 0
  const totalDuration = records.reduce((sum, r) => sum + (r.duration_minutes || 0), 0)

  return (
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
  )
}

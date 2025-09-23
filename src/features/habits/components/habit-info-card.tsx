import { Badge, Card, Group, Select, Stack, Text, useComputedColorScheme } from '@mantine/core'
import { IconChartLine, IconClock, IconTarget, IconTrophy } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import type { HabitEntity, RecordEntity } from '~/features/habits/types/habit'
import { formatTotalDuration } from '~/features/habits/utils/time-utils'

type HabitInfoCardProps = {
  habit: HabitEntity
  records: RecordEntity[]
  habitsList?: HabitEntity[]
}

export function HabitInfoCard({ habit, records, habitsList = [] }: HabitInfoCardProps) {
  const navigate = useNavigate({ from: '/habits/$habitId' })
  const computedColorScheme = useComputedColorScheme('light')
  const titleColor = computedColorScheme === 'dark' ? 'gray.1' : 'dark.8'

  // 統計情報の計算
  const totalRecords = records.length
  const completedRecords = records.filter((r) => r.completed).length
  const completionRate = totalRecords > 0 ? completedRecords / totalRecords : 0
  const totalDuration = records.reduce((sum, r) => sum + (r.duration_minutes || 0), 0)

  return (
    <Card withBorder padding="lg" radius="md" shadow="sm">
      <Stack gap="md">
        <Group gap="xs" align="center">
          <IconTarget size={24} color="var(--mantine-color-blue-6)" />
          <Text size="lg" fw={600} c={titleColor}>
            習慣詳細
          </Text>
        </Group>

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

        {habit.description && (
          <Text c="dimmed" fs="italic" size="sm">
            {habit.description}
          </Text>
        )}

        <Group gap="md" wrap="wrap">
          <Badge variant="light" color="blue" size="md" leftSection={<IconChartLine size={14} />}>
            総記録数: {totalRecords}
          </Badge>
          <Badge variant="light" color="green" size="md" leftSection={<IconTrophy size={14} />}>
            達成率: {Math.round(completionRate * 100)}%
          </Badge>
          <Badge variant="light" color="orange" size="md" leftSection={<IconClock size={14} />}>
            {formatTotalDuration(totalDuration)}
          </Badge>
        </Group>
      </Stack>
    </Card>
  )
}

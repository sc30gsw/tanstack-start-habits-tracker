import { Badge, Card, Group, Select, Stack, Text, useComputedColorScheme } from '@mantine/core'
import { IconChartLine, IconClock, IconFlag, IconTarget, IconTrophy } from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'
import type { HabitEntity, RecordEntity } from '~/features/habits/types/habit'
import { getValidatedDate } from '~/features/habits/types/schemas/search-params'
import { calculateCompletionRate } from '~/features/habits/utils/completion-rate-utils'
import { formatTotalDuration } from '~/features/habits/utils/time-utils'

type HabitInfoCardProps = {
  habit: HabitEntity
  records: RecordEntity[]
  habitsList?: HabitEntity[]
}

export function HabitInfoCard({ habit, records, habitsList = [] }: HabitInfoCardProps) {
  const apiRoute = getRouteApi('/habits/$habitId')

  const search = apiRoute.useSearch()
  const selectedDate = getValidatedDate(search.selectedDate)
  const calendarView = search.calendarView ?? 'month'
  const currentMonth = search.currentMonth

  const navigate = apiRoute.useNavigate()

  const computedColorScheme = useComputedColorScheme('light')
  const titleColor = computedColorScheme === 'dark' ? 'gray.1' : 'dark.8'

  // 統計情報の計算
  const totalRecords = records.length
  const totalDuration = records.reduce((sum, r) => sum + (r.duration_minutes || 0), 0)

  // 選択された期間に基づく達成率計算
  const { completionRate, completedDays, totalDays } = selectedDate
    ? calculateCompletionRate(records, selectedDate, calendarView, currentMonth)
    : {
        completionRate:
          totalRecords > 0
            ? records.filter((r) => r.status === 'completed').length / totalRecords
            : 0,
        completedDays: records.filter((r) => r.status === 'completed').length,
        totalDays: totalRecords,
      }

  // 優先度の表示設定
  const getPriorityConfig = (priority: string | null) => {
    switch (priority) {
      case 'high':
        return { label: '高', color: 'red', icon: <IconFlag size={14} /> }
      case 'middle':
        return { label: '中', color: 'yellow', icon: <IconFlag size={14} /> }
      case 'low':
        return { label: '低', color: 'blue', icon: <IconFlag size={14} /> }
      default:
        return { label: 'なし', color: 'gray', icon: <IconFlag size={14} /> }
    }
  }

  const priorityConfig = getPriorityConfig(habit.priority)

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
          <Badge
            variant="light"
            color={priorityConfig.color}
            size="md"
            leftSection={priorityConfig.icon}
          >
            優先度: {priorityConfig.label}
          </Badge>
          <Badge variant="light" color="blue" size="md" leftSection={<IconChartLine size={14} />}>
            総記録数: {totalRecords}
          </Badge>
          <Badge variant="light" color="green" size="md" leftSection={<IconTrophy size={14} />}>
            達成率: {Math.round(completionRate * 100)}%
            {selectedDate && ` (${completedDays}/${totalDays}日)`}
          </Badge>
          <Badge variant="light" color="orange" size="md" leftSection={<IconClock size={14} />}>
            {formatTotalDuration(totalDuration)}
          </Badge>
        </Group>
      </Stack>
    </Card>
  )
}

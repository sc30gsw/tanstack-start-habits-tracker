import { ActionIcon, Badge, Button, Group, Text, Tooltip } from '@mantine/core'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import type { HabitEntity } from '~/features/habits/types/habit'

type HabitDisplayProps = {
  habit: HabitEntity
  isLoading: boolean
  onEdit: () => void
  onDelete: () => void
}

export function HabitDisplay({ habit, isLoading, onEdit, onDelete }: HabitDisplayProps) {
  return (
    <Group justify="space-between" align="flex-start">
      <div style={{ flex: 1 }}>
        <Text fw={500} size="lg">
          {habit.name}
        </Text>
        {habit.description && (
          <Text c="dimmed" size="sm" mt="xs">
            {habit.description}
          </Text>
        )}
        <Group gap="xs" mt="sm">
          {habit.record_count !== undefined && (
            <Badge variant="light" color="habit">
              記録数: {habit.record_count}
            </Badge>
          )}
          {habit.completion_rate !== undefined && (
            <Badge variant="light" color="success">
              達成率: {Math.round(habit.completion_rate * 100)}%
            </Badge>
          )}
        </Group>
      </div>
      <Group gap={4} wrap="nowrap">
        <Tooltip label="編集">
          <ActionIcon variant="subtle" size="sm" onClick={onEdit}>
            <IconEdit stroke={2} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="削除">
          <ActionIcon color="red" variant="subtle" size="sm" loading={isLoading} onClick={onDelete}>
            <IconTrash stroke={2} />
          </ActionIcon>
        </Tooltip>
        <Button
          component={Link}
          to="/habits/$habitId"
          params={{ habitId: habit.id } as any}
          variant="light"
          size="xs"
        >
          詳細
        </Button>
      </Group>
    </Group>
  )
}

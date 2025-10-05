import { ActionIcon, Badge, Button, Group, Text, Tooltip } from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { IconEdit, IconFlag, IconTrash } from '@tabler/icons-react'
import { Link, useRouter } from '@tanstack/react-router'
import type { useTransition } from 'react'
import { useHabitColor } from '~/features/habits/hooks/use-habit-color'
import { habitDto } from '~/features/habits/server/habit-functions'
import type { HabitEntity } from '~/features/habits/types/habit'
import type { HabitColor } from '~/features/habits/types/schemas/habit-schemas'

type HabitDisplayProps = {
  habit: HabitEntity
  onEdit: () => void
  useTransition: ReturnType<typeof useTransition>
}

export function HabitDisplay({ habit, onEdit, useTransition }: HabitDisplayProps) {
  const [isPending, startTransition] = useTransition
  const router = useRouter()
  const { getHabitColor } = useHabitColor()

  // 優先度の表示設定
  const getPriorityConfig = (priority: string | null) => {
    switch (priority) {
      case 'high':
        return { label: '高', color: 'red', icon: <IconFlag size={12} /> }
      case 'middle':
        return { label: '中', color: 'yellow', icon: <IconFlag size={12} /> }
      case 'low':
        return { label: '低', color: 'blue', icon: <IconFlag size={12} /> }
      default:
        return { label: 'なし', color: 'gray', icon: <IconFlag size={12} /> }
    }
  }

  const priorityConfig = getPriorityConfig(habit.priority)

  const handleDelete = async () => {
    modals.openConfirmModal({
      title: '習慣の削除',
      children: (
        <Text size="sm">
          本当に削除しますか？ <br />
          この習慣の記録も削除されます。
        </Text>
      ),
      labels: { confirm: '削除', cancel: 'キャンセル' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        startTransition(async () => {
          try {
            const result = await habitDto.deleteHabit({ data: { id: habit.id } })

            if (result.success) {
              notifications.show({
                title: '成功',
                message: '習慣が削除されました',
                color: 'green',
              })

              router.invalidate()
            } else {
              notifications.show({
                title: 'エラー',
                message: result.error || '習慣の削除に失敗しました',
                color: 'red',
              })
            }
          } catch (_error) {
            notifications.show({
              title: 'エラー',
              message: '予期しないエラーが発生しました',
              color: 'red',
            })
          }
        })
      },
    })
  }

  return (
    <Group justify="space-between" align="flex-start">
      <div style={{ flex: 1 }}>
        <Group gap="sm" align="center">
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: getHabitColor(habit.color as HabitColor),
            }}
          />
          <Text fw={500} size="lg">
            {habit.name}
          </Text>
        </Group>
        {habit.description && (
          <Text c="dimmed" size="sm" mt="xs">
            {habit.description}
          </Text>
        )}
        <Group gap="xs" mt="sm">
          <Badge
            variant="light"
            color={priorityConfig.color}
            size="sm"
            leftSection={priorityConfig.icon}
          >
            優先度: {priorityConfig.label}
          </Badge>
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
          <ActionIcon
            color="red"
            variant="subtle"
            size="sm"
            loading={isPending}
            onClick={handleDelete}
          >
            <IconTrash stroke={2} />
          </ActionIcon>
        </Tooltip>
        <Button variant="light" size="xs">
          <Link to="/habits/$habitId" params={{ habitId: habit.id }}>
            詳細
          </Link>
        </Button>
      </Group>
    </Group>
  )
}

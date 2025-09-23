import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from '@mantine/core'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { habitDto } from '~/features/habits/server/habit-functions'
import type { HabitEntity } from '~/features/habits/types/habit'

export function HabitList({ habits }: Record<'habits', HabitEntity[]>) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const startEdit = (h: HabitEntity) => {
    setEditingId(h.id)
    setEditName(h.name)
    setEditDesc(h.description ?? '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setEditDesc('')
  }

  const saveEdit = async (id: string) => {
    setLoadingId(id)
    try {
      await habitDto.updateHabit({ 
        data: { 
          id, 
          name: editName.trim(), 
          description: editDesc.trim() || undefined 
        } 
      })
      cancelEdit()
      // ルートの再フェッチ（全体データ更新）
      // tanstack router の invalidate を利用 (Link 上位で使用想定) -> window.location.reload fallback
      ;(window as any).__TSR__?.router?.invalidate?.() ?? window.location.reload()
    } finally {
      setLoadingId(null)
    }
  }

  const removeHabit = async (id: string) => {
    if (!confirm('本当に削除しますか？この習慣の記録も削除されます。')) return
    setLoadingId(id)
    try {
      await habitDto.deleteHabit({ data: { id } })
      ;(window as any).__TSR__?.router?.invalidate?.() ?? window.location.reload()
    } finally {
      setLoadingId(null)
    }
  }
  if (habits.length === 0) {
    return (
      <Card withBorder>
        <Text c="dimmed" ta="center">
          まだ習慣が登録されていません
        </Text>
      </Card>
    )
  }

  return (
    <Stack gap="sm">
      {habits.map((habit) => {
        const isEditing = editingId === habit.id
        return (
          <Card key={habit.id} withBorder padding="md">
            <Stack gap="xs">
              {isEditing ? (
                <Stack gap={4}>
                  <TextInput
                    value={editName}
                    onChange={(e) => setEditName(e.currentTarget.value)}
                    label="習慣名"
                    size="sm"
                  />
                  <Textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.currentTarget.value)}
                    label="説明"
                    size="sm"
                    minRows={2}
                  />
                  <Group gap="xs">
                    <Button
                      size="xs"
                      loading={loadingId === habit.id}
                      onClick={() => saveEdit(habit.id)}
                    >
                      保存
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={cancelEdit}
                      disabled={loadingId === habit.id}
                    >
                      キャンセル
                    </Button>
                  </Group>
                </Stack>
              ) : (
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
                      <ActionIcon variant="subtle" size="sm" onClick={() => startEdit(habit)}>
                        <IconEdit stroke={2} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="削除">
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        size="sm"
                        loading={loadingId === habit.id}
                        onClick={() => removeHabit(habit.id)}
                      >
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
              )}
            </Stack>
          </Card>
        )
      })}
    </Stack>
  )
}

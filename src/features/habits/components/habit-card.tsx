import { Card, Stack } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useRouter } from '@tanstack/react-router'
import { useState, useTransition } from 'react'
import { habitDto } from '~/features/habits/server/habit-functions'
import type { HabitEntity } from '~/features/habits/types/habit'
import type { HabitColor } from '~/features/habits/types/schemas/habit-schemas'
import { HabitEditForm } from './form/habit-edit-form'
import { HabitDisplay } from './habit-display'

export function HabitCard({ habit }: Record<'habit', HabitEntity>) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editColor, setEditColor] = useState<HabitColor>('blue')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const startEdit = () => {
    setIsEditing(true)
    setEditName(habit.name)
    setEditDesc(habit.description ?? '')
    setEditColor((habit.color as HabitColor) ?? 'blue')
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditName('')
    setEditDesc('')
    setEditColor('blue')
  }

  const saveEdit = async () => {
    startTransition(async () => {
      try {
        const result = await habitDto.updateHabit({
          data: {
            id: habit.id,
            name: editName.trim(),
            description: editDesc.trim() || undefined,
            color: editColor,
          },
        })

        if (result.success) {
          cancelEdit()

          notifications.show({
            title: '成功',
            message: '習慣が更新されました',
            color: 'green',
          })

          router.invalidate()
        } else {
          notifications.show({
            title: 'エラー',
            message: result.error || '習慣の更新に失敗しました',
            color: 'red',
          })
        }
      } catch (_err) {
        notifications.show({
          title: 'エラー',
          message: '予期しないエラーが発生しました',
          color: 'red',
        })
      }
    })
  }

  const handleDelete = async () => {
    if (!confirm('本当に削除しますか？この習慣の記録も削除されます。')) return

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
  }

  return (
    <Card withBorder padding="md">
      <Stack gap="xs">
        {isEditing ? (
          <HabitEditForm
            name={editName}
            description={editDesc}
            color={editColor}
            isLoading={isPending}
            onNameChange={setEditName}
            onDescriptionChange={setEditDesc}
            onColorChange={setEditColor}
            onSave={saveEdit}
            onCancel={cancelEdit}
          />
        ) : (
          <HabitDisplay
            habit={habit}
            isLoading={isPending}
            onEdit={startEdit}
            onDelete={handleDelete}
          />
        )}
      </Stack>
    </Card>
  )
}

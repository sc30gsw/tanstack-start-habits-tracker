import { Card, Stack } from '@mantine/core'
import { useState, useTransition } from 'react'
import { HabitEditForm } from '~/features/habits/components/form/habit-edit-form'
import type { HabitEntity } from '~/features/habits/types/habit'
import { HabitDisplay } from './habit-display'

export function HabitCard({ habit }: Record<'habit', HabitEntity>) {
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, startTransition] = useTransition()

  const startEdit = () => {
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
  }

  return (
    <Card withBorder padding="md">
      <Stack gap="xs">
        {isEditing ? (
          <HabitEditForm
            habit={habit}
            onCancel={cancelEdit}
            useTransition={[isPending, startTransition]}
          />
        ) : (
          <HabitDisplay
            habit={habit}
            useTransition={[isPending, startTransition]}
            onEdit={startEdit}
          />
        )}
      </Stack>
    </Card>
  )
}

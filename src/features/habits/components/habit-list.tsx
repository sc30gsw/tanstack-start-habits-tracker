import { Card, Stack, Text } from '@mantine/core'
import type { HabitEntity } from '~/features/habits/types/habit'
import { HabitCard } from './habit-card'

export function HabitList({ habits }: Record<'habits', HabitEntity[]>) {
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
      {habits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </Stack>
  )
}

import { Alert, Container, Stack, Text, Title } from '@mantine/core'
import { IconAlertTriangle } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { HabitDetail } from '~/features/habits/components/habit-detail'
import { habitDto } from '~/features/habits/server/habit-functions'
import { recordDto } from '~/features/habits/server/record-functions'

export const Route = createFileRoute('/habits/$habitId')({
  component: HabitDetailPage,
  loader: async ({ params }) => {
    const [habitResult, recordsResult, habitsResult] = await Promise.all([
      habitDto.getHabitById({ data: { id: params.habitId } }),
      recordDto.getRecords({ data: { habit_id: params.habitId } }),
      habitDto.getHabits(),
    ])
    return { habit: habitResult, records: recordsResult, habits: habitsResult }
  },
})

function HabitDetailPage() {
  const { habit, records, habits } = Route.useLoaderData() as any

  if (!habit.success) {
    return (
      <Container size="lg" py="xl">
        <Alert color="red" title="エラー" icon={<IconAlertTriangle stroke={2} />}>
          <Text c="red">{habit.error}</Text>
        </Alert>
      </Container>
    )
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="md">
        <Title order={1}>{habit.data?.name}</Title>
        <HabitDetail
          habit={habit.data!}
          records={records.success ? records.data || [] : []}
          habitsList={habits.success ? habits.data || [] : []}
        />
      </Stack>
    </Container>
  )
}

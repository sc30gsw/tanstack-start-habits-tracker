import { Alert, Container, Stack, Title } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'
import { HabitDetail } from '~/features/habits/components/habit-detail'
import { getHabitById, getHabits } from '~/features/habits/server/habit-functions'
import { getRecords } from '~/features/habits/server/record-functions'

export const Route = createFileRoute('/habits/$habitId')({
  component: HabitDetailPage,
  loader: async ({ params }) => {
    const [habitResult, recordsResult, habitsResult] = await Promise.all([
      getHabitById(params.habitId),
      getRecords({ habit_id: params.habitId }),
      getHabits(),
    ])
    return { habit: habitResult, records: recordsResult, habits: habitsResult }
  },
})

function HabitDetailPage() {
  const { habit, records, habits } = Route.useLoaderData() as any

  if (!habit.success) {
    return (
      <Container size="lg" py="xl">
        <Alert color="red" title="エラー">
          {habit.error}
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

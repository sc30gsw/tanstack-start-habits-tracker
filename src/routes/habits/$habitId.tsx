import { Alert, Container, Stack, Text, Title, useComputedColorScheme } from '@mantine/core'
import { IconAlertTriangle } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { HabitDetail } from '~/features/habits/components/habit-detail'
import { habitDto } from '~/features/habits/server/habit-functions'
import { recordDto } from '~/features/habits/server/record-functions'
import { searchSchema } from '~/features/habits/types/schemas/search-params'

export const Route = createFileRoute('/habits/$habitId')({
  component: HabitDetailPage,
  validateSearch: searchSchema,
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
  const { habit } = Route.useLoaderData()
  const computedColorScheme = useComputedColorScheme('light')
  const titleColor = computedColorScheme === 'dark' ? 'gray.1' : 'dark.8'

  if (!habit.success || !habit.data) {
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
        <Title order={1} c={titleColor}>
          {habit.data.name}
        </Title>
        <HabitDetail />
      </Stack>
    </Container>
  )
}

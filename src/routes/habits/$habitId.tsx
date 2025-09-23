import { Alert, Container, Stack, Text, Title, useComputedColorScheme } from '@mantine/core'
import { IconAlertTriangle } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { HabitDetail } from '~/features/habits/components/habit-detail'
import { habitDto } from '~/features/habits/server/habit-functions'
import { recordDto } from '~/features/habits/server/record-functions'

const searchSchema = z.object({
  selectedDate: z.string().optional(),
  calendarView: z.enum(['month', 'week', 'day']).optional(),
  metric: z.enum(['duration', 'completion']).optional(),
})

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
  const { habit, records, habits } = Route.useLoaderData()
  const search = Route.useSearch()
  const computedColorScheme = useComputedColorScheme('light')
  const titleColor = computedColorScheme === 'dark' ? 'gray.1' : 'dark.8'

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
        <Title order={1} c={titleColor}>
          {habit.data?.name}
        </Title>
        <HabitDetail
          habit={habit.data!}
          records={records.success ? records.data || [] : []}
          habitsList={habits.success ? habits.data || [] : []}
          searchParams={search}
        />
      </Stack>
    </Container>
  )
}

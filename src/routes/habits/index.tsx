import { Button, Container, Group, Stack, Title } from '@mantine/core'
import { createFileRoute, Outlet, useMatches, useNavigate } from '@tanstack/react-router'
import { z } from 'zod/v4'
import { HabitCreateForm } from '~/features/habits/components/form/habit-create-form'
import { HabitList } from '~/features/habits/components/habit-list'
import { habitDto } from '~/features/habits/server/habit-functions'
import { searchSchema } from '~/features/habits/types/schemas/search-params'
import { HabitOrganizer } from '~/features/home/components/habit-organizer'

export const Route = createFileRoute('/habits/')({
  component: HabitsPage,
  validateSearch: searchSchema
    .pick({
      habitSort: true,
      habitFilter: true,
      showRecordForm: true,
    })
    .extend({
      showForm: z
        .boolean()
        .optional()
        .default(false)
        .catch(() => false),
    }),
  loader: async () => {
    const habitsResult = await habitDto.getHabits()

    return habitsResult
  },
})

function HabitsPage() {
  const habitsData = Route.useLoaderData()
  const navigate = useNavigate()
  const searchParams = Route.useSearch()

  const matches = useMatches()
  const last = matches[matches.length - 1]
  const isList = last.routeId === '/habits/'

  if (!isList) {
    return <Outlet />
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={1}>習慣管理</Title>
          <Button
            color="habit"
            onClick={() =>
              navigate({ to: '.', search: { ...searchParams, showForm: !searchParams.showForm } })
            }
          >
            {searchParams.showForm ? '作成フォームを閉じる' : '新しい習慣を作成'}
          </Button>
        </Group>

        {searchParams.showForm && (
          <HabitCreateForm
            onSuccess={() => navigate({ to: '.', search: { ...searchParams, showForm: false } })}
            onCancel={() => navigate({ to: '.', search: { ...searchParams, showForm: false } })}
          />
        )}

        {/* ソート・フィルタUI */}
        <HabitOrganizer />

        {habitsData.success ? <HabitList /> : <div>エラー: {habitsData.error}</div>}
      </Stack>
    </Container>
  )
}

import { Button, Container, Group, Stack, Title } from '@mantine/core'
import { createFileRoute, Outlet, useMatches } from '@tanstack/react-router'
import { useState } from 'react'
import { HabitCreateForm } from '~/features/habits/components/form/habit-create-form'
import { HabitList } from '~/features/habits/components/habit-list'
import { habitDto } from '~/features/habits/server/habit-functions'

export const Route = createFileRoute('/habits/')({
  component: HabitsPage,
  loader: async () => {
    const habitsResult = await habitDto.getHabits()
    return habitsResult
  },
})

function HabitsPage() {
  const habitsData = Route.useLoaderData()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const matches = useMatches()
  const last = matches[matches.length - 1]
  const isList = last.routeId === '/habits/'

  if (!isList) {
    // 子ルート（詳細など）を表示
    return <Outlet />
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={1}>習慣管理</Title>
          <Button color="habit" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? '作成フォームを閉じる' : '新しい習慣を作成'}
          </Button>
        </Group>

        {showCreateForm && (
          <HabitCreateForm
            onSuccess={() => setShowCreateForm(false)}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {habitsData.success ? (
          <HabitList habits={habitsData.data || []} />
        ) : (
          <div>エラー: {habitsData.error}</div>
        )}
      </Stack>
    </Container>
  )
}

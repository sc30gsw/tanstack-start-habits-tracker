import { Card, Skeleton, Stack, Title } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { habitDto } from '~/features/habits/server/habit-functions'
import { NotificationsForm } from '~/features/settings/components/notifications-form'
import { SettingsLayout } from '~/features/settings/components/settings-layout'

export const Route = createFileRoute('/settings/notifications')({
  loader: async () => {
    const habitsResult = await habitDto.getHabits({
      data: {
        q: '',
        habitSort: 'all',
        habitFilter: 'all',
      },
    })

    return habitsResult
  },
  pendingComponent: () => (
    <SettingsLayout>
      <Stack gap="lg">
        <Title order={2}>通知設定</Title>

        <Card withBorder padding="lg">
          <NotificationsFormSkeleton />
        </Card>
      </Stack>
    </SettingsLayout>
  ),
  component: RouteComponent,
})

function NotificationsFormSkeleton() {
  return (
    <Stack gap="md">
      <Skeleton height={56} />
      <Skeleton height={70} />
      <Skeleton height={56} />
      <Skeleton height={56} />
      <Skeleton height={56} />
      <Skeleton height={36} mt="md" />
    </Stack>
  )
}

function RouteComponent() {
  return (
    <SettingsLayout>
      <Stack gap="lg">
        <Title order={2}>通知設定</Title>

        <Card withBorder padding="lg">
          <Suspense fallback={<NotificationsFormSkeleton />}>
            <NotificationsForm />
          </Suspense>
        </Card>
      </Stack>
    </SettingsLayout>
  )
}

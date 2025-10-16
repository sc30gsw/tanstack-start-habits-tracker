import { Card, Skeleton, Stack, Title } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { ProfileForm } from '~/features/settings/components/profile-form'
import { SettingsLayout } from '~/features/settings/components/settings-layout'

export const Route = createFileRoute('/settings/')({
  component: RouteComponent,
})

function ProfileFormSkeleton() {
  return (
    <Stack gap="md">
      <Skeleton height={60} />
      <Skeleton height={60} />
      <Skeleton height={40} />
    </Stack>
  )
}

function RouteComponent() {
  return (
    <SettingsLayout>
      <Stack gap="lg">
        <Title order={2}>プロフィール設定</Title>

        <Card withBorder padding="lg">
          <Suspense fallback={<ProfileFormSkeleton />}>
            <ProfileForm />
          </Suspense>
        </Card>
      </Stack>
    </SettingsLayout>
  )
}

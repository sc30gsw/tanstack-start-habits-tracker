import { Skeleton, Stack, Title } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'
import { ProfileCard } from '~/features/settings/components/profile-card'
import { SettingsLayout } from '~/features/settings/components/settings-layout'
import { profileDto } from '~/features/settings/server/profile-functions'

export const Route = createFileRoute('/settings/profile')({
  component: RouteComponent,
  pendingComponent: ProfileFormSkeleton,
  loader: async () => {
    const [user, profileAggregatedLevel] = await Promise.all([
      profileDto.getUserProfile(),
      profileDto.getAggregatedLevel(),
    ])

    return { user, profileAggregatedLevel }
  },
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
        <Title order={2}>プロフィール</Title>

        <ProfileCard />
      </Stack>
    </SettingsLayout>
  )
}

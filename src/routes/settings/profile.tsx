import { Skeleton, Stack, Title } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'
import { homeLevelInfoDto } from '~/features/home/server/home-level-functions'
import { profileDto } from '~/features/profile/server/profile-functions'
import { ProfileCard } from '~/features/settings/components/profile-card'
import { SettingsLayout } from '~/features/settings/components/settings-layout'

export const Route = createFileRoute('/settings/profile')({
  component: RouteComponent,
  pendingComponent: ProfileFormSkeleton,
  loader: async () => {
    const [user, homeAggregatedLevel] = await Promise.all([
      profileDto.getUserProfile(),
      homeLevelInfoDto.getHomeAggregatedLevel(),
    ])

    return { user, homeAggregatedLevel }
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

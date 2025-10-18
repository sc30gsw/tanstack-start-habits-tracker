import { Avatar, Box, Button, Card, Divider, Group, Image, Stack, Text } from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { IconCalendar, IconPencil } from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import 'dayjs/locale/ja'
import { HomeBadgeCollection } from '~/features/home/components/home-badge-collection'
import { HomeOverallLevelCard } from '~/features/home/components/home-overall-level-card'
import { ProfileForm } from '~/features/settings/components/profile-form'

dayjs.locale('ja')

export function ProfileCard() {
  const routeApi = getRouteApi('/settings/profile')
  const { user, homeAggregatedLevel } = routeApi.useLoaderData()

  const [opened, { open, close }] = useDisclosure(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  const joinedDate = dayjs(user.createdAt).format('YYYY年M月')

  return (
    <Card shadow="sm" padding={0} radius="md" withBorder>
      <Stack gap={0}>
        <Card.Section>
          <Image
            src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png"
            height={200}
            alt="Cover"
          />
        </Card.Section>

        <Box style={{ position: 'relative' }}>
          <Button
            variant="outline"
            radius="xl"
            onClick={open}
            leftSection={!isMobile ? <IconPencil size={16} /> : undefined}
            style={{
              position: 'absolute',
              top: 8,
              right: 16,
              zIndex: 1,
            }}
          >
            {isMobile ? <IconPencil size={20} /> : 'プロフィールを編集'}
          </Button>

          <Group justify="center" mt="-60px" mb="md" px="lg">
            <Avatar
              src={user?.image}
              size={120}
              radius="50%"
              color="blue"
              style={{
                border: '4px solid var(--mantine-color-body)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}
            >
              {user?.name?.slice(0, 2).toUpperCase()}
            </Avatar>
          </Group>

          <Stack gap="xs" px="lg" mb="md">
            <Text size="xl" fw={700} ta="center">
              {user.name}
            </Text>
          </Stack>

          <Group justify="center" gap="xs" mb="lg" px="lg">
            <IconCalendar size={16} color="var(--mantine-color-dimmed)" />
            <Text size="sm" c="dimmed">
              {joinedDate}から利用中
            </Text>
          </Group>
        </Box>

        <Divider />

        <Stack gap="md" p="lg">
          {homeAggregatedLevel && (
            <>
              <HomeOverallLevelCard homeAggregatedLevel={homeAggregatedLevel} />
              <HomeBadgeCollection homeAggregatedLevel={homeAggregatedLevel} />
            </>
          )}
        </Stack>

        <Divider />
      </Stack>

      <ProfileForm opened={opened} onClose={close} />
    </Card>
  )
}

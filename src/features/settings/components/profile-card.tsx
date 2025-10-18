import { Avatar, Button, Card, Divider, Group, Image, Stack, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconCalendar, IconMail, IconPencil } from '@tabler/icons-react'
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
          <Group justify="center" gap="xs">
            <Text size="xl" fw={700} ta="center">
              {user.name}
            </Text>
            <Button
              variant="subtle"
              size="compact-sm"
              onClick={open}
              leftSection={<IconPencil size={14} />}
            >
              編集
            </Button>
          </Group>
          <Group justify="center" gap="xs">
            <IconMail size={16} color="var(--mantine-color-dimmed)" />
            <Text size="sm" c="dimmed">
              {user.email}
            </Text>
          </Group>
        </Stack>

        <Group justify="center" gap="xs" mb="lg" px="lg">
          <IconCalendar size={16} color="var(--mantine-color-dimmed)" />
          <Text size="sm" c="dimmed">
            {joinedDate}から利用中
          </Text>
        </Group>

        <Divider />

        <Stack gap="md" p="lg">
          {homeAggregatedLevel && (
            <>
              <HomeOverallLevelCard />
              <HomeBadgeCollection />
            </>
          )}
        </Stack>

        <Divider />
      </Stack>

      <ProfileForm opened={opened} onClose={close} />
    </Card>
  )
}

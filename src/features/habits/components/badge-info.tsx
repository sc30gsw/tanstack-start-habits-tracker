import { Card, Group, SimpleGrid, Stack, Text, Title, useComputedColorScheme } from '@mantine/core'
import { IconInfoCircle, IconTrophy } from '@tabler/icons-react'
import { COMPLETION_BADGES, HOURS_BADGES } from '~/features/habits/constants/badges'
import { calculateNextLevelRequirement } from '~/features/habits/utils/habit-level-utils'
import { getIconComponent } from '~/features/habits/utils/icon-mapper'

export function BadgeInfo() {
  const computedColorScheme = useComputedColorScheme('light')
  const titleColor = computedColorScheme === 'dark' ? 'gray.1' : 'dark.8'
  const textColor = computedColorScheme === 'dark' ? 'gray.3' : 'gray.7'
  const bgColor = computedColorScheme === 'dark' ? 'dark.6' : 'gray.0'

  const renderBadgeInfo = (
    badge: (typeof COMPLETION_BADGES)[number],
    type: 'completion' | 'hours',
  ) => {
    const Icon = getIconComponent(badge.icon)
    const threshold = calculateNextLevelRequirement(badge.level - 1, type)

    return (
      <Card
        key={badge.level}
        padding="md"
        radius="md"
        withBorder
        style={{
          backgroundColor: `var(--mantine-color-${badge.color}-0)`,
          borderColor: `var(--mantine-color-${badge.color}-3)`,
          borderWidth: '2px',
        }}
      >
        <Stack gap="xs" align="center">
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: `var(--mantine-color-${badge.color}-1)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `3px solid var(--mantine-color-${badge.color}-4)`,
            }}
          >
            <Icon size={32} color={`var(--mantine-color-${badge.color}-7)`} stroke={2} />
          </div>
          <Stack gap={4} align="center">
            <Text size="sm" fw={700} c={`${badge.color}.9`} ta="center">
              {badge.title}
            </Text>
            <Text size="xs" c={textColor} ta="center">
              Lv.{badge.level}
            </Text>
            <Text size="xs" c={textColor} ta="center" fw={500}>
              {type === 'completion' ? `${threshold}日達成` : `${threshold}時間達成`}
            </Text>
          </Stack>
        </Stack>
      </Card>
    )
  }

  return (
    <Stack gap="xl">
      <Group gap="xs" align="center">
        <IconInfoCircle size={28} color="var(--mantine-color-blue-6)" />
        <Title order={2} c={titleColor}>
          バッジについて
        </Title>
      </Group>

      <Card padding="lg" radius="md" withBorder bg={bgColor}>
        <Stack gap="md">
          <Text size="sm" c={textColor}>
            バッジは、習慣の継続や努力の証として獲得できる勲章です。レベルを上げることで自動的に獲得できます。
          </Text>
          <Stack gap="xs">
            <Text size="sm" fw={600} c={titleColor}>
              📊 達成バッジ
            </Text>
            <Text size="xs" c={textColor}>
              習慣の完了回数に応じて獲得できるバッジです。
            </Text>
          </Stack>
          <Stack gap="xs">
            <Text size="sm" fw={600} c={titleColor}>
              ⏱️ 総時間バッジ
            </Text>
            <Text size="xs" c={textColor}>
              習慣に費やした総時間に応じて獲得できるバッジです。
            </Text>
          </Stack>
        </Stack>
      </Card>

      <Stack gap="lg">
        <Stack gap="sm">
          <Group gap="xs">
            <IconTrophy size={24} color="var(--mantine-color-teal-6)" />
            <Text size="lg" fw={600} c={titleColor}>
              達成バッジ一覧
            </Text>
          </Group>
          <SimpleGrid cols={{ base: 2, xs: 3, sm: 4, md: 7 }} spacing="md">
            {COMPLETION_BADGES.map((badge) => renderBadgeInfo(badge, 'completion'))}
          </SimpleGrid>
        </Stack>

        <Stack gap="sm">
          <Group gap="xs">
            <IconTrophy size={24} color="var(--mantine-color-orange-6)" />
            <Text size="lg" fw={600} c={titleColor}>
              総時間バッジ一覧
            </Text>
          </Group>
          <SimpleGrid cols={{ base: 2, xs: 3, sm: 4, md: 7 }} spacing="md">
            {HOURS_BADGES.map((badge) => renderBadgeInfo(badge, 'hours'))}
          </SimpleGrid>
        </Stack>
      </Stack>
    </Stack>
  )
}

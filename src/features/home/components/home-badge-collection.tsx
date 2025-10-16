import { Badge, Card, Group, Progress, SimpleGrid, Stack, Text, Tooltip } from '@mantine/core'
import { getRouteApi } from '@tanstack/react-router'
import {
  HOME_BADGE_CATEGORY_LABELS,
  HOME_BADGES_BY_CATEGORY,
} from '~/features/home/constants/home-badges'
import {
  calculateBadgeCompletionRate,
  getHomeBadgesByCategory,
} from '~/features/home/utils/home-badge-utils'

export function HomeBadgeCollection() {
  const routeApi = getRouteApi('/')
  const { homeAggregatedLevel } = routeApi.useLoaderData()

  const badgesByCategory = getHomeBadgesByCategory(homeAggregatedLevel)
  const allBadges = [
    ...badgesByCategory.habits,
    ...badgesByCategory.days,
    ...badgesByCategory.streak,
    ...badgesByCategory.hours,
  ] as const satisfies readonly (typeof badgesByCategory.habits)[number][]
  const completionRate = calculateBadgeCompletionRate(allBadges)
  const unlockedCount = allBadges.filter((b) => b.unlocked).length
  const totalCount = allBadges.length

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="lg">
        {/* タイトルと進捗 */}
        <Group justify="space-between">
          <Text size="lg" fw={700}>
            バッジコレクション
          </Text>
          <Badge size="lg" color="violet" variant="light">
            {unlockedCount}/{totalCount}
          </Badge>
        </Group>

        {/* 全体進捗バー */}
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              達成率
            </Text>
            <Text size="sm" fw={600}>
              {completionRate}%
            </Text>
          </Group>
          <Progress
            value={completionRate}
            color="violet"
            size="lg"
            radius="xl"
            styles={{
              section: {
                background: `linear-gradient(90deg,
                  var(--mantine-color-violet-4),
                  var(--mantine-color-violet-6),
                  var(--mantine-color-violet-4))`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 3s ease-in-out infinite',
              },
            }}
          />
        </Stack>

        {/* カテゴリ別バッジ表示 */}
        <Stack gap="md">
          {Object.entries(HOME_BADGES_BY_CATEGORY).map(([categoryKey]) => {
            const category = categoryKey as keyof typeof badgesByCategory
            const badges = badgesByCategory[category]
            const categoryLabel = HOME_BADGE_CATEGORY_LABELS[category]
            const categoryUnlocked = badges.filter((b) => b.unlocked).length

            return (
              <Stack key={category} gap="xs">
                <Group justify="space-between">
                  <Text size="sm" fw={600}>
                    {categoryLabel}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {categoryUnlocked}/{badges.length}
                  </Text>
                </Group>
                <SimpleGrid cols={4} spacing="xs">
                  {badges.map((badge) => (
                    <Tooltip
                      key={`${badge.type}-${badge.level}`}
                      label={
                        badge.unlocked
                          ? `${badge.icon} ${badge.title} (達成)`
                          : `${badge.icon} ${badge.title} (未達成: あと${badge.remainingValue})`
                      }
                      withArrow
                    >
                      <Card
                        padding="xs"
                        radius="md"
                        style={{
                          cursor: 'pointer',
                          backgroundColor: badge.unlocked
                            ? `var(--mantine-color-${badge.color}-0)`
                            : 'var(--mantine-color-gray-1)',
                          border: `2px solid ${badge.unlocked ? `var(--mantine-color-${badge.color}-5)` : 'var(--mantine-color-gray-3)'}`,
                          filter: badge.unlocked ? 'none' : 'grayscale(100%)',
                          opacity: badge.unlocked ? 1 : 0.5,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Stack gap={4} align="center">
                          <Text size="xl">{badge.icon}</Text>
                          <Text
                            size="xs"
                            c={badge.unlocked ? badge.color : 'dimmed'}
                            ta="center"
                            fw={badge.unlocked ? 600 : 400}
                            style={{
                              lineHeight: 1.2,
                              wordBreak: 'keep-all',
                            }}
                          >
                            {badge.title}
                          </Text>
                        </Stack>
                      </Card>
                    </Tooltip>
                  ))}
                </SimpleGrid>
              </Stack>
            )
          })}
        </Stack>
      </Stack>

      <style>{`
        @keyframes shimmer {
          0%, 100% {
            background-position: 200% 0;
          }
          50% {
            background-position: 0 0;
          }
        }
      `}</style>
    </Card>
  )
}

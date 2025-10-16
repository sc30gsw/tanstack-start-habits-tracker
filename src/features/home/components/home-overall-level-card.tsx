import { Badge, Card, Group, Progress, Stack, Text } from '@mantine/core'
import { getRouteApi } from '@tanstack/react-router'
import { getHomeLevelInfo, HOME_LEVEL_TITLES } from '~/features/home/constants/home-level-titles'
import { calculateHomeLevelProgress } from '~/features/home/utils/home-level-utils'

export function HomeOverallLevelCard() {
  const routeApi = getRouteApi('/')
  const { homeAggregatedLevel } = routeApi.useLoaderData()

  const levelInfo = getHomeLevelInfo(homeAggregatedLevel.totalLevel)
  const progressPercent = calculateHomeLevelProgress(homeAggregatedLevel.totalLevel)

  const currentIndex = HOME_LEVEL_TITLES.findIndex(
    (item) => item.info.title === levelInfo.info.title,
  )

  const nextLevelInfo =
    currentIndex < HOME_LEVEL_TITLES.length - 1 ? HOME_LEVEL_TITLES[currentIndex + 1] : null

  const isMaxLevel = !nextLevelInfo

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="lg" fw={700}>
            総合レベル
          </Text>
          <Badge size="lg" color={levelInfo.info.color} variant="light">
            {levelInfo.info.icon} Lv.{homeAggregatedLevel.totalLevel}
          </Badge>
        </Group>

        <Stack gap="xs">
          <Group gap="xs">
            <Text size="xl" fw={700} c={levelInfo.info.color}>
              {levelInfo.info.title}
            </Text>
          </Group>
          <Text size="sm" c="dimmed">
            {levelInfo.info.description}
          </Text>
        </Stack>

        {!isMaxLevel && (
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                次のレベルまで
              </Text>
              <Text size="sm" fw={600}>
                {progressPercent}%
              </Text>
            </Group>
            <Progress
              value={progressPercent}
              color={levelInfo.info.color}
              size="lg"
              radius="xl"
              styles={{
                section: {
                  background: `linear-gradient(90deg,
                    var(--mantine-color-${levelInfo.info.color}-4),
                    var(--mantine-color-${levelInfo.info.color}-6),
                    var(--mantine-color-${levelInfo.info.color}-4))`,
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 3s ease-in-out infinite',
                },
              }}
            />
            {nextLevelInfo && (
              <Text size="xs" c="dimmed" ta="right">
                次: {nextLevelInfo.info.icon} {nextLevelInfo.info.title} (Lv.
                {nextLevelInfo.minLevel})
              </Text>
            )}
          </Stack>
        )}

        <Group grow>
          <Stack gap={4}>
            <Text size="xs" c="dimmed" ta="center">
              習慣数
            </Text>
            <Text size="xl" fw={700} ta="center" c="blue">
              {homeAggregatedLevel.totalHabits}
            </Text>
          </Stack>
          <Stack gap={4}>
            <Text size="xs" c="dimmed" ta="center">
              完了日数
            </Text>
            <Text size="xl" fw={700} ta="center" c="green">
              {homeAggregatedLevel.totalCompletionDays}
            </Text>
          </Stack>
          <Stack gap={4}>
            <Text size="xs" c="dimmed" ta="center">
              最長継続
            </Text>
            <Text size="xl" fw={700} ta="center" c="orange">
              {homeAggregatedLevel.longestStreak}日
            </Text>
          </Stack>
          <Stack gap={4}>
            <Text size="xs" c="dimmed" ta="center">
              総時間
            </Text>
            <Text size="xl" fw={700} ta="center" c="violet">
              {Math.floor(homeAggregatedLevel.totalHoursDecimal)}h
            </Text>
          </Stack>
        </Group>
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

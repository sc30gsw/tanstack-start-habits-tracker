import {
  Anchor,
  Badge,
  Card,
  Group,
  Progress,
  Stack,
  Text,
  Title,
  useComputedColorScheme,
} from '@mantine/core'
import { modals } from '@mantine/modals'
import { IconInfoCircle, IconStar } from '@tabler/icons-react'
import { getRouteApi, useLocation } from '@tanstack/react-router'
import { getIconComponent } from '~/features/habits/utils/icon-mapper'
import { getHomeLevelInfo, HOME_LEVEL_TITLES } from '~/features/home/constants/home-level-titles'
import { calculateHomeLevelProgress } from '~/features/home/utils/home-level-utils'

export function HomeOverallLevelCard() {
  const location = useLocation()
  const routeApi = getRouteApi(location.pathname === '/' ? '/' : '/settings/profile')
  const { homeAggregatedLevel } = routeApi.useLoaderData()
  const computedColorScheme = useComputedColorScheme('light')

  if (!homeAggregatedLevel) {
    return null
  }

  const levelInfo = getHomeLevelInfo(homeAggregatedLevel.totalLevel)
  const progressPercent = calculateHomeLevelProgress(
    homeAggregatedLevel.totalLevel,
    levelInfo.minLevel,
    levelInfo.maxLevel,
  )

  const currentIndex = HOME_LEVEL_TITLES.findIndex(
    (item) => item.info.title === levelInfo.info.title,
  )

  const nextLevelInfo =
    currentIndex < HOME_LEVEL_TITLES.length - 1 ? HOME_LEVEL_TITLES[currentIndex + 1] : null

  const isMaxLevel = !nextLevelInfo

  const LevelIcon = getIconComponent(levelInfo.info.icon)

  const handleOpenLevelInfo = () => {
    const titleColor = computedColorScheme === 'dark' ? 'gray.1' : 'dark.8'
    const textColor = computedColorScheme === 'dark' ? 'gray.4' : 'gray.7'
    const bgColor = computedColorScheme === 'dark' ? 'dark.6' : 'gray.0'

    const getLevelTitleColor = (color: string) => {
      return computedColorScheme === 'dark' ? `${color}.3` : `${color}.9`
    }

    const renderLevelInfo = (level: (typeof HOME_LEVEL_TITLES)[number], prevMaxLevel: number) => {
      const Icon = getIconComponent(level.info.icon)
      const startLevel = prevMaxLevel + 1

      return (
        <Card
          key={level.minLevel}
          padding="lg"
          radius="md"
          withBorder
          style={{
            borderColor: `var(--mantine-color-${level.info.color}-3)`,
            borderWidth: '2px',
          }}
        >
          <Stack gap="md">
            <Group justify="space-between" wrap="nowrap">
              <Group gap="sm" wrap="nowrap">
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: `var(--mantine-color-${level.info.color}-1)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `3px solid var(--mantine-color-${level.info.color}-4)`,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={24} color={`var(--mantine-color-${level.info.color}-7)`} stroke={2} />
                </div>
                <Stack gap={4}>
                  <Text size="md" fw={700} c={getLevelTitleColor(level.info.color)}>
                    {level.info.title}
                  </Text>
                  <Text size="xs" c={textColor}>
                    Lv.{startLevel} ~ Lv.{level.maxLevel}
                  </Text>
                </Stack>
              </Group>
              <Stack gap={4} align="flex-end" style={{ flexShrink: 0 }}>
                <Text size="xs" c={textColor} fw={600}>
                  総合Lv.{level.minLevel}
                </Text>
                <Text size="xs" c="dimmed">
                  で到達
                </Text>
              </Stack>
            </Group>

            {/* サンプルプログレスバー */}
            <div className="relative overflow-hidden">
              <Progress
                value={75}
                color={level.info.color}
                size="lg"
                radius="md"
                styles={{
                  section: {
                    background: `linear-gradient(90deg, var(--mantine-color-${level.info.color}-5) 0%, var(--mantine-color-${level.info.color}-7) 50%, var(--mantine-color-${level.info.color}-5) 100%)`,
                    backgroundSize: '200% 100%',
                    animation:
                      'shimmer 3s ease-in-out infinite, pulse-glow 2s ease-in-out infinite',
                    position: 'relative',
                  },
                }}
              />
              <div
                className="pointer-events-none absolute top-0 h-full w-full"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                  animation: 'shine 2s ease-in-out infinite',
                }}
              />
            </div>
          </Stack>
        </Card>
      )
    }

    modals.open({
      title: 'レベルとは?',
      size: 'xl',
      children: (
        <Stack gap="xl">
          <Group gap="xs" align="center">
            <IconInfoCircle size={28} color="var(--mantine-color-blue-6)" />
            <Title order={2} c={titleColor}>
              総合レベルについて
            </Title>
          </Group>

          <Card padding="lg" radius="md" withBorder bg={bgColor}>
            <Stack gap="md">
              <Text size="sm" c={textColor}>
                総合レベルは、あなたの習慣達成状況を総合的に評価した指標です。各習慣の継続レベル（達成日数）と時間レベル（作業時間）を合計して算出されます。
              </Text>
              <Stack gap="xs">
                <Text size="sm" fw={600} c={titleColor}>
                  📊 総合レベルの計算式
                </Text>
                <Text size="xs" c={textColor}>
                  総合レベル = すべての習慣の（継続レベル + 時間レベル）の合計
                </Text>
              </Stack>
              <Stack gap="xs">
                <Text size="sm" fw={600} c={titleColor}>
                  🎯 レベルアップするには
                </Text>
                <Text size="xs" c={textColor}>
                  習慣を継続して達成日数を増やしたり、作業時間を積み重ねることで総合レベルが上がり、新しい称号を獲得できます。
                </Text>
              </Stack>
            </Stack>
          </Card>

          <Stack gap="lg">
            <Stack gap="sm">
              <Group gap="xs">
                <IconStar size={24} color="var(--mantine-color-violet-6)" />
                <Text size="lg" fw={600} c={titleColor}>
                  総合レベル称号一覧
                </Text>
              </Group>
              <Stack gap="md">
                {HOME_LEVEL_TITLES.map((level, index) => {
                  const prevMaxLevel = index > 0 ? HOME_LEVEL_TITLES[index - 1].maxLevel : 0
                  return renderLevelInfo(level, prevMaxLevel)
                })}
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      ),
    })
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Text size="lg" fw={700}>
            総合レベル
          </Text>
          <Group gap="sm">
            <Anchor
              size="sm"
              c="blue"
              onClick={handleOpenLevelInfo}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <IconInfoCircle size={16} />
              レベルとは?
            </Anchor>
            <Badge size="lg" color={levelInfo.info.color} variant="light">
              Lv.{homeAggregatedLevel.totalLevel}
            </Badge>
          </Group>
        </Group>

        <Stack gap="xs">
          <Group gap="xs" align="center">
            <LevelIcon size={24} color={`var(--mantine-color-${levelInfo.info.color}-6)`} />
            <Text size="xl" fw={700} c={levelInfo.info.color}>
              {levelInfo.info.title}
            </Text>
          </Group>
          <Text size="sm" c="dimmed">
            {levelInfo.info.description}
          </Text>
        </Stack>

        {!isMaxLevel && nextLevelInfo && (
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                現在 総合Lv.{homeAggregatedLevel.totalLevel} / 次のレベル Lv.
                {nextLevelInfo.minLevel}
              </Text>
              <Text size="sm" fw={600} c={levelInfo.info.color}>
                {progressPercent}%
              </Text>
            </Group>
            <div className="relative overflow-hidden">
              <Progress
                value={progressPercent}
                color={levelInfo.info.color}
                size="lg"
                radius="md"
                styles={{
                  section: {
                    background: `linear-gradient(90deg, var(--mantine-color-${levelInfo.info.color}-5) 0%, var(--mantine-color-${levelInfo.info.color}-7) 50%, var(--mantine-color-${levelInfo.info.color}-5) 100%)`,
                    backgroundSize: '200% 100%',
                    animation:
                      'shimmer 3s ease-in-out infinite, pulse-glow 2s ease-in-out infinite',
                    position: 'relative',
                  },
                }}
              />
              <div
                className="pointer-events-none absolute top-0 h-full w-full"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                  animation: 'shine 2s ease-in-out infinite',
                }}
              />
            </div>
            <Text size="xs" c="dimmed" ta="right">
              次の称号: {nextLevelInfo.info.title} (あと
              {nextLevelInfo.minLevel - homeAggregatedLevel.totalLevel}レベル)
            </Text>
          </Stack>
        )}

        {isMaxLevel && (
          <Text size="sm" c="gold" fw={600} ta="center">
            🎉 最高レベル達成！素晴らしい継続力です！
          </Text>
        )}

        <Group grow>
          <Stack gap={4}>
            <Text size="xs" c="dimmed" ta="center">
              登録習慣
            </Text>
            <Text size="xl" fw={700} ta="center" c="blue">
              {homeAggregatedLevel.totalHabits}個
            </Text>
          </Stack>
          <Stack gap={4}>
            <Text size="xs" c="dimmed" ta="center">
              累計達成
            </Text>
            <Text size="xl" fw={700} ta="center" c="green">
              {homeAggregatedLevel.totalCompletionDays}日
            </Text>
          </Stack>
          <Stack gap={4}>
            <Text size="xs" c="dimmed" ta="center">
              最長連続
            </Text>
            <Text size="xl" fw={700} ta="center" c="orange">
              {homeAggregatedLevel.longestStreak}日
            </Text>
          </Stack>
          <Stack gap={4}>
            <Text size="xs" c="dimmed" ta="center">
              累計時間
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

        @keyframes pulse-glow {
          0%, 100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.2);
          }
        }

        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </Card>
  )
}

import {
  Anchor,
  Badge,
  Card,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Tooltip,
  useComputedColorScheme,
} from '@mantine/core'
import { modals } from '@mantine/modals'
import { IconInfoCircle, IconTrophy } from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'
import { getIconComponent } from '~/features/habits/utils/icon-mapper'
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
  const computedColorScheme = useComputedColorScheme('light')

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

  const handleOpenBadgeInfo = () => {
    const titleColor = computedColorScheme === 'dark' ? 'gray.1' : 'dark.8'
    const textColor = computedColorScheme === 'dark' ? 'gray.4' : 'gray.7'
    const badgeTextColor = computedColorScheme === 'dark' ? 'dark.9' : 'gray.9'
    const bgColor = computedColorScheme === 'dark' ? 'dark.6' : 'gray.0'

    const getBadgeTitleColor = (color: string) => {
      return computedColorScheme === 'dark' ? `${color}.9` : `${color}.9`
    }

    const renderBadgeInfo = (
      badge:
        | (typeof HOME_BADGES_BY_CATEGORY.habits)[number]
        | (typeof HOME_BADGES_BY_CATEGORY.days)[number]
        | (typeof HOME_BADGES_BY_CATEGORY.streak)[number]
        | (typeof HOME_BADGES_BY_CATEGORY.hours)[number],
      category: keyof typeof badgesByCategory,
    ) => {
      const Icon = getIconComponent(badge.icon)
      const thresholdLabel =
        category === 'habits'
          ? `${badge.level}個達成`
          : category === 'days'
            ? `${badge.level}日達成`
            : category === 'streak'
              ? `${badge.level}日継続`
              : `${badge.level}時間達成`

      return (
        <Card
          key={`${badge.type}-${badge.level}`}
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
              <Text size="sm" fw={700} c={getBadgeTitleColor(badge.color)} ta="center">
                {badge.title}
              </Text>
              <Text size="xs" c={badgeTextColor} ta="center">
                Lv.{badge.level}
              </Text>
              <Text size="xs" c={badgeTextColor} ta="center" fw={500}>
                {thresholdLabel}
              </Text>
            </Stack>
          </Stack>
        </Card>
      )
    }

    modals.open({
      title: 'バッジとは?',
      size: 'xl',
      children: (
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
                バッジは、習慣の達成状況に応じて獲得できる称号です。4つのカテゴリーで様々な目標を達成しましょう。
              </Text>
              <Stack gap="xs">
                <Text size="sm" fw={600} c={titleColor}>
                  📊 登録習慣数バッジ
                </Text>
                <Text size="xs" c={textColor}>
                  登録した習慣の総数が増えるごとに獲得できます。
                </Text>
              </Stack>
              <Stack gap="xs">
                <Text size="sm" fw={600} c={titleColor}>
                  📅 累計達成日数バッジ
                </Text>
                <Text size="xs" c={textColor}>
                  すべての習慣で完了した日数の合計が増えるごとに獲得できます。
                </Text>
              </Stack>
              <Stack gap="xs">
                <Text size="sm" fw={600} c={titleColor}>
                  🔥 最長連続日数バッジ
                </Text>
                <Text size="xs" c={textColor}>
                  習慣を連続して実行した最長記録が伸びるごとに獲得できます。
                </Text>
              </Stack>
              <Stack gap="xs">
                <Text size="sm" fw={600} c={titleColor}>
                  ⏱️ 累計作業時間バッジ
                </Text>
                <Text size="xs" c={textColor}>
                  すべての習慣に費やした時間の合計が増えるごとに獲得できます。
                </Text>
              </Stack>
            </Stack>
          </Card>

          <Stack gap="lg">
            <Stack gap="sm">
              <Group gap="xs">
                <IconTrophy size={24} color="var(--mantine-color-blue-6)" />
                <Text size="lg" fw={600} c={titleColor}>
                  登録習慣数バッジ一覧
                </Text>
              </Group>
              <SimpleGrid cols={{ base: 2, xs: 3, sm: 4 }} spacing="md">
                {HOME_BADGES_BY_CATEGORY.habits.map((badge) => renderBadgeInfo(badge, 'habits'))}
              </SimpleGrid>
            </Stack>

            <Stack gap="sm">
              <Group gap="xs">
                <IconTrophy size={24} color="var(--mantine-color-green-6)" />
                <Text size="lg" fw={600} c={titleColor}>
                  累計達成日数バッジ一覧
                </Text>
              </Group>
              <SimpleGrid cols={{ base: 2, xs: 3, sm: 4 }} spacing="md">
                {HOME_BADGES_BY_CATEGORY.days.map((badge) => renderBadgeInfo(badge, 'days'))}
              </SimpleGrid>
            </Stack>

            <Stack gap="sm">
              <Group gap="xs">
                <IconTrophy size={24} color="var(--mantine-color-orange-6)" />
                <Text size="lg" fw={600} c={titleColor}>
                  最長連続日数バッジ一覧
                </Text>
              </Group>
              <SimpleGrid cols={{ base: 2, xs: 3, sm: 4 }} spacing="md">
                {HOME_BADGES_BY_CATEGORY.streak.map((badge) => renderBadgeInfo(badge, 'streak'))}
              </SimpleGrid>
            </Stack>

            <Stack gap="sm">
              <Group gap="xs">
                <IconTrophy size={24} color="var(--mantine-color-violet-6)" />
                <Text size="lg" fw={600} c={titleColor}>
                  累計作業時間バッジ一覧
                </Text>
              </Group>
              <SimpleGrid cols={{ base: 2, xs: 3, sm: 4 }} spacing="md">
                {HOME_BADGES_BY_CATEGORY.hours.map((badge) => renderBadgeInfo(badge, 'hours'))}
              </SimpleGrid>
            </Stack>
          </Stack>
        </Stack>
      ),
    })
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="lg">
        {/* タイトルと進捗 */}
        <Group justify="space-between" align="center">
          <Text size="lg" fw={700}>
            バッジコレクション
          </Text>
          <Group gap="sm">
            <Anchor
              size="sm"
              c="blue"
              onClick={handleOpenBadgeInfo}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <IconInfoCircle size={16} />
              バッジとは?
            </Anchor>
            <Badge size="lg" color="blue" variant="light">
              {unlockedCount}/{totalCount}
            </Badge>
          </Group>
        </Group>

        {/* 全体進捗バー */}
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              バッジ獲得進捗
            </Text>
            <Text size="sm" fw={600} c="blue">
              {unlockedCount}/{totalCount}個 ({completionRate}%)
            </Text>
          </Group>
          <div className="relative overflow-hidden">
            <Progress
              value={completionRate}
              color="blue"
              size="lg"
              radius="md"
              styles={{
                section: {
                  background:
                    'linear-gradient(90deg, var(--mantine-color-blue-5) 0%, var(--mantine-color-blue-7) 50%, var(--mantine-color-blue-5) 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 3s ease-in-out infinite, pulse-glow 2s ease-in-out infinite',
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
                  {badges.map((badge) => {
                    const BadgeIcon = getIconComponent(badge.icon)
                    
                    const getTooltipLabel = () => {
                      if (badge.unlocked) {
                        return `🎉 ${badge.title} - 獲得済み`
                      }
                      
                      const statusText = category === 'habits' 
                        ? `あと${badge.remainingValue}個の習慣を登録`
                        : category === 'days'
                        ? `あと${badge.remainingValue}日達成`
                        : category === 'streak'
                        ? `あと${badge.remainingValue}日連続`
                        : `あと${badge.remainingValue}時間作業`
                      
                      return `${badge.title} - ${statusText}で獲得`
                    }

                    return (
                      <Tooltip
                        key={`${badge.type}-${badge.level}`}
                        label={getTooltipLabel()}
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
                            <BadgeIcon
                              size={24}
                              color={
                                badge.unlocked
                                  ? `var(--mantine-color-${badge.color}-6)`
                                  : 'var(--mantine-color-gray-5)'
                              }
                            />
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
                    )
                  })}
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

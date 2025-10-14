import { Badge, Card, Group, Stack, Text, Tooltip } from '@mantine/core'
import { IconLock } from '@tabler/icons-react'
import type { BadgeItem } from '~/features/habits/constants/badges'
import { COMPLETION_BADGES, HOURS_BADGES } from '~/features/habits/constants/badges'
import { getIconComponent } from '~/features/habits/utils/icon-mapper'

export function BadgeCollection({
  completionLevel,
  hoursLevel,
}: Record<'completionLevel' | 'hoursLevel', number>) {
  const renderBadge = (badge: BadgeItem, isUnlocked: boolean) => {
    const Icon = getIconComponent(badge.icon)
    const currentLevel = badge.type === 'completion' ? completionLevel : hoursLevel

    return (
      <Tooltip
        key={`${badge.type}-${badge.level}`}
        label={
          <Stack gap={4}>
            <Text size="sm" fw={600}>
              {badge.title}
            </Text>
            <Text size="xs" c="dimmed">
              {badge.type === 'completion' ? '継続レベル' : '総時間レベル'} {badge.level} で解放
            </Text>
            {!isUnlocked && (
              <Text size="xs" c="yellow">
                あと {badge.level - currentLevel} レベル！
              </Text>
            )}
          </Stack>
        }
        position="top"
        withArrow
      >
        <Card
          shadow={isUnlocked ? 'md' : 'xs'}
          padding="md"
          radius="md"
          withBorder
          className={`relative transition-all duration-300 ${
            isUnlocked
              ? 'cursor-pointer hover:scale-110 hover:shadow-lg'
              : 'cursor-default opacity-40 grayscale'
          }`}
          style={{
            background: isUnlocked
              ? `linear-gradient(135deg, var(--mantine-color-${badge.color}-1) 0%, var(--mantine-color-${badge.color}-2) 100%)`
              : 'var(--mantine-color-gray-1)',
            borderColor: isUnlocked
              ? `var(--mantine-color-${badge.color}-4)`
              : 'var(--mantine-color-gray-3)',
          }}
        >
          <Stack gap="xs" align="center">
            {isUnlocked ? (
              <>
                <div className="relative">
                  <Icon
                    size={48}
                    color={`var(--mantine-color-${badge.color}-6)`}
                    className="drop-shadow-lg"
                  />
                  {badge.level === 999 && (
                    <div
                      className="pointer-events-none absolute top-0 left-0 h-full w-full"
                      style={{
                        background:
                          'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.5), transparent)',
                        animation: 'shine 2s ease-in-out infinite',
                      }}
                    />
                  )}
                </div>
                <Badge color={badge.color} size="xs" variant="filled">
                  Lv. {badge.level}
                </Badge>
                <Text size="xs" fw={600} ta="center" lineClamp={2}>
                  {badge.title}
                </Text>
              </>
            ) : (
              <>
                <div className="relative">
                  <IconLock size={48} color="var(--mantine-color-gray-5)" />
                </div>
                <Badge color="gray" size="xs" variant="outline">
                  Lv. {badge.level}
                </Badge>
                <Text size="xs" c="dimmed" ta="center" lineClamp={2}>
                  ???
                </Text>
              </>
            )}
          </Stack>
        </Card>
      </Tooltip>
    )
  }

  const unlockedCompletionCount = COMPLETION_BADGES.filter(
    (badge) => completionLevel >= badge.level,
  ).length
  const unlockedHoursCount = HOURS_BADGES.filter((badge) => hoursLevel >= badge.level).length
  const totalBadges = COMPLETION_BADGES.length + HOURS_BADGES.length
  const totalUnlocked = unlockedCompletionCount + unlockedHoursCount

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="lg">
        <Group justify="space-between">
          <Text size="lg" fw={700}>
            🏆 バッジコレクション
          </Text>
          <Badge size="lg" variant="gradient" gradient={{ from: 'yellow', to: 'orange' }}>
            {totalUnlocked} / {totalBadges}
          </Badge>
        </Group>

        {/* 進捗バー */}
        <div className="relative overflow-hidden rounded-md">
          <div
            className="h-3 rounded-md transition-all duration-500"
            style={{
              width: `${(totalUnlocked / totalBadges) * 100}%`,
              background:
                'linear-gradient(90deg, var(--mantine-color-yellow-5) 0%, var(--mantine-color-orange-6) 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s ease-in-out infinite',
            }}
          />
        </div>

        {/* 継続レベルバッジ */}
        <Stack gap="sm">
          <Group justify="space-between">
            <Text size="md" fw={600}>
              継続レベルバッジ
            </Text>
            <Badge color="teal" variant="light">
              {unlockedCompletionCount} / {COMPLETION_BADGES.length}
            </Badge>
          </Group>
          <Group gap="md" justify="center">
            {COMPLETION_BADGES.map((badge) => renderBadge(badge, completionLevel >= badge.level))}
          </Group>
        </Stack>

        {/* 総時間レベルバッジ */}
        <Stack gap="sm">
          <Group justify="space-between">
            <Text size="md" fw={600}>
              総時間レベルバッジ
            </Text>
            <Badge color="orange" variant="light">
              {unlockedHoursCount} / {HOURS_BADGES.length}
            </Badge>
          </Group>
          <Group gap="md" justify="center">
            {HOURS_BADGES.map((badge) => renderBadge(badge, hoursLevel >= badge.level))}
          </Group>
        </Stack>

        {/* モチベーションメッセージ */}
        {totalUnlocked < totalBadges && (
          <Card padding="sm" radius="md" bg="blue.0">
            <Text size="sm" ta="center" c="blue.7">
              {totalUnlocked === 0
                ? '🎯 バッジを集めて習慣マスターを目指そう！'
                : totalUnlocked < totalBadges / 2
                  ? '🌟 順調にバッジを獲得中！この調子で頑張ろう！'
                  : totalUnlocked < totalBadges - 1
                    ? '🔥 コンプリートまであと少し！全バッジ制覇を目指そう！'
                    : '👑 最後の1つ！伝説のバッジまであと一歩！'}
            </Text>
          </Card>
        )}

        {totalUnlocked === totalBadges && (
          <Card
            padding="md"
            radius="md"
            style={{
              background:
                'linear-gradient(135deg, var(--mantine-color-yellow-1) 0%, var(--mantine-color-orange-1) 100%)',
            }}
          >
            <Stack gap="xs" align="center">
              <Text size="xl" fw={700} c="yellow.7">
                🎊 完全制覇達成！ 🎊
              </Text>
              <Text size="sm" ta="center" c="orange.7">
                全てのバッジを獲得しました！あなたは真の習慣マスターです！
              </Text>
            </Stack>
          </Card>
        )}
      </Stack>
    </Card>
  )
}

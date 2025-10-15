import { Card, Group, Progress, Stack, Text, Title, useComputedColorScheme } from '@mantine/core'
import { IconInfoCircle, IconStar } from '@tabler/icons-react'
import { COMPLETION_TITLES, HOURS_TITLES } from '~/features/habits/constants/level-titles'
import { calculateNextLevelRequirement } from '~/features/habits/utils/habit-level-utils'
import { getIconComponent } from '~/features/habits/utils/icon-mapper'

export function LevelInfo() {
  const computedColorScheme = useComputedColorScheme('light')
  const titleColor = computedColorScheme === 'dark' ? 'gray.1' : 'dark.8'
  const textColor = computedColorScheme === 'dark' ? 'gray.3' : 'gray.7'
  const bgColor = computedColorScheme === 'dark' ? 'dark.6' : 'gray.0'

  const renderLevelInfo = (
    level: (typeof COMPLETION_TITLES)[number] | (typeof HOURS_TITLES)[number],
    type: 'completion' | 'hours',
    prevMaxLevel: number,
  ) => {
    const Icon = getIconComponent(level.info.icon)
    const threshold = calculateNextLevelRequirement(level.maxLevel - 1, type)
    const startLevel = prevMaxLevel + 1

    return (
      <Card
        key={level.maxLevel}
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
                <Text size="md" fw={700} c={`${level.info.color}.9`}>
                  {level.info.title}
                </Text>
                <Text size="xs" c={textColor}>
                  Lv.{startLevel} ~ Lv.{level.maxLevel}
                </Text>
              </Stack>
            </Group>
            <Stack gap={4} align="flex-end" style={{ flexShrink: 0 }}>
              <Text size="xs" c={textColor} fw={600}>
                {type === 'completion' ? `${threshold}日` : `${threshold}時間`}
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
      </Card>
    )
  }

  return (
    <Stack gap="xl">
      <Group gap="xs" align="center">
        <IconInfoCircle size={28} color="var(--mantine-color-blue-6)" />
        <Title order={2} c={titleColor}>
          レベルについて
        </Title>
      </Group>

      <Card padding="lg" radius="md" withBorder bg={bgColor}>
        <Stack gap="md">
          <Text size="sm" c={textColor}>
            レベルは習慣の継続や努力の証として、自動的に上がっていきます。レベルが上がると称号とプログレスバーの色が変化します。
          </Text>
          <Stack gap="xs">
            <Text size="sm" fw={600} c={titleColor}>
              📊 継続レベル
            </Text>
            <Text size="xs" c={textColor}>
              習慣を完了した日数(重複なし)に応じて上昇します。
            </Text>
          </Stack>
          <Stack gap="xs">
            <Text size="sm" fw={600} c={titleColor}>
              ⏱️ 総時間レベル
            </Text>
            <Text size="xs" c={textColor}>
              習慣に費やした総時間に応じて上昇します。
            </Text>
          </Stack>
        </Stack>
      </Card>

      <Stack gap="lg">
        <Stack gap="sm">
          <Group gap="xs">
            <IconStar size={24} color="var(--mantine-color-teal-6)" />
            <Text size="lg" fw={600} c={titleColor}>
              継続レベル称号一覧
            </Text>
          </Group>
          <Stack gap="md">
            {COMPLETION_TITLES.map((level, index) => {
              const prevMaxLevel = index > 0 ? COMPLETION_TITLES[index - 1].maxLevel : 0
              return renderLevelInfo(level, 'completion', prevMaxLevel)
            })}
          </Stack>
        </Stack>

        <Stack gap="sm">
          <Group gap="xs">
            <IconStar size={24} color="var(--mantine-color-orange-6)" />
            <Text size="lg" fw={600} c={titleColor}>
              総時間レベル称号一覧
            </Text>
          </Group>
          <Stack gap="md">
            {HOURS_TITLES.map((level, index) => {
              const prevMaxLevel = index > 0 ? HOURS_TITLES[index - 1].maxLevel : 0
              return renderLevelInfo(level, 'hours', prevMaxLevel)
            })}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  )
}

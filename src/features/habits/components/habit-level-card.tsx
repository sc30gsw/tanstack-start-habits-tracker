import { Alert, Badge, Card, Divider, Group, Progress, Stack, Text } from '@mantine/core'
import { IconCalendar, IconFlame, IconPin, IconStar, IconTrophy } from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'
import { getIconComponent } from '~/features/habits/utils/icon-mapper'

export function HabitLevelCard() {
  const routeApi = getRouteApi('/habits/$habitId')
  const { levelInfo } = routeApi.useLoaderData()

  if (!levelInfo) {
    return null
  }

  const CompletionIcon = getIconComponent(levelInfo.completion.icon)
  const HoursIcon = getIconComponent(levelInfo.hours.icon)

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="lg">
        {/* 継続レベルセクション */}
        <Stack gap="xs">
          <Group justify="space-between">
            <Group gap="xs">
              <CompletionIcon
                size={24}
                color={`var(--mantine-color-${levelInfo.completion.color}-6)`}
              />
              <Text fw={600} size="md">
                {levelInfo.completion.title}
              </Text>
            </Group>
            <Badge color={levelInfo.completion.color} size="lg" variant="filled">
              Lv. {levelInfo.completion.level}
            </Badge>
          </Group>

          <div className="relative overflow-hidden">
            <Progress
              value={levelInfo.completion.progressPercent}
              color={levelInfo.completion.color}
              size="lg"
              radius="md"
              styles={{
                section: {
                  background: `linear-gradient(90deg, var(--mantine-color-${levelInfo.completion.color}-5) 0%, var(--mantine-color-${levelInfo.completion.color}-7) 50%, var(--mantine-color-${levelInfo.completion.color}-5) 100%)`,
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

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {levelInfo.completion.currentDays} / {levelInfo.completion.nextLevelDays} 日
            </Text>
            <Text size="sm" c="dimmed">
              {levelInfo.completion.progressPercent}%
            </Text>
          </Group>
        </Stack>

        <Divider />

        {/* 総時間レベルセクション */}
        <Stack gap="xs">
          <Group justify="space-between">
            <Group gap="xs">
              <HoursIcon size={24} color={`var(--mantine-color-${levelInfo.hours.color}-6)`} />
              <Text fw={600} size="md">
                {levelInfo.hours.title}
              </Text>
            </Group>
            <Badge color={levelInfo.hours.color} size="lg" variant="filled">
              Lv. {levelInfo.hours.level}
            </Badge>
          </Group>

          <div className="relative overflow-hidden">
            <Progress
              value={levelInfo.hours.progressPercent}
              color={levelInfo.hours.color}
              size="lg"
              radius="md"
              styles={{
                section: {
                  background: `linear-gradient(90deg, var(--mantine-color-${levelInfo.hours.color}-5) 0%, var(--mantine-color-${levelInfo.hours.color}-7) 50%, var(--mantine-color-${levelInfo.hours.color}-5) 100%)`,
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

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {levelInfo.hours.currentHours.toFixed(1)} / {levelInfo.hours.nextLevelHours} 時間
            </Text>
            <Text size="sm" c="dimmed">
              {levelInfo.hours.progressPercent}%
            </Text>
          </Group>
        </Stack>

        <Divider />

        {/* モチベーションメッセージ */}
        <Alert variant="light" color="blue" title="モチベーション" icon={<IconTrophy size={20} />}>
          <Text size="sm">{levelInfo.streak.motivationMessage}</Text>
        </Alert>

        {/* ストリーク情報 */}
        <Stack gap="md">
          <Group justify="space-around">
            <Stack gap={4} align="center">
              <Text size="xs" c="dimmed" tt="uppercase">
                現在のストリーク
              </Text>
              <Group gap={4}>
                <IconFlame size={32} color="var(--mantine-color-orange-6)" />
                <Text size="xl" fw={700}>
                  {levelInfo.streak.current}
                </Text>
                <Text size="sm" c="dimmed">
                  日
                </Text>
              </Group>
            </Stack>

            <Divider orientation="vertical" />

            <Stack gap={4} align="center">
              <Text size="xs" c="dimmed" tt="uppercase">
                昨日のストリーク
              </Text>
              <Group gap={4}>
                <IconCalendar size={32} color="var(--mantine-color-blue-6)" />
                <Text size="xl" fw={700}>
                  {levelInfo.streak.yesterdayStreak}
                </Text>
                <Text size="sm" c="dimmed">
                  日
                </Text>
              </Group>
            </Stack>
          </Group>

          <Group justify="space-around">
            {levelInfo.streak.selectedDateStreak !== null && (
              <>
                <Stack gap={4} align="center">
                  <Text size="xs" c="dimmed" tt="uppercase">
                    選択日のストリーク
                  </Text>
                  <Group gap={4}>
                    <IconPin size={32} color="var(--mantine-color-cyan-6)" />
                    <Text size="xl" fw={700}>
                      {levelInfo.streak.selectedDateStreak}
                    </Text>
                    <Text size="sm" c="dimmed">
                      日
                    </Text>
                  </Group>
                </Stack>

                <Divider orientation="vertical" />
              </>
            )}

            <Stack gap={4} align="center">
              <Text size="xs" c="dimmed" tt="uppercase">
                最長ストリーク
              </Text>
              <Group gap={4}>
                <IconStar size={32} color="var(--mantine-color-yellow-6)" />
                <Text size="xl" fw={700}>
                  {levelInfo.streak.longest}
                </Text>
                <Text size="sm" c="dimmed">
                  日
                </Text>
              </Group>
            </Stack>
          </Group>
        </Stack>
      </Stack>
    </Card>
  )
}

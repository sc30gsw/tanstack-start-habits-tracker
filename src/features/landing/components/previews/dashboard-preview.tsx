import { Box, Card, Group, type MantineColor, Progress, Stack, Text } from '@mantine/core'

const STATS = [
  { label: '総習慣数', value: '12', icon: '📋', color: 'blue' },
  { label: '完了率', value: '87%', icon: '✓', color: 'green' },
  { label: '連続日数', value: '45日', icon: '🔥', color: 'orange' },
] as const satisfies readonly { label: string; value: string; icon: string; color: MantineColor }[]

const HABIT_PROGRESSES = [
  { name: '朝の瞑想', progress: 85, color: 'blue' },
  { name: '読書30分', progress: 92, color: 'green' },
  { name: '運動1時間', progress: 78, color: 'orange' },
  { name: '日記を書く', progress: 95, color: 'grape' },
] as const satisfies readonly { name: string; progress: number; color: MantineColor }[]

export function DashboardPreview() {
  return (
    <Stack gap="lg" style={{ width: '100%' }}>
      {/* 統計カード */}
      <Group gap="md" style={{ flexWrap: 'wrap' }}>
        {STATS.map((stat) => (
          <Card
            key={stat.label}
            withBorder
            padding="lg"
            radius="md"
            shadow="sm"
            style={{
              flex: '1 1 200px',
              minWidth: '200px',
              transition: 'all 0.3s ease',
            }}
            styles={{
              root: {
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 'var(--mantine-shadow-md)',
                },
              },
            }}
          >
            <Stack gap="sm">
              <Text style={{ fontSize: '2rem' }}>{stat.icon}</Text>
              <Text size="sm" c="dimmed">
                {stat.label}
              </Text>
              <Text size="xl" fw={700} c={`${stat.color}.6`}>
                {stat.value}
              </Text>
            </Stack>
          </Card>
        ))}
      </Group>

      {/* 習慣の進捗カード */}
      <Card withBorder padding="lg" radius="md" shadow="sm">
        <Stack gap="md">
          <Text size="lg" fw={600}>
            今週の習慣進捗
          </Text>

          {HABIT_PROGRESSES.map((habit) => (
            <Box key={habit.name}>
              <Group justify="space-between" mb={8}>
                <Text size="sm" c="dimmed">
                  {habit.name}
                </Text>
                <Text size="sm" fw={600} c={`${habit.color}.6`}>
                  {habit.progress}%
                </Text>
              </Group>
              <Progress value={habit.progress} size="md" radius="xl" color={habit.color} />
            </Box>
          ))}
        </Stack>
      </Card>

      {/* ミニ統計カード */}
      <Group gap="md" style={{ flexWrap: 'wrap' }}>
        {[
          { label: '今月の完了', value: '127', color: 'blue' },
          { label: '平均時間', value: '42分', color: 'green' },
          { label: '最長連続', value: '45日', color: 'orange' },
        ].map((stat) => (
          <Card key={stat.label} withBorder padding="md" radius="md" style={{ flex: '1 1 150px' }}>
            <Stack gap={4}>
              <Text size="xs" c="dimmed">
                {stat.label}
              </Text>
              <Text size="xl" fw={700} c={`${stat.color}.6`}>
                {stat.value}
              </Text>
            </Stack>
          </Card>
        ))}
      </Group>
    </Stack>
  )
}

import { Box, Card, Group, type MantineColor, Stack, Text } from '@mantine/core'

const WEEK_DAYS = ['月', '火', '水', '木', '金', '土', '日'] as const satisfies readonly string[]

const STAT_METRICS = [
  { label: '平均完了率', value: '82%', color: 'blue' },
  { label: '最長連続', value: '21日', color: 'green' },
  { label: '今週の完了', value: '38/42', color: 'orange' },
] as const satisfies readonly { label: string; value: string; color: MantineColor }[]

export function StatsPreview() {
  // 週間パフォーマンスデータ
  const weeklyData = WEEK_DAYS.map(() => ({
    height: Math.random() * 80 + 20,
  }))

  return (
    <Stack gap="lg" style={{ width: '100%' }}>
      {/* 週間パフォーマンスグラフカード */}
      <Card
        withBorder
        padding="lg"
        radius="md"
        shadow="sm"
        style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            週間パフォーマンス
          </Text>

          <Box
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '12px',
              height: '200px',
              padding: '1rem 0',
            }}
          >
            {weeklyData.map((data, index) => (
              <Box
                key={WEEK_DAYS[index]}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
              >
                <Box
                  style={{
                    width: '100%',
                    height: `${data.height}%`,
                    background:
                      'linear-gradient(180deg, var(--mantine-color-blue-5) 0%, var(--mantine-color-cyan-4) 100%)',
                    borderRadius: '8px 8px 0 0',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  className="bar-chart-item"
                >
                  <Box
                    className="bar-value"
                    style={{
                      position: 'absolute',
                      top: '-24px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      color: 'var(--mantine-color-blue-6)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    }}
                  >
                    {Math.round(data.height)}%
                  </Box>
                </Box>
                <Text size="xs" c="dimmed" fw={600}>
                  {WEEK_DAYS[index]}
                </Text>
              </Box>
            ))}
          </Box>
        </Stack>
      </Card>

      {/* 統計メトリクスカード */}
      <Group gap="md" style={{ flexWrap: 'wrap' }}>
        {STAT_METRICS.map((metric) => (
          <Card
            key={metric.label}
            withBorder
            padding="lg"
            radius="md"
            shadow="sm"
            style={{
              flex: '1 1 200px',
              backgroundColor: '#1a1a1a',
              borderColor: '#2a2a2a',
              transition: 'all 0.3s ease',
            }}
            styles={{
              root: {
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 'var(--mantine-shadow-md)',
                },
              },
            }}
          >
            <Stack gap="xs">
              <Text size="sm" c="dimmed">
                {metric.label}
              </Text>
              <Text size="xl" fw={700} c={`${metric.color}.6`}>
                {metric.value}
              </Text>
            </Stack>
          </Card>
        ))}
      </Group>

      {/* 習慣別パフォーマンスカード */}
      <Card
        withBorder
        padding="lg"
        radius="md"
        shadow="sm"
        style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
      >
        <Stack gap="md">
          <Text size="lg" fw={600} c="dimmed">
            習慣別パフォーマンス
          </Text>

          <Stack gap="md">
            {[
              { name: '朝の瞑想', rate: 95, trend: '+12%', color: 'blue' },
              { name: '読書30分', rate: 88, trend: '+8%', color: 'green' },
              { name: '運動1時間', rate: 82, trend: '+5%', color: 'orange' },
              { name: '日記を書く', rate: 90, trend: '+15%', color: 'grape' },
            ].map((habit) => (
              <Group
                key={habit.name}
                gap="md"
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#0f0f0f',
                  borderRadius: '8px',
                }}
              >
                <Box style={{ flex: 1 }}>
                  <Group justify="space-between" mb={6}>
                    <Text size="sm" c="dimmed">
                      {habit.name}
                    </Text>
                    <Text size="xs" c="green.6" fw={600}>
                      {habit.trend}
                    </Text>
                  </Group>
                  <Box
                    style={{
                      width: '100%',
                      height: '6px',
                      backgroundColor: 'var(--mantine-color-gray-2)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      style={{
                        width: `${habit.rate}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, var(--mantine-color-${habit.color}-4), var(--mantine-color-${habit.color}-6))`,
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </Box>
                </Box>
                <Box style={{ textAlign: 'right', minWidth: '60px' }}>
                  <Text size="lg" fw={700} c={`${habit.color}.6`}>
                    {habit.rate}%
                  </Text>
                </Box>
              </Group>
            ))}
          </Stack>
        </Stack>
      </Card>

      <style>
        {`
          .bar-chart-item:hover {
            transform: translateY(-4px);
            box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
          }
          .bar-chart-item:hover .bar-value {
            opacity: 1;
          }
        `}
      </style>
    </Stack>
  )
}

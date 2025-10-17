import { Box, Card, Group, Progress, Stack, Text } from '@mantine/core'

const STATS = [
  { label: '総習慣数', value: '12', icon: '📋', color: '#4a90e2' },
  { label: '完了率', value: '87%', icon: '✓', color: '#10b981' },
  { label: '連続日数', value: '45日', icon: '🔥', color: '#f59e0b' },
] as const satisfies readonly {
  label: string
  value: string
  icon: string
  color: `#${string}`
}[]

const HABIT_PROGRESSES = [
  { name: '朝の瞑想', progress: 85, color: '#4a90e2' },
  { name: '読書30分', progress: 92, color: '#10b981' },
  { name: '運動1時間', progress: 78, color: '#f59e0b' },
  { name: '日記を書く', progress: 95, color: '#8b5cf6' },
] as const satisfies readonly { name: string; progress: number; color: `#${string}` }[]

export function DashboardPreview() {
  return (
    <Stack gap="lg" style={{ width: '100%' }}>
      {/* 統計カード */}
      <Group gap="lg" style={{ flexWrap: 'wrap' }}>
        {STATS.map((stat) => (
          <Card
            key={stat.label}
            style={{
              flex: '1 1 200px',
              minWidth: '200px',
              padding: '1.5rem',
              backgroundColor: '#1a1a1a',
              borderRadius: '12px',
              border: '1px solid #2a2a2a',
              transition: 'all 0.3s ease',
            }}
            styles={{
              root: {
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
                  borderColor: stat.color,
                },
              },
            }}
          >
            <Stack gap="sm">
              <Text style={{ fontSize: '2rem' }}>{stat.icon}</Text>
              <Text style={{ color: '#888', fontSize: '0.9rem' }}>{stat.label}</Text>
              <Text
                style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: stat.color,
                }}
              >
                {stat.value}
              </Text>
            </Stack>
          </Card>
        ))}
      </Group>

      {/* 習慣の進捗 */}
      <Card
        style={{
          padding: '1.5rem',
          backgroundColor: '#1a1a1a',
          borderRadius: '12px',
          border: '1px solid #2a2a2a',
        }}
      >
        <Stack gap="md">
          <Text style={{ color: 'white', fontSize: '1.1rem', fontWeight: 600 }}>
            今週の習慣進捗
          </Text>

          {HABIT_PROGRESSES.map((habit) => (
            <Box key={habit.name}>
              <Group justify="space-between" mb={8}>
                <Text style={{ color: '#ccc', fontSize: '0.9rem' }}>{habit.name}</Text>
                <Text style={{ color: habit.color, fontSize: '0.9rem', fontWeight: 600 }}>
                  {habit.progress}%
                </Text>
              </Group>
              <Progress
                value={habit.progress}
                size="md"
                radius="xl"
                styles={{
                  root: {
                    backgroundColor: '#0f0f0f',
                    border: '1px solid #2a2a2a',
                  },
                  section: {
                    background: `linear-gradient(90deg, ${habit.color}cc, ${habit.color})`,
                  },
                }}
              />
            </Box>
          ))}
        </Stack>
      </Card>

      {/* ミニ統計 */}
      <Group gap="md" style={{ flexWrap: 'wrap' }}>
        <Box
          style={{
            flex: '1 1 150px',
            padding: '1rem',
            backgroundColor: '#1a1a1a',
            borderRadius: '8px',
            border: '1px solid #2a2a2a',
          }}
        >
          <Text style={{ color: '#666', fontSize: '0.8rem' }}>今月の完了</Text>
          <Text style={{ color: '#4a90e2', fontSize: '1.5rem', fontWeight: 700 }}>127</Text>
        </Box>
        <Box
          style={{
            flex: '1 1 150px',
            padding: '1rem',
            backgroundColor: '#1a1a1a',
            borderRadius: '8px',
            border: '1px solid #2a2a2a',
          }}
        >
          <Text style={{ color: '#666', fontSize: '0.8rem' }}>平均時間</Text>
          <Text style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 700 }}>42分</Text>
        </Box>
        <Box
          style={{
            flex: '1 1 150px',
            padding: '1rem',
            backgroundColor: '#1a1a1a',
            borderRadius: '8px',
            border: '1px solid #2a2a2a',
          }}
        >
          <Text style={{ color: '#666', fontSize: '0.8rem' }}>最長連続</Text>
          <Text style={{ color: '#f59e0b', fontSize: '1.5rem', fontWeight: 700 }}>45日</Text>
        </Box>
      </Group>
    </Stack>
  )
}

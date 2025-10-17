import { Box, Group, Stack, Text } from '@mantine/core'

const WEEK_DAYS = ['月', '火', '水', '木', '金', '土', '日'] as const satisfies readonly string[]

const STAT_METRICS = [
  { label: '平均完了率', value: '82%', color: '#4a90e2' },
  { label: '最長連続', value: '21日', color: '#10b981' },
  { label: '今週の完了', value: '38/42', color: '#f59e0b' },
] as const satisfies readonly { label: string; value: string; color: `#${string}` }[]

export function StatsPreview() {
  // 週間パフォーマンスデータ
  const weeklyData = WEEK_DAYS.map(() => ({
    height: Math.random() * 80 + 20,
  }))

  return (
    <Stack gap="lg" style={{ width: '100%' }}>
      {/* 週間パフォーマンスグラフ */}
      <Box>
        <Text style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          週間パフォーマンス
        </Text>

        <Box
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '12px',
            height: '220px',
            padding: '1rem',
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            border: '1px solid #2a2a2a',
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
                  background: 'linear-gradient(180deg, #4a90e2 0%, #38bdf8 100%)',
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
                    color: '#4a90e2',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  }}
                >
                  {Math.round(data.height)}%
                </Box>
              </Box>
              <Text style={{ color: '#666', fontSize: '0.85rem', fontWeight: 600 }}>
                {WEEK_DAYS[index]}
              </Text>
            </Box>
          ))}
        </Box>
      </Box>

      {/* 統計メトリクス */}
      <Group gap="lg" style={{ flexWrap: 'wrap' }}>
        {STAT_METRICS.map((metric) => (
          <Box
            key={metric.label}
            style={{
              flex: '1 1 200px',
              padding: '1.5rem',
              backgroundColor: '#1a1a1a',
              borderRadius: '12px',
              border: '1px solid #2a2a2a',
              transition: 'all 0.3s ease',
            }}
            className="metric-card"
          >
            <Text style={{ color: '#666', fontSize: '0.9rem', marginBottom: '8px' }}>
              {metric.label}
            </Text>
            <Text style={{ color: metric.color, fontSize: '2rem', fontWeight: 700 }}>
              {metric.value}
            </Text>
          </Box>
        ))}
      </Group>

      {/* 習慣別パフォーマンス */}
      <Box
        style={{
          padding: '1.5rem',
          backgroundColor: '#1a1a1a',
          borderRadius: '12px',
          border: '1px solid #2a2a2a',
        }}
      >
        <Text style={{ color: 'white', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
          習慣別パフォーマンス
        </Text>

        <Stack gap="md">
          {[
            { name: '朝の瞑想', rate: 95, trend: '+12%', color: '#4a90e2' },
            { name: '読書30分', rate: 88, trend: '+8%', color: '#10b981' },
            { name: '運動1時間', rate: 82, trend: '+5%', color: '#f59e0b' },
            { name: '日記を書く', rate: 90, trend: '+15%', color: '#8b5cf6' },
          ].map((habit) => (
            <Group
              key={habit.name}
              gap="md"
              style={{
                padding: '1rem',
                backgroundColor: '#0f0f0f',
                borderRadius: '8px',
                border: '1px solid #2a2a2a',
              }}
            >
              <Box style={{ flex: 1 }}>
                <Text style={{ color: '#ccc', fontSize: '0.95rem', marginBottom: '6px' }}>
                  {habit.name}
                </Text>
                <Box
                  style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    border: '1px solid #2a2a2a',
                  }}
                >
                  <Box
                    style={{
                      width: `${habit.rate}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${habit.color}cc, ${habit.color})`,
                      transition: 'width 0.5s ease',
                    }}
                  />
                </Box>
              </Box>
              <Box style={{ textAlign: 'right', minWidth: '80px' }}>
                <Text style={{ color: habit.color, fontSize: '1.2rem', fontWeight: 700 }}>
                  {habit.rate}%
                </Text>
                <Text style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 600 }}>
                  {habit.trend}
                </Text>
              </Box>
            </Group>
          ))}
        </Stack>
      </Box>

      <style>
        {`
          .bar-chart-item:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 16px rgba(74, 144, 226, 0.3);
          }
          .bar-chart-item:hover .bar-value {
            opacity: 1;
          }
          .metric-card:hover {
            transform: translateY(-2px);
            border-color: #4a90e2;
            box-shadow: 0 4px 12px rgba(74, 144, 226, 0.2);
          }
        `}
      </style>
    </Stack>
  )
}

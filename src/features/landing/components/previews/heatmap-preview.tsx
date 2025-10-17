import { Box, Group, Stack, Text } from '@mantine/core'

const COLORS = [
  '#1a1a1a',
  '#0e4429',
  '#006d32',
  '#26a641',
  '#39d353',
] as const satisfies readonly string[]

export function HeatmapPreview() {
  // 365日分のヒートマップデータを生成
  const generateHeatmapData = () => {
    return Array.from({ length: 365 }).map(() => Math.floor(Math.random() * 5))
  }

  const heatmapData = generateHeatmapData()

  // 週単位（7日ごと）にグリッド配置するため、52週分の配列を作成
  const weeks: number[][] = []
  for (let i = 0; i < 53; i++) {
    weeks.push(heatmapData.slice(i * 7, (i + 1) * 7))
  }

  return (
    <Stack gap="lg" style={{ width: '100%' }}>
      <Box>
        <Text style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1rem' }}>
          過去1年間の継続状況
        </Text>

        {/* 曜日ラベル */}
        <Group gap={4} mb={8} style={{ marginLeft: '32px' }}>
          {['月', '', '水', '', '金', '', ''].map((day, i) => (
            <Box key={i} style={{ width: '12px', textAlign: 'center' }}>
              <Text style={{ color: '#666', fontSize: '0.7rem' }}>{day}</Text>
            </Box>
          ))}
        </Group>

        {/* ヒートマップグリッド */}
        <Group gap={4} align="flex-start" style={{ flexWrap: 'nowrap', overflowX: 'auto' }}>
          {/* 月ラベル列 */}
          <Stack gap={4} style={{ width: '24px', flexShrink: 0 }}>
            <Box style={{ height: '12px' }} />
            <Box style={{ height: '12px' }}>
              <Text style={{ color: '#666', fontSize: '0.7rem' }}>1月</Text>
            </Box>
            <Box style={{ height: '12px' }} />
            <Box style={{ height: '12px' }}>
              <Text style={{ color: '#666', fontSize: '0.7rem' }}>4月</Text>
            </Box>
            <Box style={{ height: '12px' }} />
            <Box style={{ height: '12px' }}>
              <Text style={{ color: '#666', fontSize: '0.7rem' }}>7月</Text>
            </Box>
            <Box style={{ height: '12px' }} />
          </Stack>

          {/* 週のセル */}
          {weeks.map((week, weekIndex) => (
            <Stack key={weekIndex} gap={4} style={{ flexShrink: 0 }}>
              {week.map((intensity, dayIndex) => (
                <Box
                  key={`${weekIndex}-${dayIndex}`}
                  style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: COLORS[intensity],
                    borderRadius: '2px',
                    border: '1px solid #2a2a2a',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  className="heatmap-cell"
                  title={`${intensity}件の記録`}
                />
              ))}
            </Stack>
          ))}
        </Group>

        {/* カラーレジェンド */}
        <Group gap="xs" style={{ marginTop: '1.5rem', justifyContent: 'center' }}>
          <Text style={{ color: '#666', fontSize: '0.8rem' }}>少</Text>
          {[0, 1, 2, 3, 4].map((i) => (
            <Box
              key={i}
              style={{
                width: '14px',
                height: '14px',
                backgroundColor: COLORS[i],
                borderRadius: '2px',
                border: '1px solid #2a2a2a',
              }}
            />
          ))}
          <Text style={{ color: '#666', fontSize: '0.8rem' }}>多</Text>
        </Group>
      </Box>

      {/* 統計情報 */}
      <Group gap="lg" style={{ flexWrap: 'wrap', marginTop: '1rem' }}>
        <Box
          style={{
            flex: '1 1 180px',
            padding: '1rem',
            backgroundColor: '#1a1a1a',
            borderRadius: '8px',
            border: '1px solid #2a2a2a',
          }}
        >
          <Text style={{ color: '#666', fontSize: '0.85rem' }}>最長連続</Text>
          <Group gap="xs" mt={4}>
            <Text style={{ color: '#39d353', fontSize: '1.8rem', fontWeight: 700 }}>45</Text>
            <Text style={{ color: '#888', fontSize: '0.9rem' }}>日</Text>
          </Group>
        </Box>
        <Box
          style={{
            flex: '1 1 180px',
            padding: '1rem',
            backgroundColor: '#1a1a1a',
            borderRadius: '8px',
            border: '1px solid #2a2a2a',
          }}
        >
          <Text style={{ color: '#666', fontSize: '0.85rem' }}>今年の完了</Text>
          <Group gap="xs" mt={4}>
            <Text style={{ color: '#4a90e2', fontSize: '1.8rem', fontWeight: 700 }}>287</Text>
            <Text style={{ color: '#888', fontSize: '0.9rem' }}>回</Text>
          </Group>
        </Box>
        <Box
          style={{
            flex: '1 1 180px',
            padding: '1rem',
            backgroundColor: '#1a1a1a',
            borderRadius: '8px',
            border: '1px solid #2a2a2a',
          }}
        >
          <Text style={{ color: '#666', fontSize: '0.85rem' }}>継続率</Text>
          <Group gap="xs" mt={4}>
            <Text style={{ color: '#10b981', fontSize: '1.8rem', fontWeight: 700 }}>79</Text>
            <Text style={{ color: '#888', fontSize: '0.9rem' }}>%</Text>
          </Group>
        </Box>
      </Group>

      <style>
        {`
          .heatmap-cell:hover {
            transform: scale(1.3);
            border-color: #4a90e2 !important;
            z-index: 10;
          }
        `}
      </style>
    </Stack>
  )
}

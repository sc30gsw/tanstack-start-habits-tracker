import { Box, Card, Group, Stack, Text } from '@mantine/core'

// 実際のアプリの青系グラデーション（habit-heatmap.tsxより）
const HEATMAP_COLORS = [
  '#e3f2fd',
  '#90caf9',
  '#2196f3',
  '#1565c0',
] as const satisfies readonly string[]
const NO_RECORD_COLOR = '#ebedf0' // GitHub風グレー

export function HeatmapPreview() {
  // 365日分のヒートマップデータを生成（0-4の強度）
  const generateHeatmapData = () => {
    return Array.from({ length: 365 }).map(() => Math.floor(Math.random() * 5))
  }

  const heatmapData = generateHeatmapData()

  // 週単位（7日ごと）にグリッド配置するため、52週分の配列を作成
  const weeks: number[][] = []
  for (let i = 0; i < 53; i++) {
    weeks.push(heatmapData.slice(i * 7, (i + 1) * 7))
  }

  // 強度値に応じた色を取得
  const getColorForIntensity = (intensity: number) => {
    if (intensity === 0) return NO_RECORD_COLOR
    const colorIndex = Math.min(intensity - 1, HEATMAP_COLORS.length - 1)
    return HEATMAP_COLORS[colorIndex]
  }

  return (
    <Stack gap="lg" style={{ width: '100%' }}>
      {/* ヒートマップカード */}
      <Card
        withBorder
        padding="md"
        radius="md"
        style={{
          backgroundColor: 'var(--mantine-color-gray-0)',
        }}
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            過去1年間の継続状況
          </Text>

          {/* 曜日ラベル */}
          <Group gap={2} style={{ marginLeft: '28px' }}>
            {['月', '', '水', '', '金', '', ''].map((day, i) => (
              <Box key={i} style={{ width: '12px', textAlign: 'center' }}>
                <Text size="10px" c="dimmed">
                  {day}
                </Text>
              </Box>
            ))}
          </Group>

          {/* ヒートマップグリッド */}
          <Group gap={2} align="flex-start" style={{ flexWrap: 'nowrap', overflowX: 'auto' }}>
            {/* 月ラベル列 */}
            <Stack gap={2} style={{ width: '24px', flexShrink: 0 }}>
              <Box style={{ height: '12px' }} />
              <Box style={{ height: '12px' }}>
                <Text size="10px" c="dimmed">
                  1月
                </Text>
              </Box>
              <Box style={{ height: '12px' }} />
              <Box style={{ height: '12px' }}>
                <Text size="10px" c="dimmed">
                  4月
                </Text>
              </Box>
              <Box style={{ height: '12px' }} />
              <Box style={{ height: '12px' }}>
                <Text size="10px" c="dimmed">
                  7月
                </Text>
              </Box>
              <Box style={{ height: '12px' }} />
            </Stack>

            {/* 週のセル */}
            {weeks.map((week, weekIndex) => (
              <Stack key={weekIndex} gap={2} style={{ flexShrink: 0 }}>
                {week.map((intensity, dayIndex) => (
                  <Box
                    key={`${weekIndex}-${dayIndex}`}
                    style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: getColorForIntensity(intensity),
                      borderRadius: '2px',
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
          <Group gap="lg" justify="center" mt="sm">
            <Text size="xs" c="dimmed">
              記録なし
            </Text>
            <Group gap={4} align="center">
              <Box
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: NO_RECORD_COLOR,
                  borderRadius: 2,
                }}
              />
              {HEATMAP_COLORS.map((color, index) => (
                <Box
                  key={index}
                  style={{
                    width: 12,
                    height: 12,
                    backgroundColor: color,
                    borderRadius: 2,
                  }}
                />
              ))}
            </Group>
            <Text size="xs" c="dimmed">
              高活動
            </Text>
          </Group>
        </Stack>
      </Card>

      {/* 統計情報カード */}
      <Group gap="md" style={{ flexWrap: 'wrap' }}>
        {[
          { label: '最長連続', value: '45', unit: '日', color: 'green' },
          { label: '今年の完了', value: '287', unit: '回', color: 'blue' },
          { label: '継続率', value: '79', unit: '%', color: 'grape' },
        ].map((stat) => (
          <Card key={stat.label} withBorder padding="md" radius="md" style={{ flex: '1 1 180px' }}>
            <Stack gap={4}>
              <Text size="xs" c="dimmed">
                {stat.label}
              </Text>
              <Group gap={4} align="baseline">
                <Text size="xl" fw={700} c={`${stat.color}.6`}>
                  {stat.value}
                </Text>
                <Text size="sm" c="dimmed">
                  {stat.unit}
                </Text>
              </Group>
            </Stack>
          </Card>
        ))}
      </Group>

      <style>
        {`
          .heatmap-cell:hover {
            transform: scale(1.3);
            outline: 2px solid var(--mantine-color-blue-6);
            z-index: 10;
          }
        `}
      </style>
    </Stack>
  )
}

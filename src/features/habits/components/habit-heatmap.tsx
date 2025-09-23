import { Heatmap } from '@mantine/charts'
import { Box, Group, Stack, Text, useMantineTheme } from '@mantine/core'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import type { RecordEntity } from '~/features/habits/types/habit'
import { formatDuration } from '~/features/habits/utils/time-utils'

type Metric = 'completion' | 'duration'

type HabitHeatmapProps = {
  records: RecordEntity[]
  onSelectDate?: (date: string) => void
  metric?: Metric
  selectedDate?: string | null
}

// Mantine Heatmap は { date: string, value: number }[] を受け取り内部でスケール化
export function HabitHeatmap({
  records,
  onSelectDate,
  metric = 'duration',
  selectedDate,
}: HabitHeatmapProps) {
  const theme = useMantineTheme()

  const dataMap = useMemo(() => {
    const map: Record<string, number> = {}

    // 実際の記録データをマップに変換
    records.forEach((r) => {
      if (metric === 'duration') {
        map[r.date] = r.duration_minutes ?? 0
      } else {
        // completionの場合、完了=1、未完了=0.5として区別する
        map[r.date] = r.completed ? 1 : 0.5
      }
    })

    return map
  }, [records, metric])

  // GitHub風ブルー基調の4段階カラーパレット
  const colors = useMemo(() => {
    const baseBlue = theme.colors.blue || []
    return [
      baseBlue[1] || '#e3f2fd', // レベル1（最も薄い青）
      baseBlue[3] || '#90caf9', // レベル2
      baseBlue[5] || '#2196f3', // レベル3
      baseBlue[7] || '#1565c0', // レベル4（最も濃い青）
    ]
  }, [theme.colors.blue])

  // データの最大値を計算
  const maxValue = useMemo(() => {
    const values = Object.values(dataMap)
    if (metric === 'completion') return 1
    return Math.max(...values, 1)
  }, [dataMap, metric])

  // 値に基づいてcolorsから適切な色を選択する関数
  const getColorForValue = (value: number) => {
    if (value === 0) return '#f0f0f0' // 値が0の場合は薄いグレー
    const ratio = value / maxValue
    const colorIndex = Math.min(Math.floor(ratio * colors.length), colors.length - 1)
    return colors[colorIndex]
  }

  return (
    <Stack gap="md">
      <Box
        style={{
          width: '100%',
          overflowX: 'auto',
          cursor: 'pointer',
        }}
      >
        <Heatmap
          data={dataMap}
          colors={colors}
          startDate={dayjs().subtract(365, 'day').toDate()}
          endDate={dayjs().toDate()}
          withMonthLabels
          withWeekdayLabels
          withTooltip
          getTooltipLabel={({ date, value }) => {
            if (metric === 'duration') {
              return `${date} – ${value == null || value === 0 ? '記録なし' : formatDuration(value)}`
            }
            return `${date} – ${value == null ? '記録なし' : value === 1 ? '完了' : value === 0.5 ? '未完了' : '記録なし'}`
          }}
          rectSize={12}
          rectRadius={2}
          gap={2}
          getRectProps={({ date, value }) => {
            const isSelected = selectedDate && date === selectedDate
            // 値がnullまたは0の場合は記録なし
            const hasRecord = value != null && value > 0

            // 色の決定: 記録なし -> グレー、記録あり -> colorsから選択
            const fillColor = !hasRecord
              ? '#ebedf0' // 記録なし（GitHub風グレー）
              : getColorForValue(value || 0) // colorsから適切な色を選択

            return {
              onClick: () => date && onSelectDate?.(date),
              style: {
                cursor: 'pointer',
                outline: 'none',
                stroke: isSelected ? 'var(--mantine-color-blue-6)' : 'none',
                strokeWidth: isSelected ? 2 : 0,
              },
              fill: fillColor,
              'aria-label': `${date} ${
                metric === 'duration'
                  ? value == null || value === 0
                    ? '記録なし'
                    : formatDuration(value)
                  : value == null
                    ? '記録なし'
                    : value === 1
                      ? '完了'
                      : '未完了'
              }`,
              role: 'button',
            }
          }}
          style={{
            minWidth: '800px', // 最小幅を設定してスクロール可能に
            width: '100%',
          }}
        />
      </Box>

      {/* 凡例 */}
      {metric === 'duration' ? (
        // 時間の場合は段階的なグラデーション
        <Group gap="lg" justify="center">
          <Text size="xs" c="dimmed">
            記録なし
          </Text>
          <Group gap="xs" align="center">
            {['#ebedf0', ...colors].map((color, index) => (
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
      ) : (
        // 完了状況の場合は未完了・完了の明確な3段階
        <Group gap="sm" justify="center" wrap="nowrap">
          <Group gap="xs" align="center">
            <Box
              style={{
                width: 12,
                height: 12,
                backgroundColor: '#ebedf0',
                borderRadius: 2,
              }}
            />
            <Text size="xs" c="dimmed">
              記録なし
            </Text>
          </Group>
          <Group gap="xs" align="center">
            <Box
              style={{
                width: 12,
                height: 12,
                backgroundColor: colors[1], // 未完了用の薄い色
                borderRadius: 2,
              }}
            />
            <Text size="xs" c="dimmed">
              未完了
            </Text>
          </Group>
          <Group gap="xs" align="center">
            <Box
              style={{
                width: 12,
                height: 12,
                backgroundColor: colors[3], // 完了用の濃い色
                borderRadius: 2,
              }}
            />
            <Text size="xs" c="dimmed">
              完了
            </Text>
          </Group>
        </Group>
      )}
    </Stack>
  )
}

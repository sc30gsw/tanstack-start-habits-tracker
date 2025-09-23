import { Heatmap } from '@mantine/charts'
import { Box, useMantineTheme } from '@mantine/core'
import { useMemo } from 'react'
import type { RecordEntity } from '~/features/habits/types/habit'

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
    records.forEach((r) => {
      if (metric === 'duration') {
        map[r.date] = r.duration_minutes ?? 0
      } else {
        map[r.date] = r.completed ? 1 : 0
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
    <Box>
      <Heatmap
        data={dataMap}
        colors={colors}
        withMonthLabels
        withWeekdayLabels
        withTooltip
        getTooltipLabel={({ date, value }) => {
          if (metric === 'duration') {
            return `${date} – ${value == null || value === 0 ? '記録なし' : `${value} 分`}`
          }
          return `${date} – ${value === 1 ? '完了' : value === 0 ? '未完了' : '記録なし'}`
        }}
        rectSize={12}
        rectRadius={2}
        gap={2}
        getRectProps={({ date, value }) => {
          const isSelected = selectedDate && date === selectedDate
          const hasData = date in dataMap

          // 色の決定: データなし -> グレー、データあり -> colorsから選択
          const fillColor = !hasData
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
                  : `${value} 分`
                : value === 1
                  ? '完了'
                  : value === 0
                    ? '未完了'
                    : '記録なし'
            }`,
            role: 'button',
          }
        }}
        style={{ width: '100%', overflowX: 'auto' }}
      />
    </Box>
  )
}

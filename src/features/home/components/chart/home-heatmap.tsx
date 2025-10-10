import { Heatmap } from '@mantine/charts'
import { Box, Group, Stack, Text } from '@mantine/core'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { useMemo } from 'react'
import { groupBy, mapValues, pipe } from 'remeda'
import type { RecordEntity } from '~/features/habits/types/habit'
import { formatDuration } from '~/features/habits/utils/time-utils'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

export function HomeHeatmap() {
  const apiRoute = getRouteApi('/')
  const searchParams = apiRoute.useSearch()
  const selectedDate = searchParams?.selectedDate || null

  const navigate = apiRoute.useNavigate()

  const { habits, records } = apiRoute.useLoaderData()

  // 習慣IDから習慣名へのマップを作成
  const habitNameMap = useMemo(() => {
    return (
      habits.data?.reduce(
        (acc, habit) => {
          acc[habit.id] = habit.name
          return acc
        },
        {} as Record<string, string>,
      ) || {}
    )
  }, [habits])

  // 日付ごとの集約データを作成（時間のみ）
  const { dataMap, habitDetailsMap } = useMemo(() => {
    const dataMap: Record<string, number> = {}
    const habitDetailsMap: Record<string, RecordEntity[]> = {}

    // 日付ごとにレコードをグループ化
    pipe(
      records.data ?? [],
      groupBy((record) => record.date),
      mapValues((dateRecords) => {
        // 各日付の総時間を計算
        const totalDuration = dateRecords.reduce((sum, r) => sum + (r.duration_minutes || 0), 0)
        dataMap[dateRecords[0].date] = totalDuration
        habitDetailsMap[dateRecords[0].date] = dateRecords

        return dateRecords
      }),
    )

    return { dataMap, habitDetailsMap }
  }, [records])

  // 4段階のブルーグラデーション（時間専用）
  const colors = ['#e3f2fd', '#90caf9', '#2196f3', '#1565c0']

  // データの最大値を計算
  const maxValue = useMemo(() => {
    const values = Object.values(dataMap)

    return Math.max(...values, 1)
  }, [dataMap])

  // 値に基づいてcolorsから適切な色を選択する関数
  const getColorForValue = (value: number) => {
    if (value === 0) {
      return '#ebedf0'
    }

    const ratio = value / maxValue
    const colorIndex = Math.min(Math.floor(ratio * colors.length), colors.length - 1)

    return colors[colorIndex]
  }

  // カスタムtooltipの内容を生成
  const getTooltipLabel = ({ date, value }: { date: string; value: number | null }) => {
    if (value == null || value === 0) {
      // 日付に曜日を追加
      const formattedDate = dayjs(date).format('YYYY-MM-DD（ddd）')
      return `${formattedDate}\n記録なし`
    }

    const habitDetails = habitDetailsMap[date] || []
    if (habitDetails.length === 0) {
      const formattedDate = dayjs(date).format('YYYY-MM-DD（ddd）')
      return `${formattedDate}\n記録なし`
    }

    // 日付に曜日を追加
    const formattedDate = dayjs(date).format('YYYY-MM-DD（ddd）')
    const totalTime = formatDuration(value)

    // 習慣別の詳細を生成（リスト形式）
    const detailsArray = habitDetails
      .filter((record) => (record.duration_minutes || 0) > 0)
      .map((record) => {
        const habitName = habitNameMap[record.habitId] || `習慣#${record.habitId}`
        return `・${habitName}: ${formatDuration(record.duration_minutes || 0)}`
      })

    return detailsArray.length > 0 ? (
      <>
        <Text size="md">{formattedDate}</Text>
        <Text size="sm">総時間: {totalTime}</Text>
        <br />
        {detailsArray.map((detail, index) => (
          <span key={index}>
            <Text size="sm">{detail}</Text>
          </span>
        ))}
      </>
    ) : (
      <>
        <Text>{formattedDate}</Text>
        <Text>総時間: {totalTime}</Text>
      </>
    )
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
          startDate={dayjs().tz('Asia/Tokyo').subtract(365, 'day').toDate()}
          endDate={dayjs().tz('Asia/Tokyo').toDate()}
          withMonthLabels
          withWeekdayLabels
          withTooltip
          getTooltipLabel={getTooltipLabel}
          rectSize={12}
          rectRadius={2}
          gap={2}
          getRectProps={({ date, value }) => {
            const isSelected = selectedDate && date === selectedDate
            const hasRecord = value != null && value > 0

            const fillColor = !hasRecord
              ? '#ebedf0' // 記録なし
              : getColorForValue(value || 0)

            return {
              onClick: () =>
                date &&
                navigate({
                  search: (prev) => ({
                    ...prev,
                    selectedDate: date,
                  }),
                }),
              style: {
                cursor: 'pointer',
                outline: 'none',
                stroke: isSelected ? 'var(--mantine-color-blue-6)' : 'none',
                strokeWidth: isSelected ? 2 : 0,
              },
              fill: fillColor,
              'aria-label': `${date} ${
                value == null || value === 0 ? '記録なし' : formatDuration(value)
              }`,
              role: 'button',
            }
          }}
          style={{
            minWidth: '800px',
            width: '100%',
          }}
        />
      </Box>

      {/* 時間専用の凡例 */}
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
    </Stack>
  )
}

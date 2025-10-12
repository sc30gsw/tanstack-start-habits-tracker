import { CompositeChart } from '@mantine/charts'
import { Card, Group, Stack, Text, useComputedColorScheme } from '@mantine/core'
import { IconTrendingUp } from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

import { indexBy, map, pipe } from 'remeda'
import { CALENDAR_VIEW_HASH_TARGET } from '~/features/habits/constants/hash-target-ids'
import type { RecordEntity } from '~/features/habits/types/habit'
import type { HabitColor } from '~/features/habits/types/schemas/habit-schemas'
import { getValidatedDate } from '~/features/habits/types/schemas/search-params'

type TrendsChartProps = {
  records: RecordEntity[]
  selectedDate?: Date | null
  habitColor?: HabitColor
}

type ChartData = {
  date: string
  dateKey: `${number}-${number}-${number}`
  duration: number
}

export function TrendsChart({ records, habitColor = 'blue' }: TrendsChartProps) {
  const routeApi = getRouteApi('/habits/$habitId')
  const navigate = routeApi.useNavigate()

  const searchParams = routeApi.useSearch()
  const selectedDate = getValidatedDate(searchParams?.selectedDate)
  const calendarView = searchParams?.calendarView || 'month'
  const currentMonthString = searchParams?.currentMonth || dayjs(selectedDate).format('YYYY-MM')

  const currentMonth = dayjs.tz(currentMonthString, 'Asia/Tokyo').isValid()
    ? dayjs.tz(currentMonthString, 'Asia/Tokyo').startOf('month')
    : dayjs(selectedDate).startOf('month')

  const computedColorScheme = useComputedColorScheme('light')
  const titleColor = computedColorScheme === 'dark' ? 'gray.1' : 'dark.8'

  // データ集約関数
  const aggregateData = () => {
    if (records.length === 0) {
      return []
    }

    switch (calendarView) {
      case 'month':
        return aggregateByMonth()
      case 'week':
        return aggregateByWeek()
      case 'day':
        return aggregateByDay()
      default:
        return []
    }
  }

  // 月別集約（現在表示中の月の日毎データ）
  const aggregateByMonth = () => {
    const baseMonth = currentMonth || dayjs().tz('Asia/Tokyo')
    const endOfMonth = baseMonth.endOf('month')

    // completedのみをフィルタリング
    const completedRecords = records.filter((record) => record.status === 'completed')

    const recordMap = pipe(
      completedRecords,
      indexBy((record) => record.date),
    )

    return pipe(
      Array.from({ length: endOfMonth.date() }, (_, i) => baseMonth.startOf('month').add(i, 'day')),
      map((date) => ({
        dayKey: date.format('YYYY-MM-DD'),
        date: date.format('D日'),
      })),
      map(({ dayKey, date }) => {
        const record = recordMap[dayKey]
        const duration = record?.duration_minutes || 0

        return {
          date,
          dateKey: dayKey,
          duration,
        }
      }),
    )
  }

  // 週別集約（現在の週を含む7日間）
  const aggregateByWeek = (): ChartData[] => {
    const baseDate = selectedDate ? dayjs(selectedDate).tz('Asia/Tokyo') : dayjs().tz('Asia/Tokyo')
    const startOfWeek = baseDate.startOf('week')
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'] as const satisfies readonly string[]

    // completedのみをフィルタリング
    const completedRecords = records.filter((record) => record.status === 'completed')

    const recordMap = pipe(
      completedRecords,
      indexBy((record) => record.date),
    )

    return pipe(
      Array.from({ length: 7 }, (_, i) => ({
        date: startOfWeek.add(i, 'day'),
        dayName: dayNames[i],
      })),
      map(({ date, dayName }) => {
        const record = recordMap[date.format('YYYY-MM-DD')]
        const duration = record?.duration_minutes || 0

        return {
          date: dayName,
          dateKey: date.format('YYYY-MM-DD') as ChartData['dateKey'],
          duration,
        }
      }),
    )
  }

  // 日別集約（選択された日付の詳細）
  const aggregateByDay = (): ChartData[] => {
    const baseDate = selectedDate ? dayjs(selectedDate).tz('Asia/Tokyo') : dayjs().tz('Asia/Tokyo')
    const dateKey = baseDate.format('YYYY-MM-DD') as ChartData['dateKey']

    // completedのみをフィルタリング
    const completedRecords = records.filter((record) => record.status === 'completed')

    const recordMap = pipe(
      completedRecords,
      indexBy((record) => record.date),
    )
    const record = recordMap[dateKey]

    const duration = record?.duration_minutes || 0

    return [
      {
        date: baseDate.format('M/D'),
        dateKey,
        duration,
      },
    ]
  }

  const rawChartData = aggregateData()

  const chartData = rawChartData

  if (chartData.length === 0) {
    return (
      <Card withBorder padding="lg" radius="md" shadow="sm">
        <Stack gap="md">
          <Group gap="xs" align="center">
            <IconTrendingUp size={24} color="var(--mantine-color-blue-6)" />
            <Text size="lg" fw={600} c={titleColor}>
              トレンドチャート
            </Text>
          </Group>
          <Text size="sm" c="dimmed" ta="center" py="xl">
            表示するデータがありません
          </Text>
        </Stack>
      </Card>
    )
  }

  const getBarColor = (color: HabitColor) => {
    const barColorMap = {
      blue: 'orange.4', // 青の補色系
      green: 'red.4', // 緑の補色系
      red: 'teal.4', // 赤の補色系
      purple: 'yellow.4', // 紫の補色系
      orange: 'blue.4', // オレンジの補色系
      yellow: 'violet.4', // イエローの補色系（紫）
      indigo: 'orange.4', // インディゴの補色系（オレンジ）
      pink: 'teal.4', // ピンクの補色系（ティール）
    } as const satisfies Record<HabitColor, `${string}.4`>

    return barColorMap[color] || 'gray.4'
  }

  // Y軸の表示用に最大値を計算
  const maxDuration = Math.max(...chartData.map((d) => d.duration))
  const yAxisTicks = Array.from({ length: Math.floor(maxDuration / 20) + 1 }, (_, i) => i * 20)

  if (maxDuration % 20 !== 0) {
    yAxisTicks.push(Math.ceil(maxDuration / 20) * 20)
  }

  return (
    <Card withBorder padding="lg" radius="md" shadow="sm">
      <Stack gap="md">
        <Group gap="xs" align="center">
          <IconTrendingUp size={24} color="var(--mantine-color-blue-6)" />
          <Text size="lg" fw={600} c={titleColor}>
            トレンドチャート
          </Text>
          <Text size="sm" c="dimmed">
            ({calendarView === 'month' ? '月別' : calendarView === 'week' ? '週別' : '日別'})
          </Text>
        </Group>

        <div style={{ cursor: 'pointer' }}>
          <CompositeChart
            h={300}
            data={chartData}
            dataKey="date"
            maxBarWidth={30}
            series={[
              {
                name: 'duration',
                label: '実行時間',
                color: getBarColor(habitColor),
                type: 'bar',
              },
              {
                name: 'duration',
                label: '実行時間',
                color: `${habitColor}.8`,
                type: 'line',
              },
              {
                name: 'duration',
                label: '実行時間',
                color: `${habitColor}.8`,
                type: 'area',
              },
            ]}
            curveType="bump"
            tooltipProps={{
              content: ({ label, payload }) => {
                if (!payload || payload.length === 0) {
                  return null
                }

                const data = payload[0]?.payload

                if (!data) {
                  return null
                }

                return (
                  <Card withBorder padding="xs" shadow="md" style={{ minWidth: 120 }}>
                    <Stack gap={4}>
                      <Text size="sm" fw={500}>
                        {label}
                      </Text>
                      <Text size="sm" c="dimmed">
                        実行時間: {data.duration}分
                      </Text>
                    </Stack>
                  </Card>
                )
              },
            }}
            yAxisProps={{
              tickFormatter: (value: number) => `${value}分`,
              domain: [0, 'dataMax + 10'],
              ticks: yAxisTicks,
            }}
            tickLine="none"
            composedChartProps={{
              onClick: (payload) => {
                // activeIndexを使ってchartDataから該当するデータを取得
                if (payload?.activeIndex !== undefined) {
                  const index = Number(payload.activeIndex)
                  const clickedData = chartData[index]

                  if (clickedData?.dateKey) {
                    navigate({
                      hash: CALENDAR_VIEW_HASH_TARGET,
                      search: (prev) => ({
                        ...prev,
                        selectedDate: clickedData.dateKey,
                      }),
                    })
                  }
                }
              },
            }}
          />
        </div>
      </Stack>
    </Card>
  )
}

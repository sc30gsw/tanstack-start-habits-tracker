import { PieChart } from '@mantine/charts'
import { Badge, Card, Divider, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core'
import { IconChartPie, IconClock, IconPercentage, IconTrophy } from '@tabler/icons-react'
import dayjs from 'dayjs'
import type { SearchParams } from '~/features/habits/types/schemas/search-params'
import type { PieChartDataItem } from '~/features/habits/utils/pie-chart-utils'
import { formatDuration } from '~/features/habits/utils/time-utils'

const HOURS_PER_DAY = 24
const MINUTES_PER_HOUR = 60
const MINUTES_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR // 1440分

type TimeUsagePieChartProps = {
  data: PieChartDataItem[]
  totalDuration: number
  period?: SearchParams['calendarView']
  dateRange?: { from: string; to: string }
  onSegmentClick?: (habitId: string) => void
}

export function TimeUsagePieChart({
  data,
  totalDuration,
  period = 'month',
  dateRange,
}: TimeUsagePieChartProps) {
  const getTotalPeriodMinutes = () => {
    if (!dateRange) {
      return MINUTES_PER_DAY
    }

    const fromDate = dayjs(dateRange.from)
    const toDate = dayjs(dateRange.to)

    switch (period) {
      case 'day':
        return MINUTES_PER_DAY

      case 'week': {
        const days = toDate.diff(fromDate, 'day') + 1
        return days * MINUTES_PER_DAY
      }

      default: {
        const days = toDate.diff(fromDate, 'day') + 1
        return days * MINUTES_PER_DAY
      }
    }
  }

  const totalPeriodMinutes = getTotalPeriodMinutes()

  const getPeriodLabel = () => {
    if (!dateRange) {
      return '時間配分'
    }

    const fromDate = dayjs(dateRange.from)
    const toDate = dayjs(dateRange.to)

    switch (period) {
      case 'day':
        return `${fromDate.format('YYYY/MM/DD (ddd)')}の時間配分`

      case 'week':
        return `${fromDate.format('M/D')}〜${toDate.format('M/D')}の時間配分`

      default:
        return `${fromDate.format('YYYY年M月')}の時間配分`
    }
  }

  const getDescription = () => {
    if (!dateRange) {
      return '記録した習慣の実行時間の配分を表示しています。'
    }

    switch (period) {
      case 'day':
        return 'この日に記録した習慣の時間配分です。各習慣が記録時間全体の何%を占めるかを示しています。'

      case 'week':
        return 'この週に記録した習慣の時間配分です。各習慣が記録時間全体の何%を占めるかを示しています。'

      default:
        return 'この月に記録した習慣の時間配分です。各習慣が記録時間全体の何%を占めるかを示しています。'
    }
  }

  if (data.length === 0) {
    return (
      <Card withBorder padding="lg" radius="md" shadow="sm">
        <Text size="sm" c="dimmed" ta="center" py="xl">
          記録されたデータがありません
        </Text>
      </Card>
    )
  }

  const averageDuration = totalDuration > 0 ? Math.round(totalDuration / data.length) : 0
  const maxDuration = data.length > 0 ? Math.max(...data.map((d) => d.value)) : 0

  const habitPercentage = ((totalDuration / totalPeriodMinutes) * 100).toFixed(1)

  const getDailyAverage = () => {
    if (!dateRange) {
      return totalDuration
    }

    const fromDate = dayjs(dateRange.from)
    const toDate = dayjs(dateRange.to)
    const days = toDate.diff(fromDate, 'day') + 1

    return Math.round(totalDuration / days)
  }

  const dailyAverage = getDailyAverage()

  return (
    <Card withBorder padding="lg" radius="md" shadow="sm">
      <Stack gap="md">
        <Stack gap="xs">
          <Group gap="xs" align="center">
            <IconChartPie size={20} />
            <Text size="lg" fw={600}>
              {getPeriodLabel()}
            </Text>
          </Group>
          <Text size="xs" c="dimmed">
            {getDescription()}
          </Text>
        </Stack>

        <PieChart
          h={300}
          data={data}
          withTooltip
          tooltipDataSource="segment"
          valueFormatter={(value) => formatDuration(value)}
          tooltipProps={{
            content: ({ payload }) => {
              if (!payload || payload.length === 0) {
                return null
              }

              const segmentData = payload[0]
              const segmentName = segmentData.name
              const segmentValue = segmentData.value as number

              const item = data.find((d) => d.name === segmentName)
              if (!item) {
                return null
              }

              const percentageOfHabits = ((segmentValue / totalDuration) * 100).toFixed(1)

              return (
                <Paper px="md" py="sm" withBorder shadow="md" radius="md">
                  <Stack gap={4}>
                    <Group gap="xs" align="center">
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: `var(--mantine-color-${item.color ? item.color.replace('.', '-') : 'gray'})`,
                        }}
                      />
                      <Text size="sm" fw={500}>
                        {segmentName}
                      </Text>
                    </Group>
                    <Text size="sm" c="dimmed">
                      時間: {formatDuration(segmentValue)}
                    </Text>
                    <Text size="sm" c="dimmed">
                      割合: {percentageOfHabits}%
                    </Text>
                  </Stack>
                </Paper>
              )
            },
          }}
          labelsPosition="outside"
          withLabels={true}
          labelsType="percent"
        />

        <Divider />

        <Stack gap="xs">
          <Text size="xs" fw={600} c="dimmed">
            期間全体の統計
          </Text>
          <SimpleGrid cols={period === 'day' ? 2 : 3} spacing="md">
            <Stack gap={4}>
              <Group gap={4}>
                <IconClock size={14} style={{ opacity: 0.6 }} />
                <Text size="xs" c="dimmed">
                  総実行時間
                </Text>
              </Group>
              <Text size="sm" fw={600}>
                {formatDuration(totalDuration)}
              </Text>
              <Text size="xs" c="dimmed">
                {period === 'day' ? '24時間中' : `全${Math.floor(totalPeriodMinutes / 60)}時間中`}{' '}
                {habitPercentage}%
              </Text>
            </Stack>
            {period !== 'day' && (
              <Stack gap={4}>
                <Group gap={4}>
                  <IconClock size={14} style={{ opacity: 0.6 }} />
                  <Text size="xs" c="dimmed">
                    1日あたり平均
                  </Text>
                </Group>
                <Text size="sm" fw={600}>
                  {formatDuration(dailyAverage)}
                </Text>
                <Text size="xs" c="dimmed">
                  24時間中 {((dailyAverage / (24 * 60)) * 100).toFixed(1)}%
                </Text>
              </Stack>
            )}
            <Stack gap={4}>
              <Group gap={4}>
                <IconPercentage size={14} style={{ opacity: 0.6 }} />
                <Text size="xs" c="dimmed">
                  記録カバー率
                </Text>
              </Group>
              <Text size="sm" fw={600}>
                {habitPercentage}%
              </Text>
              <Text size="xs" c="dimmed">
                {period === 'day' ? '1日' : period === 'week' ? '1週間' : '1ヶ月'}のうち
              </Text>
            </Stack>
          </SimpleGrid>
        </Stack>

        <Divider />

        <SimpleGrid cols={2} spacing="md">
          <Stack gap={4}>
            <Group gap={4}>
              <IconChartPie size={14} style={{ opacity: 0.6 }} />
              <Text size="xs" c="dimmed">
                1習慣あたりの平均実行時間
              </Text>
            </Group>
            <Text size="sm" fw={600}>
              {formatDuration(averageDuration)}
            </Text>
          </Stack>
          <Stack gap={4}>
            <Group gap={4}>
              <IconTrophy size={14} style={{ opacity: 0.6 }} />
              <Text size="xs" c="dimmed">
                最長実行時間
              </Text>
            </Group>
            <Text size="sm" fw={600}>
              {formatDuration(maxDuration)}
            </Text>
          </Stack>
        </SimpleGrid>

        <Divider />

        <Stack gap="xs">
          <Group gap={4}>
            <IconChartPie size={14} style={{ opacity: 0.6 }} />
            <Text size="xs" c="dimmed" fw={600}>
              凡例
            </Text>
          </Group>
          {data.map((item) => {
            const colorName = item.color.split('.')[0]
            const percentage = ((item.value / totalDuration) * 100).toFixed(1)

            return (
              <Group key={item.habitId} gap="xs" align="center" wrap="nowrap">
                <Badge color={colorName} variant="filled" size="sm" radius="sm">
                  {item.name}
                </Badge>
                <Text size="sm" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                  {formatDuration(item.value)} • {percentage}%
                </Text>
              </Group>
            )
          })}
        </Stack>
      </Stack>
    </Card>
  )
}

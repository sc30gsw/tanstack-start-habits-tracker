import { PieChart } from '@mantine/charts'
import { Badge, Card, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core'
import { IconChartPie, IconClock, IconTrophy } from '@tabler/icons-react'
import dayjs from 'dayjs'
import type { SearchParams } from '~/features/habits/types/schemas/search-params'
import type { PieChartDataItem } from '~/features/habits/utils/pie-chart-utils'
import { formatDuration } from '~/features/habits/utils/time-utils'

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
    if (!dateRange) return '選択期間内の各習慣の実行時間と割合を表示しています。'

    switch (period) {
      case 'day':
        return '1日の各習慣の実行時間と、全体に対する割合を表示しています。'

      case 'week':
        return '1週間の各習慣の合計実行時間と、全体に対する割合を表示しています。'

      default:
        return '1ヶ月間の各習慣の合計実行時間と、全体に対する割合を表示しています。'
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

              const percentage = ((segmentValue / totalDuration) * 100).toFixed(1)

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
                      割合: {percentage}%
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

        <SimpleGrid cols={3} spacing="md">
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
          </Stack>
          <Stack gap={4}>
            <Group gap={4}>
              <IconClock size={14} style={{ opacity: 0.6 }} />
              <Text size="xs" c="dimmed">
                習慣あたり平均
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

        <Stack gap="xs" mt={8}>
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

import { PieChart } from '@mantine/charts'
import { Card, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core'
import type { PieChartDataItem } from '~/features/habits/utils/pie-chart-utils'
import { formatDuration } from '~/features/habits/utils/time-utils'

type TimeUsagePieChartProps = {
  data: PieChartDataItem[]
  totalDuration: number
  onSegmentClick?: (habitId: string) => void
}

export function TimeUsagePieChart({ data, totalDuration }: TimeUsagePieChartProps) {
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
          <div>
            <Text size="xs" c="dimmed">
              総時間
            </Text>
            <Text size="sm" fw={600}>
              {formatDuration(totalDuration)}
            </Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              平均時間
            </Text>
            <Text size="sm" fw={600}>
              {formatDuration(averageDuration)}
            </Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              最長時間
            </Text>
            <Text size="sm" fw={600}>
              {formatDuration(maxDuration)}
            </Text>
          </div>
        </SimpleGrid>

        <Stack gap="xs">
          <Text size="xs" c="dimmed" fw={600}>
            凡例
          </Text>
          {data.map((item) => (
            <Group key={item.habitId} gap="xs" align="center">
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: `var(--mantine-color-${item.color.replace('.', '-')})`,
                }}
              />
              <Text size="sm">
                {item.name} ({formatDuration(item.value)},{' '}
                {((item.value / totalDuration) * 100).toFixed(1)}%)
              </Text>
            </Group>
          ))}
        </Stack>
      </Stack>
    </Card>
  )
}

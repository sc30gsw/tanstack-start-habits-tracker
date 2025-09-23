import { Card, Fieldset, Group, Radio, Stack, Text } from '@mantine/core'
import dayjs from 'dayjs'
import { HabitHeatmap } from '~/features/habits/components/habit-heatmap'
import type { RecordEntity } from '~/features/habits/types/habit'

type HeatmapSectionProps = {
  records: RecordEntity[]
  selectedDate: Date | null
  metric: 'duration' | 'completion'
  onMetricChange: (metric: 'duration' | 'completion') => void
  onSelectDate: (date: Date) => void
}

export function HeatmapSection({
  records,
  selectedDate,
  metric,
  onMetricChange,
  onSelectDate,
}: HeatmapSectionProps) {
  return (
    <Card withBorder padding="lg">
      <Stack gap="md">
        <Text size="lg" fw={500}>
          年間ヒートマップ
        </Text>
        <Fieldset legend="表示指標" style={{ border: 'none', padding: 0 }}>
          <Radio.Group value={metric} onChange={(v: any) => onMetricChange(v)}>
            <Group gap="sm">
              <Radio value="duration" label="時間 (分)" />
              <Radio value="completion" label="達成状況" />
            </Group>
          </Radio.Group>
        </Fieldset>
        <HabitHeatmap
          records={records}
          onSelectDate={(date) => {
            onSelectDate(dayjs(date).toDate())
          }}
          selectedDate={selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : null}
          metric={metric}
        />
      </Stack>
    </Card>
  )
}

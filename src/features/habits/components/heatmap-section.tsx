import {
  Box,
  Card,
  Fieldset,
  Group,
  Radio,
  Stack,
  Text,
  useComputedColorScheme,
} from '@mantine/core'
import { IconChartBar, IconCheckbox, IconClock } from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { HabitHeatmap } from '~/features/habits/components/chart/habit-heatmap'
import type { RecordEntity } from '~/features/habits/types/habit'
import type { HabitColor } from '~/features/habits/types/schemas/habit-schemas'
import { getValidatedDate, type SearchParams } from '~/features/habits/types/schemas/search-params'

type HeatmapSectionProps = {
  records: RecordEntity[]
  habitColor?: HabitColor
}

export function HeatmapSection({ records, habitColor = 'blue' }: HeatmapSectionProps) {
  const apiRoute = getRouteApi('/habits/$habitId')
  const searchParams = apiRoute.useSearch()
  const selectedDate = getValidatedDate(searchParams?.selectedDate)
  const metric = searchParams.metric ?? 'duration'

  const navigate = apiRoute.useNavigate()

  const computedColorScheme = useComputedColorScheme('light')
  const titleColor = computedColorScheme === 'dark' ? 'gray.1' : 'dark.8'

  return (
    <Card withBorder padding="lg" radius="md" shadow="sm">
      <Stack gap="md">
        <Group gap="xs" align="center">
          <IconChartBar size={24} color="var(--mantine-color-blue-6)" />
          <Text size="lg" fw={600} c={titleColor}>
            年間ヒートマップ
          </Text>
        </Group>

        <Fieldset
          legend="表示指標"
          style={{
            border: '1px solid var(--mantine-color-gray-3)',
            borderRadius: '8px',
            padding: '12px',
          }}
        >
          <Radio.Group
            value={metric}
            onChange={(v) => {
              navigate({
                search: (prev) => ({
                  ...prev,
                  metric: v as SearchParams['metric'],
                }),
              })
            }}
          >
            <Group gap="lg">
              <Radio
                value="duration"
                label={
                  <Group gap="xs" align="center">
                    <IconClock size={16} color="var(--mantine-color-blue-5)" />
                    <Text size="sm">時間 (分)</Text>
                  </Group>
                }
              />
              <Radio
                value="completion"
                label={
                  <Group gap="xs" align="center">
                    <IconCheckbox size={16} color="var(--mantine-color-green-5)" />
                    <Text size="sm">達成状況</Text>
                  </Group>
                }
              />
            </Group>
          </Radio.Group>
        </Fieldset>

        <Box
          p="xs"
          style={{
            borderRadius: '8px',
            backgroundColor: 'var(--mantine-color-gray-0)',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            overflow: 'auto',
          }}
        >
          <HabitHeatmap
            records={records}
            onSelectDate={(date) => {
              navigate({
                search: (prev) => ({
                  ...prev,
                  selectedDate: dayjs(date).format('YYYY-MM-DD'),
                }),
              })
            }}
            selectedDate={selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : null}
            metric={metric}
            habitColor={habitColor}
          />
        </Box>
      </Stack>
    </Card>
  )
}

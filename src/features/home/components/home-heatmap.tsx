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
import { useMemo } from 'react'
import { groupBy, mapValues, pipe } from 'remeda'
import { HabitHeatmap } from '~/features/habits/components/chart/habit-heatmap'
import type { RecordEntity } from '~/features/habits/types/habit'
import type { SearchParams } from '~/features/habits/types/schemas/search-params'

export function HomeHeatmap({ records }: Record<'records', RecordEntity[]>) {
  const apiRoute = getRouteApi('/')
  const searchParams = apiRoute.useSearch()
  const metric = searchParams.metric ?? 'duration'

  const navigate = apiRoute.useNavigate()

  const computedColorScheme = useComputedColorScheme('light')
  const titleColor = computedColorScheme === 'dark' ? 'gray.1' : 'dark.8'

  // 全習慣の記録を集約したヒートマップデータを作成
  const aggregatedRecords = useMemo(() => {
    // completedのみをフィルタリング
    const completedRecords = records.filter((record) => record.status === 'completed')

    return pipe(
      completedRecords,
      // 日付でグループ化
      groupBy((record) => record.date),
      // 各日付のデータを集約
      mapValues((dateRecords) => {
        const completed = dateRecords.length // completedのみなのでlengthで十分
        const duration = dateRecords.reduce((sum, r) => sum + (r.duration_minutes || 0), 0)

        return {
          id: `aggregated-${dateRecords[0].date}`,
          habitId: 'aggregated',
          date: dateRecords[0].date,
          status: 'completed' as const, // completedのみなので固定
          duration_minutes: metric === 'duration' ? duration : completed,
          notes: null,
          recoveryDate: null,
          created_at: new Date(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: 'aggregated',
        } as const satisfies RecordEntity
      }),
      // オブジェクトから配列に変換
      Object.values,
    )
  }, [records, metric])

  return (
    <Card withBorder padding="lg" radius="md" shadow="sm">
      <Stack gap="md">
        <Group gap="xs" align="center">
          <IconChartBar size={24} color="var(--mantine-color-blue-6)" />
          <Text size="lg" fw={600} c={titleColor}>
            全習慣の年間活動
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
            records={aggregatedRecords}
            onSelectDate={(date) => {
              navigate({
                search: (prev) => ({
                  ...prev,
                  selectedDate: date,
                }),
              })
            }}
            selectedDate={searchParams?.selectedDate || null}
            metric={metric}
            habitColor="blue"
          />
        </Box>
      </Stack>
    </Card>
  )
}

import { Group, Paper, Select, Stack, Text, useComputedColorScheme } from '@mantine/core'
import { getRouteApi } from '@tanstack/react-router'
import { useId, useMemo } from 'react'
import type { HabitEntity, RecordEntity } from '~/features/habits/types/habit'
import type { SearchParams } from '~/features/habits/types/schemas/search-params'

export function HabitPriorityFilterPaper({
  habitsWithRecords,
}: Record<
  'habitsWithRecords',
  { habit: HabitEntity; record: RecordEntity; isCompleted: boolean }[]
>) {
  const routeApi = getRouteApi('/')
  const searchParams = routeApi.useSearch()
  const navigate = routeApi.useNavigate()

  const filterId = useId()

  const completionStats = useMemo(() => {
    const completed = habitsWithRecords.filter((h) => h.isCompleted).length
    const total = habitsWithRecords.length
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0

    return { completed, total, rate }
  }, [habitsWithRecords])

  const computedColorScheme = useComputedColorScheme('light')

  return (
    <Paper
      id={filterId}
      withBorder
      radius="sm"
      p="sm"
      bg={computedColorScheme === 'dark' ? 'dark.6' : 'gray.1'}
    >
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Text size="sm" c="dimmed">
            優先度フィルタ
          </Text>
          <Select
            size="xs"
            w={140}
            value={searchParams.habitFilter ?? 'all'}
            onChange={(value) =>
              navigate({
                search: {
                  ...searchParams,
                  habitFilter: value as SearchParams['habitFilter'],
                },
                hash: filterId,
              })
            }
            data={[
              { value: 'all', label: '全て' },
              { value: 'high', label: '高' },
              { value: 'middle', label: '中' },
              { value: 'low', label: '低' },
              { value: 'null', label: '優先度なし' },
            ]}
          />
        </Group>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            完了率 ({completionStats.completed}/{completionStats.total})
          </Text>
          <Text size="sm" fw={600} c={completionStats.rate === 100 ? 'green.6' : 'blue.6'}>
            {completionStats.rate}%
          </Text>
        </Group>
      </Stack>
    </Paper>
  )
}

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
  // 優先度フィルタ用のstate
  const routeApi = getRouteApi('/')
  const searchParams = routeApi.useSearch()
  const navigate = routeApi.useNavigate()

  // 一意なIDを生成
  const filterId = useId()

  // 優先度別の完了率を計算
  const completionStats = useMemo(() => {
    const filterByPriority = (priority: SearchParams['habitFilter']) => {
      if (priority === 'all') {
        return habitsWithRecords
      }

      return habitsWithRecords.filter((h) => {
        if (priority === null) {
          return h.habit.priority === null
        }
        return h.habit.priority === priority
      })
    }

    const filtered = filterByPriority(searchParams.habitFilter ?? 'all')
    const completed = filtered.filter((h) => h.isCompleted).length
    const total = filtered.length
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0

    return { completed, total, rate }
  }, [habitsWithRecords, searchParams.habitFilter])

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
                  habitFilter: value === 'all' ? undefined : (value as SearchParams['habitFilter']),
                },
                hash: filterId,
                hashScrollIntoView: true,
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

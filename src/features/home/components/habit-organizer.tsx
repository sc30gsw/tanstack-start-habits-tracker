import { Group, Radio, Select, Stack, TextInput, Title } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'
import { type ComponentProps, useRef, useState } from 'react'
import { funnel } from 'remeda'
import type { SearchParams } from '~/features/habits/types/schemas/search-params'

export function HabitOrganizer() {
  return (
    <Stack gap="md">
      <HabitSearch />
      <Group gap="xl" align="flex-start">
        <HabitOrder />
        <HabitFilter />
      </Group>
    </Stack>
  )
}

function HabitSearch() {
  const routeApi = getRouteApi('/habits/')
  const navigate = routeApi.useNavigate()
  const searchParams = routeApi.useSearch()
  const [searchValue, setSearchValue] = useState(searchParams.q || '')

  const debouncerRef = useRef(
    funnel(
      (value: string) => {
        navigate({
          to: '.',
          search: { ...searchParams, q: value },
        })
      },
      {
        minQuietPeriodMs: 300,
        reducer: (_, value: string) => {
          return value
        },
      },
    ),
  )

  const handleSearchChange: ComponentProps<typeof TextInput>['onChange'] = (e) => {
    const value = e.target.value
    setSearchValue(value)

    debouncerRef.current.call(value)
  }

  return (
    <TextInput
      placeholder="習慣を検索..."
      leftSection={<IconSearch size={16} />}
      value={searchValue}
      onChange={handleSearchChange}
    />
  )
}

function HabitOrder() {
  const routeApi = getRouteApi('/habits/')
  const navigate = routeApi.useNavigate()
  const searchParams = routeApi.useSearch()

  return (
    <Stack gap="xs">
      <Title order={5}>並び順</Title>
      <Radio.Group
        value={searchParams.habitSort}
        onChange={(value) =>
          navigate({
            to: '.',
            search: { ...searchParams, habitSort: value as SearchParams['habitSort'] },
          })
        }
      >
        <Stack gap="xs">
          <Radio value="all" label="全て表示" />
          <Radio value="priority" label="優先度順" />
        </Stack>
      </Radio.Group>
    </Stack>
  )
}

function HabitFilter() {
  const routeApi = getRouteApi('/habits/')
  const navigate = routeApi.useNavigate()
  const searchParams = routeApi.useSearch()

  return (
    <Stack gap="xs">
      <Title order={5}>フィルタ</Title>
      <Select
        value={searchParams.habitFilter}
        onChange={(value) =>
          navigate({
            to: '.',
            search: {
              ...searchParams,
              habitFilter: value as SearchParams['habitFilter'],
            },
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
    </Stack>
  )
}

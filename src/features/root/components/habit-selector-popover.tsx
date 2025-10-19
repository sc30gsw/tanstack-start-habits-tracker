import {
  Badge,
  Button,
  Group,
  Paper,
  Popover,
  ScrollArea,
  Select,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core'
import { IconListDetails, IconSearch } from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'
import { type ComponentProps, useRef, useState } from 'react'
import { funnel } from 'remeda'
import type { SearchParams } from '~/features/habits/types/schemas/search-params'

const PRIORITY_COLOR = {
  high: 'red',
  middle: 'yellow',
  low: 'blue',
  null: 'gray',
} as const satisfies Record<string, string>

const PRIORITY_LABEL = {
  high: '高',
  middle: '中',
  low: '低',
  null: '-',
} as const satisfies Record<string, string>

export function HabitSelectorPopover() {
  const [opened, setOpened] = useState(false)

  const routeApi = getRouteApi('__root__')
  const navigate = routeApi.useNavigate()
  const { habits } = routeApi.useLoaderData()
  const search = routeApi.useSearch()

  const habitsList = habits || []

  const [searchValue, setSearchValue] = useState(search.habitSelectorQuery || '')

  const debouncerRef = useRef(
    funnel(
      (value: string) => {
        navigate({
          search: (prev) => ({ ...prev, habitSelectorQuery: value }),
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

  const searchQuery = search.habitSelectorQuery || ''

  const filteredHabits = habitsList.filter((habit) =>
    habit.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filterValue = search.habitSelectorFilter || 'all'
  const filteredByPriority = filteredHabits.filter((habit) => {
    if (filterValue === 'all') {
      return true
    }

    return habit.priority === filterValue
  })

  return (
    <>
      {/* デスクトップ版 */}
      <Popover
        width={380}
        position="bottom"
        shadow="xl"
        opened={opened}
        onChange={setOpened}
        offset={8}
        withArrow
        arrowSize={12}
        closeOnClickOutside={false}
        transitionProps={{ transition: 'pop', duration: 200 }}
      >
        <Popover.Target>
          <Button
            variant="subtle"
            size="sm"
            onClick={() => setOpened((o) => !o)}
            leftSection={<IconListDetails size={16} />}
            visibleFrom="sm"
          >
            習慣詳細
          </Button>
        </Popover.Target>

        <Popover.Dropdown p={0} style={{ border: '1px solid var(--mantine-color-gray-3)' }}>
          <Stack gap={0}>
            <Stack
              p="md"
              pb="xs"
              gap="xs"
              style={{
                borderBottom: '1px solid var(--mantine-color-gray-2)',
                backgroundColor: 'var(--mantine-color-gray-0)',
              }}
            >
              <Text size="sm" fw={600} c="dark">
                習慣詳細
              </Text>
              <TextInput
                placeholder="習慣を検索..."
                leftSection={<IconSearch size={16} />}
                value={searchValue}
                onChange={handleSearchChange}
                size="xs"
              />
              <Select
                label="優先度で絞り込み"
                placeholder="優先度を選択"
                value={search.habitSelectorFilter || 'all'}
                onChange={(value) =>
                  navigate({
                    search: (prev) => ({
                      ...prev,
                      habitSelectorFilter: value as SearchParams['habitSelectorFilter'],
                    }),
                  })
                }
                data={[
                  { value: 'all', label: 'すべて表示' },
                  { value: 'high', label: '高' },
                  { value: 'middle', label: '中' },
                  { value: 'low', label: '低' },
                ]}
                size="xs"
                clearable={false}
              />
            </Stack>

            <ScrollArea h={450} type="auto">
              {filteredByPriority.length === 0 ? (
                <Stack p="md" align="center" gap="xs">
                  <IconListDetails size={48} style={{ opacity: 0.3 }} />
                  <Text size="sm" c="dimmed" ta="center">
                    {habitsList.length === 0
                      ? '習慣が登録されていません'
                      : searchQuery
                        ? '習慣が見つかりません'
                        : '習慣がありません'}
                  </Text>
                  {habitsList.length === 0 && (
                    <Text size="xs" c="dimmed" ta="center" mt="xs">
                      習慣一覧ページから新しい習慣を作成してください
                    </Text>
                  )}
                </Stack>
              ) : (
                <Stack gap="xs" p="sm">
                  {filteredByPriority.map((habit) => (
                    <Paper
                      key={habit.id}
                      p="sm"
                      withBorder
                      radius="md"
                      style={{
                        borderColor: 'var(--mantine-color-gray-3)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-0)'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                      onClick={() => {
                        navigate({
                          to: '/habits/$habitId',
                          params: { habitId: habit.id },
                        })
                        setOpened(false)
                      }}
                    >
                      <Stack gap="xs">
                        <Group justify="space-between" align="flex-start" wrap="nowrap">
                          <Text size="sm" fw={600} lineClamp={1} style={{ flex: 1 }}>
                            {habit.name}
                          </Text>
                          <Badge
                            size="sm"
                            color={PRIORITY_COLOR[habit.priority ?? 'null']}
                            variant="light"
                          >
                            {PRIORITY_LABEL[habit.priority ?? 'null']}
                          </Badge>
                        </Group>

                        {habit.description && (
                          <Text size="xs" c="dimmed" lineClamp={2}>
                            {habit.description}
                          </Text>
                        )}
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}
            </ScrollArea>
          </Stack>
        </Popover.Dropdown>
      </Popover>

      {/* モバイル版 */}
      <Popover
        width={320}
        position="bottom"
        shadow="xl"
        opened={opened}
        onChange={setOpened}
        offset={8}
        withArrow
        arrowSize={12}
        closeOnClickOutside={false}
        transitionProps={{ transition: 'pop', duration: 200 }}
      >
        <Popover.Target>
          <Tooltip label="習慣詳細" withArrow>
            <Button variant="light" size="xs" onClick={() => setOpened((o) => !o)} hiddenFrom="sm">
              <IconListDetails size={16} />
            </Button>
          </Tooltip>
        </Popover.Target>

        <Popover.Dropdown p={0} style={{ border: '1px solid var(--mantine-color-gray-3)' }}>
          <Stack gap={0}>
            <Stack
              p="md"
              pb="xs"
              gap="xs"
              style={{
                borderBottom: '1px solid var(--mantine-color-gray-2)',
                backgroundColor: 'var(--mantine-color-gray-0)',
              }}
            >
              <Text size="sm" fw={600} c="dark">
                習慣詳細
              </Text>
              <TextInput
                placeholder="習慣を検索..."
                leftSection={<IconSearch size={16} />}
                value={searchValue}
                onChange={handleSearchChange}
                size="xs"
              />
              <Select
                label="優先度で絞り込み"
                placeholder="優先度を選択"
                value={search.habitSelectorFilter || 'all'}
                onChange={(value) =>
                  navigate({
                    search: (prev) => ({
                      ...prev,
                      habitSelectorFilter: value as SearchParams['habitSelectorFilter'],
                    }),
                  })
                }
                data={[
                  { value: 'all', label: 'すべて表示' },
                  { value: 'high', label: '高' },
                  { value: 'middle', label: '中' },
                  { value: 'low', label: '低' },
                ]}
                size="xs"
                clearable={false}
              />
            </Stack>

            <ScrollArea h={400} type="auto">
              {filteredByPriority.length === 0 ? (
                <Stack p="md" align="center" gap="xs">
                  <IconListDetails size={48} style={{ opacity: 0.3 }} />
                  <Text size="sm" c="dimmed" ta="center">
                    {habitsList.length === 0
                      ? '習慣が登録されていません'
                      : searchQuery
                        ? '習慣が見つかりません'
                        : '習慣がありません'}
                  </Text>
                  {habitsList.length === 0 && (
                    <Text size="xs" c="dimmed" ta="center" mt="xs">
                      習慣一覧ページから新しい習慣を作成してください
                    </Text>
                  )}
                </Stack>
              ) : (
                <Stack gap="xs" p="sm">
                  {filteredByPriority.map((habit) => (
                    <Paper
                      key={habit.id}
                      p="sm"
                      withBorder
                      radius="md"
                      style={{
                        borderColor: 'var(--mantine-color-gray-3)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onClick={() => {
                        navigate({
                          to: '/habits/$habitId',
                          params: { habitId: habit.id },
                        })
                        setOpened(false)
                      }}
                    >
                      <Stack gap="xs">
                        <Group justify="space-between" align="flex-start" wrap="nowrap">
                          <Text size="sm" fw={600} lineClamp={1} style={{ flex: 1 }}>
                            {habit.name}
                          </Text>
                          <Badge
                            size="sm"
                            color={PRIORITY_COLOR[habit.priority ?? 'null']}
                            variant="light"
                          >
                            {PRIORITY_LABEL[habit.priority ?? 'null']}
                          </Badge>
                        </Group>

                        {habit.description && (
                          <Text size="xs" c="dimmed" lineClamp={2}>
                            {habit.description}
                          </Text>
                        )}
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}
            </ScrollArea>
          </Stack>
        </Popover.Dropdown>
      </Popover>
    </>
  )
}

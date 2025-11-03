import { ActionIcon, Box, Card, Flex, Group, Stack, Text } from '@mantine/core'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { getValidatedDate } from '~/features/habits/types/schemas/search-params'
import { HomeCalendarPresetsCombobox } from '~/features/home/components/calendar/home-calendar-presets-combobox'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

export function HomeDayView() {
  const apiRoute = getRouteApi('/')
  const navigate = useNavigate({ from: '/' })
  const searchParams = apiRoute.useSearch()
  const selectedDate = getValidatedDate(searchParams?.selectedDate)
  const { records } = apiRoute.useLoaderData()

  const currentDate = selectedDate ? dayjs(selectedDate).tz('Asia/Tokyo') : dayjs().tz('Asia/Tokyo')
  const formattedDate = currentDate.format('YYYY/MM/DD (ddd)')

  const dateString = currentDate.format('YYYY-MM-DD')
  const completedRecords =
    records.data?.filter((r) => r.date === dateString && r.status === 'completed') ?? []

  const handlePrevDay = () => {
    const newDate = currentDate.subtract(1, 'day')

    navigate({
      search: (prev) => ({
        ...prev,
        selectedDate: newDate.format('YYYY-MM-DD'),
        preset: undefined,
      }),
    })
  }

  const handleNextDay = () => {
    const newDate = currentDate.add(1, 'day')

    navigate({
      search: (prev) => ({
        ...prev,
        selectedDate: newDate.format('YYYY-MM-DD'),
        preset: undefined,
      }),
    })
  }

  return (
    <Stack gap={8}>
      <HomeCalendarPresetsCombobox />

      <Group justify="space-between" mb={4}>
        <ActionIcon variant="subtle" aria-label="前日" onClick={handlePrevDay}>
          <IconChevronLeft size={16} />
        </ActionIcon>
        <Text fw={500} size="sm">
          {formattedDate}
        </Text>
        <ActionIcon variant="subtle" aria-label="翌日" onClick={handleNextDay}>
          <IconChevronRight size={16} />
        </ActionIcon>
      </Group>

      <Card withBorder padding="sm">
        <Stack gap={4}>
          {completedRecords.length > 0 ? (
            <Stack gap={4}>
              <Text size="xs" c="dimmed" fw={500}>
                完了した習慣 ({completedRecords.length}件)
              </Text>
              <Stack gap={2}>
                {completedRecords.map((record) => (
                  <Flex
                    key={record.id}
                    gap={6}
                    align="center"
                    style={{
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      w={4}
                      h={18}
                      style={{
                        backgroundColor: `var(--mantine-color-${record.habit?.color ?? 'blue'}-6)`,
                        borderRadius: '2px',
                        flexShrink: 0,
                      }}
                    />
                    <Text
                      size="sm"
                      ta="left"
                      style={{
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {record.habit?.name}
                    </Text>
                  </Flex>
                ))}
              </Stack>
            </Stack>
          ) : (
            <Text size="sm" c="dimmed" ta="center">
              完了した習慣はありません
            </Text>
          )}
        </Stack>
      </Card>
    </Stack>
  )
}

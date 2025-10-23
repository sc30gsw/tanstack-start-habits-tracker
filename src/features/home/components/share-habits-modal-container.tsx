import { Box, Group, Skeleton, Stack, Text, useComputedColorScheme } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { GET_COMPLETED_HABITS_FOR_SHARE_CACHE_KEY } from '~/constants/cache-key'
import { ShareHabitsModalContents } from '~/features/home/components/share-habits-modal-contents'
import { shareDto } from '~/features/home/server/share-functions'

function LoadingSkeleton() {
  const computedColorScheme = useComputedColorScheme('light')

  return (
    <Stack gap="lg">
      {/* Header with date and total */}
      <Group justify="space-between" align="center">
        <Skeleton height={28} width={280} radius="sm" />
        <Skeleton height={24} width={120} radius="sm" />
      </Group>

      {/* Tab Navigation */}
      <Box
        style={{
          backgroundColor:
            computedColorScheme === 'dark'
              ? 'var(--mantine-color-dark-6)'
              : 'var(--mantine-color-gray-0)',
          padding: '4px',
          borderRadius: '8px',
        }}
      >
        <Group gap="xs">
          <Skeleton height={40} style={{ flex: 1 }} radius="md" />
          <Skeleton height={40} style={{ flex: 1 }} radius="md" />
        </Group>
      </Box>

      {/* Habit Cards */}
      <Stack gap="md">
        {[1, 2, 3].map((i) => (
          <Box
            key={i}
            style={{
              backgroundColor:
                computedColorScheme === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.02)',
              borderRadius: '8px',
              padding: '12px 16px',
              border:
                computedColorScheme === 'dark'
                  ? '1px solid var(--mantine-color-dark-4)'
                  : '1px solid var(--mantine-color-gray-2)',
            }}
          >
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Stack gap="xs" style={{ flex: 1 }}>
                <Skeleton height={20} width="60%" radius="sm" />
                <Skeleton height={16} width="80%" radius="sm" />
                <Skeleton height={16} width="70%" radius="sm" />
              </Stack>
              <Skeleton height={28} width={20} />
            </Group>
          </Box>
        ))}
      </Stack>
    </Stack>
  )
}

function ErrorDisplay({ error }: { error?: string }) {
  const computedColorScheme = useComputedColorScheme('light')

  return (
    <Stack gap="lg" align="center" py="xl">
      <Box
        style={{
          backgroundColor:
            computedColorScheme === 'dark' ? 'rgba(250, 82, 82, 0.1)' : 'rgba(250, 82, 82, 0.05)',
          padding: '24px',
          borderRadius: '12px',
          border:
            computedColorScheme === 'dark'
              ? '1px solid rgba(250, 82, 82, 0.3)'
              : '1px solid rgba(250, 82, 82, 0.2)',
          textAlign: 'center',
        }}
      >
        <Stack gap="md" align="center">
          <IconAlertCircle size={48} color="var(--mantine-color-red-6)" />
          <Stack gap="xs">
            <Text size="lg" fw={600} c="red.6">
              データの取得に失敗しました
            </Text>
            <Text size="sm" c="dimmed">
              {error || 'しばらく時間をおいて再度お試しください'}
            </Text>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  )
}

export function ShareHabitsModalContainer() {
  const routeApi = getRouteApi('/')
  const searchParams = routeApi.useSearch()

  const today = dayjs().format('YYYY-MM-DD')
  const selectedDate = searchParams.selectedDate ?? today

  const open = searchParams.open

  const { data: shareDataResponse, isLoading } = useQuery({
    queryKey: [GET_COMPLETED_HABITS_FOR_SHARE_CACHE_KEY, selectedDate],
    queryFn: () => shareDto.getCompletedHabitsForShare({ data: { date: selectedDate } }),
    enabled: open ?? false,
  })

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (shareDataResponse?.error || !shareDataResponse?.data) {
    return <ErrorDisplay error={shareDataResponse?.error} />
  }

  return <ShareHabitsModalContents shareHabits={shareDataResponse.data} />
}

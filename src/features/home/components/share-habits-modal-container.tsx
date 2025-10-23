import { Group, Skeleton, Stack, Text } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { GET_COMPLETED_HABITS_FOR_SHARE_CACHE_KEY } from '~/constants/cache-key'
import { ShareHabitsModalContents } from '~/features/home/components/share-habits-modal-contents'
import { shareDto } from '~/features/home/server/share-functions'

function LoadingSkeleton() {
  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Skeleton height={28} width={300} />
        <Skeleton height={24} width={100} />
      </Group>

      <Skeleton height={40} radius="md" />

      <Stack gap="md">
        <Skeleton height={120} radius="md" />
        <Skeleton height={120} radius="md" />
        <Skeleton height={120} radius="md" />
      </Stack>
    </Stack>
  )
}

function ErrorDisplay({ error }: { error?: string }) {
  return <Text c="red">データの取得中にエラーが発生しました: {error || '不明なエラー'}</Text>
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

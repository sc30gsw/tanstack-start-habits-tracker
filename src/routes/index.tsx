import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { IconChartLine, IconCheck, IconCloudUpload, IconEdit, IconShare } from '@tabler/icons-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import 'dayjs/locale/ja'
import { useId } from 'react'
import { habitDto } from '~/features/habits/server/habit-functions'
import { recordDto } from '~/features/habits/server/record-functions'
import { searchSchema } from '~/features/habits/types/schemas/search-params'
import { getDataFetchDateRange } from '~/features/habits/utils/completion-rate-utils'
import { DailyHabitList } from '~/features/home/components/daily-habit-list'
import { HomeBadgeCollection } from '~/features/home/components/home-badge-collection'
import { HomeCalendarView } from '~/features/home/components/home-calendar-view'
import { HomeHeatmapView } from '~/features/home/components/home-heatmap-view'
import { HomeOverallLevelCard } from '~/features/home/components/home-overall-level-card'
import { ShareHabitsModal } from '~/features/home/components/share-habits-modal'
import { homeLevelInfoDto } from '~/features/home/server/home-level-functions'
import { shareDto } from '~/features/home/server/share-functions'

dayjs.locale('ja')

export const Route = createFileRoute('/')({
  validateSearch: searchSchema,
  component: Home,
  beforeLoad: async ({ search }) => {
    return { search }
  },
  loader: async ({ context }) => {
    const today = dayjs().format('YYYY-MM-DD')
    const selectedDate = context.search.selectedDate ?? today

    // ヒートマップ(今日から1年分) + カレンダーグリッド(42日分)の範囲を取得
    const { dateFrom, dateTo } = getDataFetchDateRange(context.search.currentMonth)

    const [habitsResult, recordsResult, shareDataResult, homeAggregatedLevel] = await Promise.all([
      habitDto.getHabits(),
      recordDto.getRecords({
        data: {
          date_from: dateFrom,
          date_to: dateTo,
        },
      }),
      shareDto.getCompletedHabitsForShare({ data: { date: selectedDate } }),
      homeLevelInfoDto.getHomeAggregatedLevel(),
    ])

    return {
      habits: habitsResult,
      records: recordsResult,
      shareData: shareDataResult,
      homeAggregatedLevel,
    }
  },
})

function Home() {
  const { habits, records } = Route.useLoaderData()
  const navigate = Route.useNavigate()
  const searchParams = Route.useSearch()

  const today = dayjs().format('YYYY-MM-DD')
  // 選択された日付を取得（未選択の場合は今日）
  const selectedDate = searchParams.selectedDate ?? today

  const totalHabits = habits.success ? (habits.data?.length ?? 0) : 0
  const totalRecords = records.success ? (records.data?.length ?? 0) : 0

  // 選択された日付の完了数を計算
  const completedOnSelectedDate = records.success
    ? (records.data?.filter((r) => r.date === selectedDate && r.status === 'completed').length ?? 0)
    : 0

  const copyId = useId()

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="sm">
            Track - 習慣追跡アプリ
          </Title>
          <Text size="lg" c="dimmed">
            日々の習慣を記録し、継続状況を可視化しましょう
          </Text>
        </div>

        <Group gap="lg">
          <Card withBorder padding="lg" style={{ flex: 1, minHeight: '100px' }}>
            <Text c="dimmed" size="sm" mb="xs">
              登録習慣数
            </Text>
            <Text size="xl" fw={700}>
              {totalHabits}
            </Text>
          </Card>

          <Card withBorder padding="lg" style={{ flex: 1, minHeight: '100px' }}>
            <Text c="dimmed" size="sm" mb="xs">
              総記録数
            </Text>
            <Text size="xl" fw={700}>
              {totalRecords}
            </Text>
          </Card>

          <Card withBorder padding="lg" style={{ flex: 1, minHeight: '100px' }}>
            <Text
              c="dimmed"
              size="sm"
              mb="xs"
              lineClamp={2}
              title={
                selectedDate === today
                  ? '今日の完了数'
                  : `${dayjs(selectedDate).format('YYYY年M月D日')}の完了数`
              }
            >
              {selectedDate === today
                ? '今日の完了数'
                : `${dayjs(selectedDate).format('YYYY/M/D')}の完了数`}
            </Text>
            <Text size="xl" fw={700} c="green">
              {completedOnSelectedDate}
            </Text>
          </Card>
        </Group>

        <Card withBorder padding="lg">
          <Stack gap="md">
            <Text size="lg" fw={500}>
              今日の習慣を記録しましょう
            </Text>
            <Group gap="md">
              <Button component={Link} to="/habits" size="lg">
                習慣管理
              </Button>
              {totalHabits > 0 && (
                <Badge variant="light" color="blue" size="lg">
                  {totalHabits}つの習慣が登録済み
                </Badge>
              )}
            </Group>
          </Stack>
        </Card>

        <HomeOverallLevelCard />
        <HomeBadgeCollection />

        <HomeCalendarView />

        <HomeHeatmapView />

        <Card withBorder padding="lg">
          <Stack gap="lg">
            <Group justify="space-between" align="center">
              <Box>
                <Text size="xl" fw={600}>
                  {selectedDate === today
                    ? '今日の完了習慣'
                    : `${dayjs(selectedDate).format('M月D日')}の完了習慣`}
                </Text>
                {completedOnSelectedDate > 0 && (
                  <Text size="xs" c="dimmed" mt={4}>
                    {completedOnSelectedDate}件の習慣を完了しました
                  </Text>
                )}
              </Box>
              {completedOnSelectedDate > 0 && (
                <Button
                  id={copyId}
                  variant="gradient"
                  gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                  size="sm"
                  leftSection={<IconShare size={16} />}
                  onClick={() => {
                    navigate({
                      search: (prev) => ({ ...prev, open: true }),
                      hash: copyId,
                      hashScrollIntoView: true,
                    })
                  }}
                  styles={{
                    root: {
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      },
                    },
                  }}
                >
                  共有
                </Button>
              )}
            </Group>
            <Divider />

            <DailyHabitList />
          </Stack>
        </Card>

        <Card withBorder padding="lg">
          <Stack gap="sm">
            <Text size="lg" fw={500}>
              主な機能
            </Text>
            <Stack gap="xs">
              <Group gap="xs" align="flex-start">
                <IconEdit size={20} color="var(--mantine-color-blue-6)" />
                <Text>
                  <strong>習慣管理:</strong> 新しい習慣を作成・編集・削除
                </Text>
              </Group>
              <Group gap="xs" align="flex-start">
                <IconCheck size={20} color="var(--mantine-color-green-6)" />
                <Text>
                  <strong>日次記録:</strong> 習慣の実行状況と時間を記録
                </Text>
              </Group>
              <Group gap="xs" align="flex-start">
                <IconChartLine size={20} color="var(--mantine-color-violet-6)" />
                <Text>
                  <strong>可視化:</strong> ヒートマップとカレンダーで継続状況を確認
                </Text>
              </Group>
              <Group gap="xs" align="flex-start">
                <IconCloudUpload size={20} color="var(--mantine-color-teal-6)" />
                <Text>
                  <strong>自動保存:</strong> 記録は自動的にクラウドに保存
                </Text>
              </Group>
            </Stack>
          </Stack>
        </Card>
      </Stack>
      <ShareHabitsModal />
    </Container>
  )
}

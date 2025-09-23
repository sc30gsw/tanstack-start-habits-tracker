import { Badge, Button, Card, Container, Group, Stack, Text, Title } from '@mantine/core'
import { IconChartLine, IconCheck, IconCloudUpload, IconEdit } from '@tabler/icons-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { habitDto } from '~/features/habits/server/habit-functions'
import { recordDto } from '~/features/habits/server/record-functions'

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => {
    const [habitsResult, recordsResult] = await Promise.all([habitDto.getHabits(), recordDto.getRecords()])

    return {
      habits: habitsResult,
      records: recordsResult,
    }
  },
})

function Home() {
  const { habits, records } = Route.useLoaderData()

  const totalHabits = habits.success ? habits.data?.length || 0 : 0
  const totalRecords = records.success ? records.data?.length || 0 : 0
  const completedToday = records.success
    ? records.data?.filter((r) => r.date === new Date().toISOString().slice(0, 10) && r.completed)
        .length || 0
    : 0

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="sm">
            Trak - 習慣追跡アプリ
          </Title>
          <Text size="lg" c="dimmed">
            日々の習慣を記録し、継続状況を可視化しましょう
          </Text>
        </div>

        {/* 統計情報 */}
        <Group gap="lg">
          <Card withBorder padding="lg" style={{ flex: 1 }}>
            <Text c="dimmed" size="sm" mb="xs">
              登録習慣数
            </Text>
            <Text size="xl" fw={700}>
              {totalHabits}
            </Text>
          </Card>

          <Card withBorder padding="lg" style={{ flex: 1 }}>
            <Text c="dimmed" size="sm" mb="xs">
              総記録数
            </Text>
            <Text size="xl" fw={700}>
              {totalRecords}
            </Text>
          </Card>

          <Card withBorder padding="lg" style={{ flex: 1 }}>
            <Text c="dimmed" size="sm" mb="xs">
              今日の完了数
            </Text>
            <Text size="xl" fw={700} c="green">
              {completedToday}
            </Text>
          </Card>
        </Group>

        {/* アクション */}
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

        {/* 説明 */}
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
    </Container>
  )
}

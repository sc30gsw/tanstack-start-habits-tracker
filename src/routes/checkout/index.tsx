import { Badge, Button, Card, Container, Group, Stack, Text, Title } from '@mantine/core'
import { IconCheck } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { useTransition } from 'react'
import { authClient } from '~/lib/auth-client'

export const Route = createFileRoute('/checkout/')({
  component: CheckoutPage,
})

function CheckoutPage() {
  const navigate = Route.useNavigate()
  const { data: session } = authClient.useSession()

  const [isPending, startTransition] = useTransition()

  const handleCheckout = (slug: string) => {
    startTransition(async () => {
      if (!session) {
        navigate({ to: '/auth/sign-in' })
        return
      }

      try {
        await authClient.checkout({
          slug,
        })
      } catch (error) {
        console.error('Checkout failed:', error)
      }
    })
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="md">
            プランを選択
          </Title>
          <Text c="dimmed">あなたに最適なプランを選んでください</Text>
        </div>

        <Group grow align="stretch">
          {/* Free Plan */}
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="md" h="100%">
              <div>
                <Title order={3}>無料プラン</Title>
                <Text size="xl" fw={700} mt="xs">
                  ¥0
                  <Text component="span" size="sm" c="dimmed" fw={400}>
                    /月
                  </Text>
                </Text>
              </div>

              <Stack gap="xs" style={{ flex: 1 }}>
                <Group gap="xs">
                  <IconCheck size={16} />
                  <Text size="sm">基本的な習慣追跡</Text>
                </Group>
                <Group gap="xs">
                  <IconCheck size={16} />
                  <Text size="sm">最大7つの習慣</Text>
                </Group>
                <Group gap="xs">
                  <IconCheck size={16} />
                  <Text size="sm">基本的な統計</Text>
                </Group>
              </Stack>

              <Button variant="outline" disabled>
                現在のプラン
              </Button>
            </Stack>
          </Card>

          {/* Pro Plan */}
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="md" h="100%">
              <div>
                <Title order={3}>Proプラン</Title>
                <Text size="xl" fw={700} mt="xs">
                  $10
                  <Text component="span" size="sm" c="dimmed" fw={400}>
                    /月
                  </Text>
                </Text>
                <Badge color="green" variant="light" mt="xs">
                  1週間無料トライアル
                </Badge>
              </div>

              <Stack gap="xs" style={{ flex: 1 }}>
                <Group gap="xs">
                  <IconCheck size={16} />
                  <Text size="sm">無制限の習慣追跡</Text>
                </Group>
                <Group gap="xs">
                  <IconCheck size={16} />
                  <Text size="sm">高度な統計とヒートマップ</Text>
                </Group>
                <Group gap="xs">
                  <IconCheck size={16} />
                  <Text size="sm">カスタムリマインダー</Text>
                </Group>
                <Group gap="xs">
                  <IconCheck size={16} />
                  <Text size="sm">データエクスポート</Text>
                </Group>
              </Stack>

              <Button
                onClick={() => handleCheckout('pro')}
                disabled={isPending}
                fullWidth
                loading={isPending}
              >
                {session ? '無料トライアルを開始' : 'ログインしてトライアル開始'}
              </Button>
            </Stack>
          </Card>
        </Group>

        {!session && (
          <Text size="sm" c="dimmed" ta="center">
            プランを購入するには、まず
            <Button
              variant="subtle"
              size="compact-sm"
              onClick={() => navigate({ to: '/auth/sign-in' })}
            >
              ログイン
            </Button>
            してください
          </Text>
        )}
      </Stack>
    </Container>
  )
}

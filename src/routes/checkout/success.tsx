import { Button, Card, Container, Group, Stack, Text, Title } from '@mantine/core'
import { IconCheck, IconHome } from '@tabler/icons-react'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/checkout/success')({
  component: CheckoutSuccessPage,
  validateSearch: (search: Record<string, unknown>) => ({
    checkout_id: (search.checkout_id as string) || '',
  }),
})

function CheckoutSuccessPage() {
  const navigate = useNavigate()
  const { checkout_id } = useSearch({ from: '/checkout/success' })

  useEffect(() => {
    // Log checkout completion for analytics
    if (checkout_id) {
      console.log('Checkout completed:', checkout_id)
    }
  }, [checkout_id])

  return (
    <Container size="sm" py="xl">
      <Card shadow="md" padding="xl" radius="md" withBorder>
        <Stack align="center" gap="lg">
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'var(--mantine-color-green-0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconCheck size={48} color="var(--mantine-color-green-6)" />
          </div>

          <div style={{ textAlign: 'center' }}>
            <Title order={2} mb="xs">
              お支払いが完了しました！
            </Title>
            <Text c="dimmed">
              ご購入ありがとうございます。
              <br />
              Proプランの機能をご利用いただけます。
            </Text>
          </div>

          {checkout_id && (
            <Text size="sm" c="dimmed">
              注文ID: {checkout_id}
            </Text>
          )}

          <Group mt="md">
            <Button leftSection={<IconHome size={16} />} onClick={() => navigate({ to: '/' })}>
              ホームに戻る
            </Button>
            <Button variant="light" onClick={() => navigate({ to: '/customer/portal' })}>
              顧客ポータル
            </Button>
          </Group>
        </Stack>
      </Card>
    </Container>
  )
}

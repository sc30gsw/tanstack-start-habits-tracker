import { Button, Card, Container, Stack, Text, Title } from '@mantine/core'
import { IconExternalLink } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { authClient } from '~/lib/auth-client'

export const Route = createFileRoute('/customer/portal')({
  component: CustomerPortalPage,
})

function CustomerPortalPage() {
  const handleOpenPolarPortal = async () => {
    try {
      await authClient.customer.portal()
    } catch (error) {
      console.error('Failed to open portal:', error)
    }
  }

  return (
    <Container size="sm" py="xl">
      <Card shadow="md" padding="xl" radius="md" withBorder>
        <Stack align="center" gap="lg">
          <div style={{ textAlign: 'center' }}>
            <Title order={2} mb="xs">
              サブスクリプション管理
            </Title>
            <Text c="dimmed">
              サブスクリプションの確認、変更、キャンセルはPolar管理画面で行えます。
            </Text>
          </div>

          <Button
            size="lg"
            leftSection={<IconExternalLink size={20} />}
            onClick={handleOpenPolarPortal}
          >
            Polar管理画面を開く
          </Button>

          <Text size="sm" c="dimmed" ta="center" mt="md">
            Polar管理画面では以下の操作が可能です：
            <br />
            ・サブスクリプションの確認
            <br />
            ・支払い方法の変更
            <br />
            ・プランの変更・キャンセル
            <br />
            ・請求履歴の確認
          </Text>
        </Stack>
      </Card>
    </Container>
  )
}

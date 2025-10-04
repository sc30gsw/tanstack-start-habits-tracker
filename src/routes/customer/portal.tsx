import { Box, Card, Container, Skeleton, Stack, Text, Title } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { PortalButton } from '~/features/auth/components/portal-button'

export const Route = createFileRoute('/customer/portal')({
  component: CustomerPortalPage,
})

function CustomerPortalPage() {
  return (
    <Container size="sm" py="xl">
      <Card shadow="md" padding="xl" radius="md" withBorder>
        <Stack align="center" gap="lg">
          <Box style={{ textAlign: 'center' }}>
            <Title order={2} mb="xs">
              サブスクリプション管理
            </Title>
            <Text c="dimmed">
              サブスクリプションの確認、変更、キャンセルはPolar管理画面で行えます。
            </Text>
          </Box>

          <Suspense fallback={<Skeleton height={50} />}>
            <PortalButton />
          </Suspense>

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

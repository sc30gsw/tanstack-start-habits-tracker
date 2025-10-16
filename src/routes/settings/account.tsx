import { Card, Stack, Text, Title } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'
import { AccountDeleteButton } from '~/features/settings/components/account-delete-button'
import { SettingsLayout } from '~/features/settings/components/settings-layout'

export const Route = createFileRoute('/settings/account')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SettingsLayout>
      <Stack gap="lg">
        <Title order={2}>アカウント設定</Title>

        <Card withBorder padding="lg">
          <Stack gap="md">
            <div>
              <Text size="sm" fw={600} mb="xs">
                危険な操作
              </Text>
              <Text size="sm" c="dimmed" mb="md">
                アカウントを削除すると、すべてのデータが完全に削除されます。
                この操作は取り消すことができません。
              </Text>
            </div>

            <AccountDeleteButton />
          </Stack>
        </Card>
      </Stack>
    </SettingsLayout>
  )
}

import { Button, Container, Paper, Stack, Text, Title } from '@mantine/core'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { PasskeyRegister } from '~/features/auth/components/passkey-register'
import { getCurrentUserPasskey } from '~/features/auth/server/server-functions'
import { authClient } from '~/lib/auth-client'

export const Route = createFileRoute('/auth/passkey-setup')({
  beforeLoad: async ({ context }) => {
    if (!context.session) {
      throw redirect({ to: '/auth/sign-in' })
    }

    const result = await getCurrentUserPasskey()

    if (result.success && result.passkey) {
      throw redirect({ to: '/' })
    }

    return
  },
  component: PasskeySetupPage,
})

function PasskeySetupPage() {
  const navigate = Route.useNavigate()
  const { data: session } = authClient.useSession()

  return (
    <Container size={420} my={40}>
      <Title ta="center" fw={900}>
        Passkey 設定
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        より安全で便利なログインのためにPasskeyを設定しましょう
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Stack gap="md">
          <Text size="lg" fw={500} ta="center">
            {session?.user.name} さん、Passkeyを設定してみましょう！
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            Passkeyを設定すると、次回からパスワードなしでログインできます
          </Text>
          <PasskeyRegister />
          <Button onClick={() => navigate({ to: '/', search: { skip: true } })} variant="subtle">
            スキップしてホームへ
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}

import {
  Anchor,
  Button,
  Container,
  Divider,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { type UseFormReturnType, useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconBrandGithub } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { useTransition } from 'react'
import { authClient } from '~/lib/auth-client'

export const Route = createFileRoute('/auth/sign-up')({
  component: SignUpPage,
})

function SignUpPage() {
  const navigate = Route.useNavigate()

  const [isPending, startTransition] = useTransition()
  const [isGitHubPending, startGitHubTransition] = useTransition()

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
    },
    validate: {
      name: (value) => (value.length >= 2 ? null : '名前は2文字以上である必要があります'),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : '有効なメールアドレスを入力してください'),
      password: (value) => (value.length >= 6 ? null : 'パスワードは6文字以上である必要があります'),
    },
  })

  async function handleEmailSignUp(values: UseFormReturnType<typeof form.values>['values']) {
    startTransition(async () => {
      try {
        const { error } = await authClient.signUp.email({
          name: values.name,
          email: values.email,
          password: values.password,
        })

        if (error) {
          notifications.show({ color: 'red', message: error.message || '登録に失敗しました' })

          return
        }

        navigate({ to: '/auth/passkey-setup' })
      } catch {
        notifications.show({ color: 'red', message: '登録に失敗しました' })
      }
    })
  }

  async function handleGitHubSignUp() {
    startGitHubTransition(async () => {
      try {
        await authClient.signIn.social({
          provider: 'github',
          callbackURL: '/auth/passkey-setup',
        })
      } catch {
        notifications.show({ color: 'red', message: '登録に失敗しました' })
      }
    })
  }

  const isLoading = isPending || isGitHubPending

  return (
    <Container size={420} my={40}>
      <Title ta="center" fw={900}>
        新規登録
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        すでにアカウントをお持ちですか？{' '}
        <Anchor size="sm" component="a" href="/auth/sign-in">
          ログイン
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleEmailSignUp)}>
          <Stack gap="md">
            <TextInput
              label="名前"
              placeholder="山田太郎"
              required
              disabled={isLoading}
              {...form.getInputProps('name')}
            />

            <TextInput
              label="メールアドレス"
              placeholder="your@email.com"
              required
              type="email"
              disabled={isLoading}
              {...form.getInputProps('email')}
            />

            <PasswordInput
              label="パスワード"
              placeholder="パスワードを入力"
              required
              disabled={isLoading}
              {...form.getInputProps('password')}
            />

            <Button type="submit" fullWidth disabled={isLoading} loading={isPending}>
              アカウント作成
            </Button>
          </Stack>
        </form>

        <Divider label="または" labelPosition="center" my="lg" />

        <Button
          fullWidth
          leftSection={<IconBrandGithub size={16} />}
          variant="default"
          disabled={isLoading}
          onClick={handleGitHubSignUp}
          loading={isGitHubPending}
        >
          GitHubで登録
        </Button>
      </Paper>
    </Container>
  )
}

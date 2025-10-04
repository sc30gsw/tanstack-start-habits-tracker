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
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTransition } from 'react'
import { authClient } from '~/lib/auth-client'

export const Route = createFileRoute('/auth/sign-in')({
  component: SignInPage,
})

function SignInPage() {
  const navigate = useNavigate()

  const [isPending, startTransition] = useTransition()

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : '有効なメールアドレスを入力してください'),
      password: (value) => (value.length >= 6 ? null : 'パスワードは6文字以上である必要があります'),
    },
  })

  async function handleEmailSignIn(values: UseFormReturnType<typeof form.values>['values']) {
    startTransition(async () => {
      try {
        const { error } = await authClient.signIn.email({
          email: values.email,
          password: values.password,
          callbackURL: '/',
        })

        if (error) {
          notifications.show({
            title: 'エラー',
            message: error.message || 'サインインに失敗しました',
            color: 'red',
          })
        } else {
          navigate({ to: '/' })
        }
      } catch {
        notifications.show({ title: 'エラー', message: 'サインインに失敗しました', color: 'red' })
      }
    })
  }

  async function handleGitHubSignIn() {
    startTransition(async () => {
      try {
        await authClient.signIn.social({
          provider: 'github',
          callbackURL: '/',
        })
      } catch {
        notifications.show({
          title: 'エラー',
          message: 'GitHubサインインに失敗しました',
          color: 'red',
        })
      }
    })
  }

  return (
    <Container size={420} my={40}>
      <Title ta="center" fw={900}>
        ログイン
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        アカウントをお持ちでないですか？{' '}
        <Anchor size="sm" component="a" href="/auth/sign-up">
          新規登録
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleEmailSignIn)}>
          <Stack gap="md">
            <TextInput
              label="メールアドレス"
              placeholder="your@email.com"
              required
              disabled={isPending}
              {...form.getInputProps('email')}
            />

            <PasswordInput
              label="パスワード"
              placeholder="パスワードを入力"
              required
              disabled={isPending}
              {...form.getInputProps('password')}
            />

            <Button type="submit" fullWidth loading={isPending}>
              ログイン
            </Button>
          </Stack>
        </form>

        <Divider label="または" labelPosition="center" my="lg" />

        <Button
          fullWidth
          leftSection={<IconBrandGithub size={16} />}
          variant="default"
          onClick={handleGitHubSignIn}
          loading={isPending}
        >
          GitHubでログイン
        </Button>
      </Paper>
    </Container>
  )
}

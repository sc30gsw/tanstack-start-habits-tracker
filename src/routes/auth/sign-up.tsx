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

export const Route = createFileRoute('/auth/sign-up')({
  component: SignUpPage,
})

function SignUpPage() {
  const navigate = useNavigate()

  const [isPending, startTransition] = useTransition()

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
          callbackURL: '/',
        })

        if (error) {
          notifications.show({ color: 'red', message: error.message || '登録に失敗しました' })
        } else {
          navigate({ to: '/' })
        }
      } catch {
        notifications.show({ color: 'red', message: '登録に失敗しました' })
      }
    })
  }

  async function handleGitHubSignUp() {
    startTransition(async () => {
      try {
        await authClient.signIn.social({
          provider: 'github',
          callbackURL: '/',
        })
      } catch {
        notifications.show({ color: 'red', message: '登録に失敗しました' })
      }
    })
  }

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
              disabled={isPending}
              {...form.getInputProps('name')}
            />

            <TextInput
              label="メールアドレス"
              placeholder="your@email.com"
              required
              type="email"
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
              アカウント作成
            </Button>
          </Stack>
        </form>

        <Divider label="または" labelPosition="center" my="lg" />

        <Button
          fullWidth
          leftSection={<IconBrandGithub size={16} />}
          variant="default"
          onClick={handleGitHubSignUp}
          loading={isPending}
        >
          GitHubで登録
        </Button>
      </Paper>
    </Container>
  )
}

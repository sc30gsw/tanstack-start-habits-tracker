import { Button, Stack, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconDeviceFloppy, IconMail, IconUser } from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'
import { useTransition } from 'react'
import { z } from 'zod/v4'
import { profileDto } from '~/features/profile/server/profile-functions'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.email('Invalid email address'),
})

type ProfileFormSchema = z.infer<typeof profileSchema>

export function ProfileForm() {
  const routeApi = getRouteApi('/settings/profile')
  const { user } = routeApi.useLoaderData()

  const [isPending, startTransition] = useTransition()

  const form = useForm<ProfileFormSchema>({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
    validate: (values) => {
      const result = profileSchema.safeParse(values)

      if (!result.success) {
        const errors: Record<string, string> = {}

        for (const issue of result.error.issues) {
          const path = issue.path.join('.')

          errors[path] = issue.message
        }

        return errors
      }

      return {}
    },
  })

  const handleSubmit = form.onSubmit(async (values) => {
    startTransition(async () => {
      try {
        await profileDto.updateUserProfile({ data: values })

        notifications.show({
          title: '成功',
          message: 'プロフィールが更新されました',
          color: 'green',
        })

        form.resetDirty()
      } catch (error) {
        notifications.show({
          title: 'エラー',
          message: error instanceof Error ? error.message : 'プロフィールの更新に失敗しました',
          color: 'red',
        })
      }
    })
  })

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md" px="lg">
        <Title order={3}>プロフィール編集</Title>

        <TextInput
          label="名前"
          placeholder="あなたの名前"
          required
          disabled={isPending}
          leftSection={<IconUser size={18} />}
          {...form.getInputProps('name')}
        />

        <TextInput
          label="メールアドレス"
          placeholder="email@example.com"
          type="email"
          required
          disabled={isPending}
          leftSection={<IconMail size={18} />}
          {...form.getInputProps('email')}
        />

        <Button
          type="submit"
          loading={isPending}
          disabled={!form.isDirty()}
          fullWidth
          mt="md"
          leftSection={<IconDeviceFloppy size={18} />}
        >
          変更を保存
        </Button>
      </Stack>
    </form>
  )
}

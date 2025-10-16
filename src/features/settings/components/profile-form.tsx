import { Button, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useTransition } from 'react'
import { z } from 'zod/v4'
import { GET_USER_PROFILE_CACHE_KEY } from '~/constants/cache-key'
import { profileDto } from '~/features/profile/server/profile-functions'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.email('Invalid email address'),
})

type ProfileFormSchema = z.infer<typeof profileSchema>

export function ProfileForm() {
  const [isPending, startTransition] = useTransition()
  const queryClient = useQueryClient()

  const { data: user, refetch } = useSuspenseQuery({
    queryKey: [GET_USER_PROFILE_CACHE_KEY],
    queryFn: () => profileDto.getUserProfile(),
  })

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

        await queryClient.invalidateQueries({ queryKey: [GET_USER_PROFILE_CACHE_KEY] })
        form.resetDirty()
        await refetch()
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
      <Stack gap="md">
        <TextInput
          label="名前"
          placeholder="あなたの名前"
          required
          disabled={isPending}
          {...form.getInputProps('name')}
        />

        <TextInput
          label="メールアドレス"
          placeholder="email@example.com"
          type="email"
          required
          disabled={isPending}
          {...form.getInputProps('email')}
        />

        <Button type="submit" loading={isPending} disabled={!form.isDirty()} fullWidth mt="md">
          変更を保存
        </Button>
      </Stack>
    </form>
  )
}

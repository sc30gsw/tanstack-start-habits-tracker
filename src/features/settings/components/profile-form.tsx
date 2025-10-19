import { Button, Group, Modal, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconDeviceFloppy, IconMail, IconUser, IconX } from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'
import { useTransition } from 'react'
import { z } from 'zod/v4'
import { profileDto } from '~/features/settings/server/profile-functions'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.email('Invalid email address'),
})

type ProfileFormSchema = z.infer<typeof profileSchema>

type ProfileFormProps = {
  opened: boolean
  onClose: () => void
}

export function ProfileForm({ opened, onClose }: ProfileFormProps) {
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
        onClose()
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
    <Modal
      opened={opened}
      onClose={onClose}
      title="プロフィールを編集"
      size="md"
      centered
      closeButtonProps={{
        icon: <IconX size={20} />,
      }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
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

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={isPending}>
              キャンセル
            </Button>
            <Button
              type="submit"
              loading={isPending}
              disabled={!form.isDirty()}
              leftSection={<IconDeviceFloppy size={18} />}
            >
              保存
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}

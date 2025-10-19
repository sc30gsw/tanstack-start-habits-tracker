import { Button, Group, Stack, Text, ThemeIcon } from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { IconAlertTriangle, IconTrash } from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'
import { useTransition } from 'react'
import { profileDto } from '~/features/settings/server/profile-functions'

export function AccountDeleteButton() {
  const routeApi = getRouteApi('/settings/account')
  const navigate = routeApi.useNavigate()

  const [isPending, startTransition] = useTransition()

  const handleDeleteAccount = () => {
    modals.openConfirmModal({
      title: (
        <Group gap="xs">
          <ThemeIcon color="red" size="lg" radius="xl">
            <IconAlertTriangle size={20} />
          </ThemeIcon>
          <Text fw={600} size="lg">
            アカウント削除の確認
          </Text>
        </Group>
      ),
      children: (
        <Stack gap="md">
          <Text size="sm">アカウントを削除すると、すべてのデータが完全に削除されます。</Text>
          <Text size="sm" c="red" fw={600}>
            この操作は取り消すことができません。
          </Text>
          <Text size="sm">本当にアカウントを削除しますか?</Text>
        </Stack>
      ),
      labels: { confirm: '削除する', cancel: 'キャンセル' },
      confirmProps: { color: 'red', leftSection: <IconTrash size={16} /> },
      cancelProps: { variant: 'default' },
      onConfirm: () => {
        startTransition(async () => {
          try {
            await profileDto.deleteUserAccount()

            notifications.show({
              title: '完了',
              message: 'アカウントが削除されました',
              color: 'green',
            })

            // Redirect to sign-in page
            navigate({ to: '/auth/sign-in' })
          } catch (error) {
            notifications.show({
              title: 'エラー',
              message: error instanceof Error ? error.message : 'アカウントの削除に失敗しました',
              color: 'red',
            })
          }
        })
      },
    })
  }

  return (
    <Button
      color="red"
      variant="outline"
      onClick={handleDeleteAccount}
      loading={isPending}
      disabled={isPending}
      fullWidth
      leftSection={<IconTrash size={18} />}
      size="md"
    >
      アカウントを削除
    </Button>
  )
}

import { Button, Stack, Text } from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { getRouteApi } from '@tanstack/react-router'
import { useTransition } from 'react'
import { profileDto } from '~/features/profile/server/profile-functions'

export function AccountDeleteButton() {
  const routeApi = getRouteApi('/settings/account')
  const navigate = routeApi.useNavigate()

  const [isPending, startTransition] = useTransition()

  const handleDeleteAccount = () => {
    modals.openConfirmModal({
      title: 'アカウント削除の確認',
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
      confirmProps: { color: 'red' },
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
    >
      アカウントを削除
    </Button>
  )
}

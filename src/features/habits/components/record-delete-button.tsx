import { ActionIcon, Button, Modal, Stack, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconTrash } from '@tabler/icons-react'
import { useRouter } from '@tanstack/react-router'
import { useTransition } from 'react'
import { recordDto } from '~/features/habits/server/record-functions'

type RecordDeleteButtonProps = {
  recordId: string
  variant?: 'icon' | 'button'
}

export function RecordDeleteButton({ recordId, variant = 'icon' }: RecordDeleteButtonProps) {
  const [opened, { open, close }] = useDisclosure(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        const result = await recordDto.deleteRecord({ data: { id: recordId } })

        if (result.success) {
          router.invalidate()
          close()
          notifications.show({
            title: '成功',
            message: '記録が削除されました',
            color: 'green',
          })
        } else {
          notifications.show({
            title: 'エラー',
            message: result.error || '削除に失敗しました',
            color: 'red',
          })
        }
      } catch (_error) {
        notifications.show({
          title: 'エラー',
          message: '削除中に予期しないエラーが発生しました',
          color: 'red',
        })
      }
    })
  }

  return (
    <>
      {variant === 'icon' ? (
        <ActionIcon
          disabled={isPending}
          color="red"
          variant="subtle"
          size="sm"
          onClick={open}
          aria-label="記録を削除"
        >
          <IconTrash />
        </ActionIcon>
      ) : (
        <Button disabled={isPending} color="red" variant="subtle" size="sm" onClick={open}>
          削除
        </Button>
      )}

      <Modal opened={opened} onClose={close} title="記録の削除" centered>
        <Stack gap="md">
          <Text>この記録を削除しますか？この操作は取り消せません。</Text>
          <Stack gap="sm">
            <Button color="red" onClick={handleDelete} loading={isPending} disabled={isPending}>
              削除する
            </Button>
            <Button variant="outline" onClick={close} disabled={isPending}>
              キャンセル
            </Button>
          </Stack>
        </Stack>
      </Modal>
    </>
  )
}

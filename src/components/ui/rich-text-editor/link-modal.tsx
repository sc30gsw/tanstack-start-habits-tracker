import { Button, Group, Modal, Stack, TextInput } from '@mantine/core'

type LinkModalProps = {
  opened: boolean
  linkUrl: string
  linkText: string
  onClose: () => void
  onLinkUrlChange: (url: string) => void
  onLinkTextChange: (text: string) => void
  onSubmit: () => void
}

export function LinkModal({
  opened,
  linkUrl,
  linkText,
  onClose,
  onLinkUrlChange,
  onLinkTextChange,
  onSubmit,
}: LinkModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="リンクを挿入" size="md">
      <Stack gap="md">
        <TextInput
          label="表示テキスト（オプション）"
          placeholder="リンクテキスト"
          value={linkText}
          onChange={(e) => onLinkTextChange(e.currentTarget.value)}
          data-autofocus
        />
        <TextInput
          label="URL"
          placeholder="https://example.com"
          value={linkUrl}
          onChange={(e) => onLinkUrlChange(e.currentTarget.value)}
        />
        <Group gap="sm">
          <Button onClick={onSubmit} disabled={!linkUrl}>
            挿入
          </Button>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

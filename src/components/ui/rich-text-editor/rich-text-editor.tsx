import {
  Box,
  Button,
  Group,
  Modal,
  Stack,
  TextInput,
  Tooltip,
  useComputedColorScheme,
} from '@mantine/core'
import {
  IconBold,
  IconCode,
  IconItalic,
  IconLink,
  IconLinkOff,
  IconList,
  IconListNumbers,
  IconStrikethrough,
} from '@tabler/icons-react'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useState } from 'react'
import '~/components/ui/rich-text-editor/rich-text-editor.css'

type RichTextEditorProps = {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  disabled?: boolean
  maxLength?: number
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = '今日の感想や具体的に何をやったかを記録...',
  disabled = false,
  maxLength = 500,
}: RichTextEditorProps) {
  const computedColorScheme = useComputedColorScheme('light')
  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: 'rich-text-link',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm ${computedColorScheme === 'dark' ? 'prose-invert' : ''} max-w-none focus:outline-none`,
      },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled)
    }
  }, [disabled, editor])

  if (!editor) {
    return null
  }

  const currentLength = editor.getText().length

  const handleOpenLinkModal = () => {
    const previousUrl = editor.getAttributes('link').href
    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to, '')

    setLinkUrl(previousUrl || '')
    setLinkText(selectedText || '')
    setLinkModalOpen(true)
  }

  const handleSetLink = () => {
    if (!linkUrl) {
      setLinkModalOpen(false)
      return
    }

    // If there's text selected or provided, use it
    if (linkText) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .insertContent({
          type: 'text',
          text: linkText,
          marks: [{ type: 'link', attrs: { href: linkUrl } }],
        })
        .run()
    } else {
      // Just add link to selected text
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    }

    setLinkModalOpen(false)
    setLinkUrl('')
    setLinkText('')
  }

  const handleUnsetLink = () => {
    editor.chain().focus().unsetLink().run()
  }

  return (
    <Box>
      {/* Toolbar */}
      <Group
        gap="xs"
        p="xs"
        style={{
          borderBottom:
            computedColorScheme === 'dark'
              ? '1px solid var(--mantine-color-dark-4)'
              : '1px solid var(--mantine-color-gray-3)',
          backgroundColor:
            computedColorScheme === 'dark'
              ? 'var(--mantine-color-dark-6)'
              : 'var(--mantine-color-gray-0)',
          borderTopLeftRadius: '4px',
          borderTopRightRadius: '4px',
        }}
      >
        <Tooltip label="太字 (Cmd+B)">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run() || disabled}
            className={editor.isActive('bold') ? 'is-active' : ''}
            style={{
              padding: '4px 8px',
              border: 'none',
              borderRadius: '4px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              backgroundColor: editor.isActive('bold')
                ? 'var(--mantine-color-blue-5)'
                : 'transparent',
              color: editor.isActive('bold') ? 'white' : 'inherit',
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <IconBold size={18} />
          </button>
        </Tooltip>

        <Tooltip label="斜体 (Cmd+I)">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run() || disabled}
            className={editor.isActive('italic') ? 'is-active' : ''}
            style={{
              padding: '4px 8px',
              border: 'none',
              borderRadius: '4px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              backgroundColor: editor.isActive('italic')
                ? 'var(--mantine-color-blue-5)'
                : 'transparent',
              color: editor.isActive('italic') ? 'white' : 'inherit',
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <IconItalic size={18} />
          </button>
        </Tooltip>

        <Tooltip label="取り消し線">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run() || disabled}
            className={editor.isActive('strike') ? 'is-active' : ''}
            style={{
              padding: '4px 8px',
              border: 'none',
              borderRadius: '4px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              backgroundColor: editor.isActive('strike')
                ? 'var(--mantine-color-blue-5)'
                : 'transparent',
              color: editor.isActive('strike') ? 'white' : 'inherit',
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <IconStrikethrough size={18} />
          </button>
        </Tooltip>

        <Tooltip label="コード">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={!editor.can().chain().focus().toggleCode().run() || disabled}
            className={editor.isActive('code') ? 'is-active' : ''}
            style={{
              padding: '4px 8px',
              border: 'none',
              borderRadius: '4px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              backgroundColor: editor.isActive('code')
                ? 'var(--mantine-color-blue-5)'
                : 'transparent',
              color: editor.isActive('code') ? 'white' : 'inherit',
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <IconCode size={18} />
          </button>
        </Tooltip>

        <Tooltip label="箇条書き">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            disabled={disabled}
            className={editor.isActive('bulletList') ? 'is-active' : ''}
            style={{
              padding: '4px 8px',
              border: 'none',
              borderRadius: '4px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              backgroundColor: editor.isActive('bulletList')
                ? 'var(--mantine-color-blue-5)'
                : 'transparent',
              color: editor.isActive('bulletList') ? 'white' : 'inherit',
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <IconList size={18} />
          </button>
        </Tooltip>

        <Tooltip label="番号付きリスト">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            disabled={disabled}
            className={editor.isActive('orderedList') ? 'is-active' : ''}
            style={{
              padding: '4px 8px',
              border: 'none',
              borderRadius: '4px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              backgroundColor: editor.isActive('orderedList')
                ? 'var(--mantine-color-blue-5)'
                : 'transparent',
              color: editor.isActive('orderedList') ? 'white' : 'inherit',
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <IconListNumbers size={18} />
          </button>
        </Tooltip>

        <Box
          style={{
            width: '1px',
            height: '20px',
            backgroundColor:
              computedColorScheme === 'dark'
                ? 'var(--mantine-color-dark-4)'
                : 'var(--mantine-color-gray-3)',
            margin: '0 4px',
          }}
        />

        <Tooltip label="リンク挿入">
          <button
            type="button"
            onClick={handleOpenLinkModal}
            disabled={disabled}
            className={editor.isActive('link') ? 'is-active' : ''}
            style={{
              padding: '4px 8px',
              border: 'none',
              borderRadius: '4px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              backgroundColor: editor.isActive('link')
                ? 'var(--mantine-color-blue-5)'
                : 'transparent',
              color: editor.isActive('link') ? 'white' : 'inherit',
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <IconLink size={18} />
          </button>
        </Tooltip>

        {editor.isActive('link') && (
          <Tooltip label="リンク解除">
            <button
              type="button"
              onClick={handleUnsetLink}
              disabled={disabled}
              style={{
                padding: '4px 8px',
                border: 'none',
                borderRadius: '4px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                backgroundColor: 'transparent',
                opacity: disabled ? 0.5 : 1,
              }}
            >
              <IconLinkOff size={18} />
            </button>
          </Tooltip>
        )}
      </Group>

      {/* Editor Content */}
      <Box
        style={{
          border:
            computedColorScheme === 'dark'
              ? '1px solid var(--mantine-color-dark-4)'
              : '1px solid var(--mantine-color-gray-3)',
          borderTop: 'none',
          borderBottomLeftRadius: '4px',
          borderBottomRightRadius: '4px',
          backgroundColor:
            computedColorScheme === 'dark'
              ? 'var(--mantine-color-dark-6)'
              : 'var(--mantine-color-white)',
          minHeight: '120px',
          maxHeight: '300px',
          overflowY: 'auto',
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      {/* Character count */}
      <Box mt="xs" style={{ textAlign: 'right' }}>
        <span
          style={{
            fontSize: '12px',
            color:
              currentLength > maxLength
                ? 'var(--mantine-color-red-6)'
                : 'var(--mantine-color-dimmed)',
          }}
        >
          {currentLength}/{maxLength}文字
        </span>
      </Box>

      {/* Link Modal */}
      <Modal
        opened={linkModalOpen}
        onClose={() => {
          setLinkModalOpen(false)
          setLinkUrl('')
          setLinkText('')
        }}
        title="リンクを挿入"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="表示テキスト（オプション）"
            placeholder="リンクテキスト"
            value={linkText}
            onChange={(e) => setLinkText(e.currentTarget.value)}
            data-autofocus
          />
          <TextInput
            label="URL"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.currentTarget.value)}
          />
          <Group gap="sm">
            <Button onClick={handleSetLink} disabled={!linkUrl}>
              挿入
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setLinkModalOpen(false)
                setLinkUrl('')
                setLinkText('')
              }}
            >
              キャンセル
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  )
}

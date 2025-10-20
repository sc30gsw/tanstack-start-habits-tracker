import {
  Box,
  Button,
  Group,
  Modal,
  Select,
  Stack,
  TextInput,
  Tooltip,
  useComputedColorScheme,
} from '@mantine/core'
import {
  IconBold,
  IconCode,
  IconCodePlus,
  IconItalic,
  IconLink,
  IconLinkOff,
  IconList,
  IconListNumbers,
  IconStrikethrough,
} from '@tabler/icons-react'
import { textblockTypeInputRule } from '@tiptap/core'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Link from '@tiptap/extension-link'
import ListItem from '@tiptap/extension-list-item'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, ReactNodeViewRenderer, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { common, createLowlight } from 'lowlight'
import { useEffect, useState } from 'react'
import { CodeBlockComponent } from '~/components/ui/rich-text-editor/code-block-component'
import { CodeBlockLanguageExtension } from '~/components/ui/rich-text-editor/code-block-language-extension'
import { LinkPreview } from '~/components/ui/rich-text-editor/link-preview-node'
import '~/components/ui/rich-text-editor/rich-text-editor.css'

const lowlight = createLowlight(common)

const LANGUAGE_OPTIONS = [
  { value: 'null', label: '自動検出' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'css', label: 'CSS' },
  { value: 'html', label: 'HTML' },
  { value: 'json', label: 'JSON' },
  { value: 'bash', label: 'Bash' },
  { value: 'sql', label: 'SQL' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'yaml', label: 'YAML' },
  { value: 'xml', label: 'XML' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
] as const satisfies readonly Record<string, string>[]

const TEXTBLOCK_TYPE_INPUT_RULES_FIND_REGEX = /^```([a-z]+)?(?::([^\s]+))?[\s\n]$/
const CODEBLOCK_REGEX = /^```([a-z]+)?(?::([^\n]+))?\n([\s\S]*?)\n```$/m

type RichTextEditorProps = {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  disabled?: boolean
  onSubmit?: () => void
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = '今日の感想や具体的に何をやったかを記録...',
  disabled = false,
  onSubmit,
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
        codeBlock: false,
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        listItem: false, // Disable default to use custom
      }).extend({
        addKeyboardShortcuts() {
          return {
            'Shift-Enter': () => {
              if (onSubmit) {
                onSubmit()
                return true
              }

              return false
            },
          }
        },
      }),
      ListItem.extend({
        addKeyboardShortcuts() {
          return {
            Tab: () => {
              // Indent list item (create nested list)
              return this.editor.commands.sinkListItem('listItem')
            },
            'Shift-Tab': () => {
              // Outdent list item (lift nested list)
              return this.editor.commands.liftListItem('listItem')
            },
            'Shift-Enter': () => {
              // Submit on Shift+Enter
              if (onSubmit) {
                onSubmit()
                return true
              }
              return false
            },
            Enter: () => {
              const { state } = this.editor
              const { $from } = state.selection

              // Check if we're in a list item
              const listItemDepth = $from.depth - 1
              if (listItemDepth < 0 || $from.node(listItemDepth).type.name !== 'listItem') {
                return false
              }

              // Get the current list item node
              const currentListItem = $from.node(listItemDepth)

              // Check if the list item is empty (only contains empty paragraph)
              const isEmpty = currentListItem.textContent.length === 0

              if (isEmpty) {
                // Exit the list (Slack-like behavior)
                return this.editor.commands.liftListItem('listItem')
              }

              // Create new list item (default behavior)
              return this.editor.commands.splitListItem('listItem')
            },
          }
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'code-block',
        },
        languageClassPrefix: 'language-',
      }).extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockComponent)
        },
        addInputRules() {
          return [
            textblockTypeInputRule({
              find: TEXTBLOCK_TYPE_INPUT_RULES_FIND_REGEX,
              type: this.type,
              getAttributes: (match) => ({
                language: match[1] || null,
                filename: match[2] || null,
              }),
            }),
          ]
        },
      }),
      CodeBlockLanguageExtension,
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
      }).extend({
        addKeyboardShortcuts() {
          return {
            'Mod-Shift-u': () => {
              const previousUrl = this.editor.getAttributes('link').href
              const { from, to } = this.editor.state.selection
              const selectedText = this.editor.state.doc.textBetween(from, to, '')

              setLinkUrl(previousUrl || '')
              setLinkText(selectedText || '')
              setLinkModalOpen(true)

              return true
            },
          }
        },
      }),
      LinkPreview,
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
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData('text/plain')

        const codeBlockMatch = text?.match(CODEBLOCK_REGEX)

        if (codeBlockMatch && editor) {
          event.preventDefault()
          const language = codeBlockMatch[1] || null
          const filename = codeBlockMatch[2] || null
          const code = codeBlockMatch[3]

          editor
            .chain()
            .focus()
            .insertContent({
              type: 'codeBlock',
              attrs: { language, filename },
              content: code ? [{ type: 'text', text: code }] : undefined,
            })
            .run()

          return true
        }

        if (text && isValidUrl(text)) {
          const { state } = view
          const { selection } = state
          const { $from } = selection

          if ($from.parent.textContent === '') {
            event.preventDefault()
            editor?.commands.setLinkPreview({ url: text })

            return true
          }
        }
        return false
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

  const isValidUrl = (text: string): boolean => {
    try {
      const url = new URL(text)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }

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
        <Tooltip label="太字 (⌘B)">
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

        <Tooltip label="斜体 (⌘I)">
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

        <Tooltip label="取り消し線 (⌘⇧X)">
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

        <Tooltip label="コード (⌘E)">
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

        <Tooltip label="コードブロック (⌘⌥C)">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            disabled={disabled}
            className={editor.isActive('codeBlock') ? 'is-active' : ''}
            style={{
              padding: '4px 8px',
              border: 'none',
              borderRadius: '4px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              backgroundColor: editor.isActive('codeBlock')
                ? 'var(--mantine-color-blue-5)'
                : 'transparent',
              color: editor.isActive('codeBlock') ? 'white' : 'inherit',
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <IconCodePlus size={18} />
          </button>
        </Tooltip>

        {/* 言語選択とファイル名入力（コードブロックがアクティブな時のみ表示） */}
        {editor.isActive('codeBlock') && (
          <>
            <Select
              data={LANGUAGE_OPTIONS}
              value={editor.getAttributes('codeBlock').language || 'null'}
              onChange={(value) => {
                if (value === 'null') {
                  editor.chain().focus().updateAttributes('codeBlock', { language: null }).run()
                } else {
                  editor.chain().focus().updateAttributes('codeBlock', { language: value }).run()
                }
              }}
              size="xs"
              w={140}
              disabled={disabled}
              placeholder="言語"
              styles={{
                input: {
                  fontSize: '12px',
                  height: '28px',
                  minHeight: '28px',
                },
              }}
              allowDeselect={false}
            />
            <TextInput
              value={editor.getAttributes('codeBlock').filename || ''}
              onChange={(e) => {
                editor
                  .chain()
                  .focus()
                  .updateAttributes('codeBlock', { filename: e.currentTarget.value || null })
                  .run()
              }}
              size="xs"
              w={180}
              disabled={disabled}
              placeholder="ファイル名（例: example.ts）"
              styles={{
                input: {
                  fontSize: '12px',
                  height: '28px',
                  minHeight: '28px',
                },
              }}
            />
          </>
        )}

        <Tooltip label="箇条書き (⌘⇧8)">
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

        <Tooltip label="番号付きリスト (⌘⇧7)">
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

        <Tooltip label="リンク挿入 (⌘⇧U)">
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

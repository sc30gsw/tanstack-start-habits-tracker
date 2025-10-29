import {
  Box,
  Button,
  ColorInput,
  Group,
  Kbd,
  Modal,
  Popover,
  Select,
  Stack,
  Text,
  TextInput,
  Tooltip,
  useComputedColorScheme,
} from '@mantine/core'
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBold,
  IconCode,
  IconCodePlus,
  IconColorPicker,
  IconHighlight,
  IconItalic,
  IconLink,
  IconLinkOff,
  IconList,
  IconListNumbers,
  IconSeparatorHorizontal,
  IconStrikethrough,
  IconSubscript,
  IconSuperscript,
  IconUnderline,
} from '@tabler/icons-react'
import { textblockTypeInputRule } from '@tiptap/core'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import ListItem from '@tiptap/extension-list-item'
import Placeholder from '@tiptap/extension-placeholder'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import { TextStyle } from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
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
  // Web Development
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'jsx', label: 'JSX' },
  { value: 'tsx', label: 'TSX' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'sass', label: 'Sass' },
  { value: 'less', label: 'Less' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  // Backend Languages
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'swift', label: 'Swift' },
  { value: 'dart', label: 'Dart' },
  { value: 'elixir', label: 'Elixir' },
  // Shell & Scripts
  { value: 'bash', label: 'Bash' },
  { value: 'sh', label: 'Shell' },
  { value: 'zsh', label: 'Zsh' },
  { value: 'powershell', label: 'PowerShell' },
  // Data & Config
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'toml', label: 'TOML' },
  { value: 'xml', label: 'XML' },
  { value: 'ini', label: 'INI' },
  { value: 'graphql', label: 'GraphQL' },
  { value: 'sql', label: 'SQL' },
  // Markup & Documentation
  { value: 'markdown', label: 'Markdown' },
  // Container & Infrastructure
  { value: 'dockerfile', label: 'Dockerfile' },
  { value: 'nginx', label: 'Nginx' },
] as const satisfies readonly Record<string, string>[]

// Language abbreviation to full name mapping
const LANGUAGE_NORMALIZATION = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  rb: 'ruby',
  rs: 'rust',
  kt: 'kotlin',
  ex: 'elixir',
  cs: 'csharp',
  ps1: 'powershell',
  yml: 'yaml',
  gql: 'graphql',
  md: 'markdown',
} as const satisfies Record<string, string>

// Language to file extension mapping (including common abbreviations)
const LANGUAGE_TO_EXTENSION = {
  // JavaScript/TypeScript
  javascript: '.js',
  js: '.js',
  typescript: '.ts',
  ts: '.ts',
  jsx: '.jsx',
  tsx: '.tsx',
  // Web
  html: '.html',
  css: '.css',
  scss: '.scss',
  sass: '.sass',
  less: '.less',
  vue: '.vue',
  svelte: '.svelte',
  // Backend
  python: '.py',
  py: '.py',
  java: '.java',
  go: '.go',
  rust: '.rs',
  rs: '.rs',
  ruby: '.rb',
  rb: '.rb',
  php: '.php',
  csharp: '.cs',
  cs: '.cs',
  cpp: '.cpp',
  'c++': '.cpp',
  c: '.c',
  kotlin: '.kt',
  kt: '.kt',
  swift: '.swift',
  dart: '.dart',
  elixir: '.ex',
  ex: '.ex',
  // Shell
  bash: '.sh',
  sh: '.sh',
  zsh: '.zsh',
  powershell: '.ps1',
  ps1: '.ps1',
  // Data & Config
  json: '.json',
  yaml: '.yml',
  yml: '.yml',
  toml: '.toml',
  xml: '.xml',
  ini: '.ini',
  graphql: '.graphql',
  gql: '.graphql',
  sql: '.sql',
  // Markup
  markdown: '.md',
  md: '.md',
  // Other
  nginx: '.conf',
  dockerfile: '',
} as const satisfies Record<string, string>

const TEXTBLOCK_TYPE_INPUT_RULES_FIND_REGEX = /^```([a-z0-9]+)?(?::([^\s]+))?[\s\n]$/
const CODEBLOCK_REGEX = /^```([a-z0-9]+)?(?::([^\n]+))?\n([\s\S]*?)\n```$/m

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
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [codeBlockAttrs, setCodeBlockAttrs] = useState<{
    language: string | null
    filename: string | null
  }>({ language: null, filename: null })

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
            'Mod-Enter': () => {
              if (onSubmit) {
                onSubmit()
                return true
              }

              return false
            },
          }
        },
      }),
      TextStyle,
      Color,
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      Subscript,
      Superscript,
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
            'Mod-Enter': () => {
              // Submit on Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux)
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
              getAttributes: (match) => {
                const rawLanguage = match[1] || null
                // Normalize language code (ts -> typescript, js -> javascript, etc.)
                const language = rawLanguage
                  ? LANGUAGE_NORMALIZATION[rawLanguage as keyof typeof LANGUAGE_NORMALIZATION] ||
                    rawLanguage
                  : null
                let filename = match[2] || null

                // ファイル名が指定されていて、拡張子が含まれていない場合は自動追加
                // 短縮形でも拡張子を検索できるようにrawLanguageを使用
                if (filename && rawLanguage && !filename.includes('.')) {
                  const extension =
                    LANGUAGE_TO_EXTENSION[rawLanguage as keyof typeof LANGUAGE_TO_EXTENSION]
                  if (extension) {
                    filename = `${filename}${extension}`
                  }
                }

                return {
                  language,
                  filename,
                }
              },
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

      // Update code block attributes when content changes
      if (editor.isActive('codeBlock')) {
        const attrs = editor.getAttributes('codeBlock')
        setCodeBlockAttrs({
          language: attrs.language || null,
          filename: attrs.filename || null,
        })
      }
    },
    onSelectionUpdate: ({ editor }) => {
      // Update code block attributes when selection changes
      if (editor.isActive('codeBlock')) {
        const attrs = editor.getAttributes('codeBlock')
        setCodeBlockAttrs({
          language: attrs.language || null,
          filename: attrs.filename || null,
        })
      }
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
          const language = codeBlockMatch[1]
            ? codeBlockMatch[1] === 'markdown'
              ? 'md'
              : codeBlockMatch[1]
            : null
          let filename = codeBlockMatch[2] || null
          const code = codeBlockMatch[3]

          // ファイル名が指定されていて、拡張子が含まれていない場合は自動追加
          if (filename && language && !filename.includes('.')) {
            const extension = LANGUAGE_TO_EXTENSION[language as keyof typeof LANGUAGE_TO_EXTENSION]
            if (extension) {
              filename = `${filename}${extension}`
            }
          }

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
        <Tooltip
          label={
            <Stack gap={4} align="center">
              <Text size="xs">元に戻す</Text>
              <Group gap={4}>
                <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  ⌘
                </Kbd>
                <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  Z
                </Kbd>
              </Group>
            </Stack>
          }
        >
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run() || disabled}
            style={{
              padding: '4px 8px',
              border: 'none',
              borderRadius: '4px',
              cursor:
                !editor.can().chain().focus().undo().run() || disabled ? 'not-allowed' : 'pointer',
              backgroundColor: 'transparent',
              opacity: !editor.can().chain().focus().undo().run() || disabled ? 0.4 : 1,
              color:
                !editor.can().chain().focus().undo().run() || disabled
                  ? 'var(--mantine-color-gray-5)'
                  : 'inherit',
            }}
          >
            <IconArrowBackUp size={18} />
          </button>
        </Tooltip>

        <Tooltip
          label={
            <Stack gap={4} align="center">
              <Text size="xs">やり直す</Text>
              <Group gap={4}>
                <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  ⌘
                </Kbd>
                <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  ⇧
                </Kbd>
                <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  Z
                </Kbd>
              </Group>
            </Stack>
          }
        >
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run() || disabled}
            style={{
              padding: '4px 8px',
              border: 'none',
              borderRadius: '4px',
              cursor:
                !editor.can().chain().focus().redo().run() || disabled ? 'not-allowed' : 'pointer',
              backgroundColor: 'transparent',
              opacity: !editor.can().chain().focus().redo().run() || disabled ? 0.4 : 1,
              color:
                !editor.can().chain().focus().redo().run() || disabled
                  ? 'var(--mantine-color-gray-5)'
                  : 'inherit',
            }}
          >
            <IconArrowForwardUp size={18} />
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

        <Tooltip
          label={
            <Stack gap={4} align="center">
              <Text size="xs">太字</Text>
              <Group gap={4}>
                <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  ⌘
                </Kbd>
                <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  B
                </Kbd>
              </Group>
            </Stack>
          }
        >
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

        <Tooltip
          label={
            <Stack gap={4} align="center">
              <Text size="xs">斜体</Text>
              <Group gap={4}>
                <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  ⌘
                </Kbd>
                <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  I
                </Kbd>
              </Group>
            </Stack>
          }
        >
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

        <Tooltip
          label={
            <Stack gap={4} align="center">
              <Text size="xs">取り消し線</Text>
              <Group gap={4}>
                <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  ⌘
                </Kbd>
                <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  ⇧
                </Kbd>
                <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  X
                </Kbd>
              </Group>
            </Stack>
          }
        >
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

        <Tooltip
          label={
            <Stack gap={4} align="center">
              <Text size="xs">下線</Text>
              <Group gap={4}>
                <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  ⌘
                </Kbd>
                <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  U
                </Kbd>
              </Group>
            </Stack>
          }
        >
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            disabled={!editor.can().chain().focus().toggleUnderline().run() || disabled}
            className={editor.isActive('underline') ? 'is-active' : ''}
            style={{
              padding: '4px 8px',
              border: 'none',
              borderRadius: '4px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              backgroundColor: editor.isActive('underline')
                ? 'var(--mantine-color-blue-5)'
                : 'transparent',
              color: editor.isActive('underline') ? 'white' : 'inherit',
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <IconUnderline size={18} />
          </button>
        </Tooltip>

        <Tooltip
          label={
            <Stack gap={4} align="center">
              <Text size="xs">コード</Text>
              <Group gap={4}>
                <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  ⌘
                </Kbd>
                <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  E
                </Kbd>
              </Group>
            </Stack>
          }
        >
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

        <Tooltip
          label={
            <Stack gap={4} align="center">
              <Text size="xs">コードブロック</Text>
              <Group gap={4}>
                <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  ⌘
                </Kbd>
                <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  ⌥
                </Kbd>
                <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  C
                </Kbd>
              </Group>
            </Stack>
          }
        >
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

        <Popover opened={colorPickerOpen} onChange={setColorPickerOpen} position="bottom" withArrow>
          <Popover.Target>
            <Tooltip label="文字色">
              <button
                type="button"
                onClick={() => setColorPickerOpen(!colorPickerOpen)}
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
                <IconColorPicker size={18} />
              </button>
            </Tooltip>
          </Popover.Target>
          <Popover.Dropdown>
            <Stack gap="xs">
              <ColorInput
                value={selectedColor}
                onChange={(color) => {
                  setSelectedColor(color)
                  editor.chain().focus().setColor(color).run()
                }}
                format="hex"
                swatches={[
                  '#000000',
                  '#868e96',
                  '#fa5252',
                  '#e64980',
                  '#be4bdb',
                  '#7950f2',
                  '#4c6ef5',
                  '#228be6',
                  '#15aabf',
                  '#12b886',
                  '#40c057',
                  '#82c91e',
                  '#fab005',
                  '#fd7e14',
                ]}
              />
              <Button
                size="xs"
                variant="light"
                onClick={() => {
                  editor.chain().focus().unsetColor().run()
                  setColorPickerOpen(false)
                }}
              >
                色をリセット
              </Button>
            </Stack>
          </Popover.Dropdown>
        </Popover>

        <Tooltip label="ハイライト">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            disabled={disabled}
            className={editor.isActive('highlight') ? 'is-active' : ''}
            style={{
              padding: '4px 8px',
              border: 'none',
              borderRadius: '4px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              backgroundColor: editor.isActive('highlight')
                ? 'var(--mantine-color-yellow-5)'
                : 'transparent',
              color: editor.isActive('highlight') ? 'white' : 'inherit',
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <IconHighlight size={18} />
          </button>
        </Tooltip>

        <Tooltip label="下付き文字">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            disabled={disabled}
            className={editor.isActive('subscript') ? 'is-active' : ''}
            style={{
              padding: '4px 8px',
              border: 'none',
              borderRadius: '4px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              backgroundColor: editor.isActive('subscript')
                ? 'var(--mantine-color-blue-5)'
                : 'transparent',
              color: editor.isActive('subscript') ? 'white' : 'inherit',
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <IconSubscript size={18} />
          </button>
        </Tooltip>

        <Tooltip label="上付き文字">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            disabled={disabled}
            className={editor.isActive('superscript') ? 'is-active' : ''}
            style={{
              padding: '4px 8px',
              border: 'none',
              borderRadius: '4px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              backgroundColor: editor.isActive('superscript')
                ? 'var(--mantine-color-blue-5)'
                : 'transparent',
              color: editor.isActive('superscript') ? 'white' : 'inherit',
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <IconSuperscript size={18} />
          </button>
        </Tooltip>

        {/* 言語選択とファイル名入力（コードブロックがアクティブな時のみ表示） */}
        {editor.isActive('codeBlock') && (
          <>
            <Select
              data={LANGUAGE_OPTIONS}
              value={codeBlockAttrs.language || 'null'}
              onChange={(value) => {
                if (value === 'null') {
                  editor.commands.updateAttributes('codeBlock', { language: null })
                } else {
                  // Normalize markdown to md
                  const normalizedValue = value === 'markdown' ? 'md' : value
                  editor.commands.updateAttributes('codeBlock', { language: normalizedValue })

                  // Auto-fill filename extension if filename is empty
                  const currentFilename = editor.getAttributes('codeBlock').filename
                  if (!currentFilename && normalizedValue) {
                    const extension =
                      LANGUAGE_TO_EXTENSION[normalizedValue as keyof typeof LANGUAGE_TO_EXTENSION]
                    if (extension) {
                      editor.commands.updateAttributes('codeBlock', {
                        filename: `example${extension}`,
                      })
                    }
                  }
                }
              }}
              size="xs"
              w={180}
              disabled={disabled}
              placeholder="言語"
              searchable
              nothingFoundMessage="言語が見つかりません"
              maxDropdownHeight={300}
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
              value={codeBlockAttrs.filename || ''}
              onChange={(e) => {
                editor.commands.updateAttributes('codeBlock', {
                  filename: e.currentTarget.value || null,
                })
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

        <Tooltip
          label={
            <Stack gap={4} align="center">
              <Text size="xs">箇条書き</Text>
              <Group gap={4}>
                <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  ⌘
                </Kbd>
                <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  ⇧
                </Kbd>
                <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  8
                </Kbd>
              </Group>
            </Stack>
          }
        >
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

        <Tooltip
          label={
            <Stack gap={4} align="center">
              <Text size="xs">番号付きリスト</Text>
              <Group gap={4}>
                <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  ⌘
                </Kbd>
                <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  ⇧
                </Kbd>
                <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  7
                </Kbd>
              </Group>
            </Stack>
          }
        >
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

        <Tooltip label="水平線">
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
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
            <IconSeparatorHorizontal size={18} />
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

        <Tooltip
          label={
            <Stack gap={4} align="center">
              <Text size="xs">リンク挿入</Text>
              <Group gap={4}>
                <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  ⌘
                </Kbd>
                <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  ⇧
                </Kbd>
                <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  U
                </Kbd>
              </Group>
            </Stack>
          }
        >
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

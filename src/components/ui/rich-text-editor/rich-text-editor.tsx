import { Box, useComputedColorScheme } from '@mantine/core'
import { EditorContent } from '@tiptap/react'
import { useEffect, useState } from 'react'
import { EditorToolbar } from '~/components/ui/rich-text-editor/editor-toolbar'
import { LinkModal } from '~/components/ui/rich-text-editor/link-modal'
import { useLinkActions } from '~/hooks/use-link-actions'
import { useRichTextEditor } from '~/hooks/use-rich-text-editor'
import '~/components/ui/rich-text-editor/rich-text-editor.css'

type RichTextEditorProps = {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  disabled?: boolean
  minHeight?: string | number
  onSubmit?: () => void
  editorKey?: string
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = '今日の感想や具体的に何をやったかを記録...',
  disabled = false,
  minHeight = '120px',
  onSubmit,
  editorKey,
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

  const isValidUrl = (text: string) => {
    try {
      const url = new URL(text)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }

  const editor = useRichTextEditor({
    content,
    onChange,
    placeholder,
    disabled,
    editorKey,
    onSubmit,
    setLinkModalOpen,
    setLinkUrl,
    setLinkText,
    setCodeBlockAttrs,
    isValidUrl,
  })

  const { handleOpenLinkModal, handleSetLink, handleUnsetLink } = useLinkActions(editor)

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

  return (
    <Box>
      <EditorToolbar
        editor={editor}
        disabled={disabled}
        colorPickerOpen={colorPickerOpen}
        selectedColor={selectedColor}
        codeBlockAttrs={codeBlockAttrs}
        onColorPickerOpenChange={setColorPickerOpen}
        onColorChange={setSelectedColor}
        onLinkModalOpen={() => handleOpenLinkModal(setLinkUrl, setLinkText, setLinkModalOpen)}
        onUnsetLink={handleUnsetLink}
      />

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
          minHeight: minHeight,
          maxHeight: '300px',
          overflowY: 'auto',
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      <LinkModal
        opened={linkModalOpen}
        linkUrl={linkUrl}
        linkText={linkText}
        onClose={() => {
          setLinkModalOpen(false)
          setLinkUrl('')
          setLinkText('')
        }}
        onLinkUrlChange={setLinkUrl}
        onLinkTextChange={setLinkText}
        onSubmit={() => handleSetLink(linkUrl, linkText, setLinkModalOpen, setLinkUrl, setLinkText)}
      />
    </Box>
  )
}

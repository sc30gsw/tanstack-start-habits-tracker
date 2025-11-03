import { Box, Group, useComputedColorScheme } from '@mantine/core'
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBold,
  IconCode,
  IconCodePlus,
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
import type { Editor } from '@tiptap/react'
import { CodeBlockControls } from '~/components/ui/rich-text-editor/code-block-controls'
import { ColorPickerPopover } from '~/components/ui/rich-text-editor/color-picker-popover'
import { ToolbarButton } from '~/components/ui/rich-text-editor/toolbar-button'

type EditorToolbarProps = {
  editor: Editor
  disabled: boolean
  colorPickerOpen: boolean
  selectedColor: string
  codeBlockAttrs: { language: string | null; filename: string | null }
  onColorPickerOpenChange: (open: boolean) => void
  onColorChange: (color: string) => void
  onLinkModalOpen: () => void
  onUnsetLink: () => void
}

export function EditorToolbar({
  editor,
  disabled,
  colorPickerOpen,
  selectedColor,
  codeBlockAttrs,
  onColorPickerOpenChange,
  onColorChange,
  onLinkModalOpen,
  onUnsetLink,
}: EditorToolbarProps) {
  const computedColorScheme = useComputedColorScheme('light')

  return (
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
      <ToolbarButton
        icon={<IconArrowBackUp size={18} />}
        label="元に戻す"
        shortcuts={['⌘', 'Z']}
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run() || disabled}
      />

      <ToolbarButton
        icon={<IconArrowForwardUp size={18} />}
        label="やり直す"
        shortcuts={['⌘', '⇧', 'Z']}
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run() || disabled}
      />

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

      <ToolbarButton
        icon={<IconBold size={18} />}
        label="太字"
        shortcuts={['⌘', 'B']}
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run() || disabled}
        isActive={editor.isActive('bold')}
      />

      <ToolbarButton
        icon={<IconItalic size={18} />}
        label="斜体"
        shortcuts={['⌘', 'I']}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run() || disabled}
        isActive={editor.isActive('italic')}
      />

      <ToolbarButton
        icon={<IconStrikethrough size={18} />}
        label="取り消し線"
        shortcuts={['⌘', '⇧', 'X']}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run() || disabled}
        isActive={editor.isActive('strike')}
      />

      <ToolbarButton
        icon={<IconUnderline size={18} />}
        label="下線"
        shortcuts={['⌘', 'U']}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run() || disabled}
        isActive={editor.isActive('underline')}
      />

      <ToolbarButton
        icon={<IconCode size={18} />}
        label="コード"
        shortcuts={['⌘', 'E']}
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run() || disabled}
        isActive={editor.isActive('code')}
      />

      <ToolbarButton
        icon={<IconCodePlus size={18} />}
        label="コードブロック"
        shortcuts={['⌘', '⌥', 'C']}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        disabled={disabled}
        isActive={editor.isActive('codeBlock')}
      />

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

      <ColorPickerPopover
        opened={colorPickerOpen}
        selectedColor={selectedColor}
        disabled={disabled}
        editor={editor}
        onOpenChange={onColorPickerOpenChange}
        onColorChange={onColorChange}
      />

      <ToolbarButton
        icon={<IconHighlight size={18} />}
        label="ハイライト"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        disabled={disabled}
        isActive={editor.isActive('highlight')}
      />

      <ToolbarButton
        icon={<IconSubscript size={18} />}
        label="下付き文字"
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        disabled={disabled}
        isActive={editor.isActive('subscript')}
      />

      <ToolbarButton
        icon={<IconSuperscript size={18} />}
        label="上付き文字"
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        disabled={disabled}
        isActive={editor.isActive('superscript')}
      />

      <CodeBlockControls editor={editor} disabled={disabled} codeBlockAttrs={codeBlockAttrs} />

      <ToolbarButton
        icon={<IconList size={18} />}
        label="箇条書き"
        shortcuts={['⌘', '⇧', '8']}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={disabled}
        isActive={editor.isActive('bulletList')}
      />

      <ToolbarButton
        icon={<IconListNumbers size={18} />}
        label="番号付きリスト"
        shortcuts={['⌘', '⇧', '7']}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={disabled}
        isActive={editor.isActive('orderedList')}
      />

      <ToolbarButton
        icon={<IconSeparatorHorizontal size={18} />}
        label="水平線"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        disabled={disabled}
      />

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

      <ToolbarButton
        icon={<IconLink size={18} />}
        label={editor.isActive('link') ? 'リンク解除' : 'リンク挿入'}
        shortcuts={['⌘', '⇧', 'U']}
        onClick={onLinkModalOpen}
        disabled={disabled}
        isActive={editor.isActive('link')}
      />

      {editor.isActive('link') && (
        <ToolbarButton
          icon={<IconLinkOff size={18} />}
          label="リンク解除"
          shortcuts={['⌘', '⇧', 'K']}
          onClick={onUnsetLink}
          disabled={disabled}
        />
      )}
    </Group>
  )
}

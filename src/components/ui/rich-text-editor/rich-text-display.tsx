import { Box, useComputedColorScheme } from '@mantine/core'
import Link from '@tiptap/extension-link'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'
import { LinkPreview } from '~/components/ui/rich-text-editor/link-preview-node'
import '~/components/ui/rich-text-editor/rich-text-editor.css'

export function RichTextDisplay({ html }: Record<'html', string>) {
  const computedColorScheme = useComputedColorScheme('light')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      LinkPreview,
    ],
    content: html,
    editable: false,
    editorProps: {
      attributes: {
        class: `prose prose-sm ${computedColorScheme === 'dark' ? 'prose-invert' : ''} max-w-none`,
      },
    },
  })

  useEffect(() => {
    if (editor && html !== editor.getHTML()) {
      editor.commands.setContent(html)
    }
  }, [html, editor])

  if (!editor) {
    return null
  }

  return (
    <Box
      style={{
        padding: 0,
      }}
    >
      <EditorContent editor={editor} />
    </Box>
  )
}

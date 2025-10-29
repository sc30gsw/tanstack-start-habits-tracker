import { Box, useComputedColorScheme } from '@mantine/core'
import CodeBlockShiki from 'tiptap-extension-code-block-shiki'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import { TextStyle } from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import { EditorContent, ReactNodeViewRenderer, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'
import { CodeBlockComponent } from '~/components/ui/rich-text-editor/code-block-component'
import { CodeBlockLanguageExtension } from '~/components/ui/rich-text-editor/code-block-language-extension'
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
        codeBlock: false, // デフォルトのcodeBlockを無効化
      }),
      TextStyle,
      Color,
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      Subscript,
      Superscript,
      CodeBlockShiki.configure({
        defaultTheme: computedColorScheme === 'dark' ? 'github-dark' : 'github-light',
        HTMLAttributes: {
          class: 'code-block',
        },
        languageClassPrefix: 'language-',
      }).extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockComponent)
        },
      }),
      CodeBlockLanguageExtension,
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

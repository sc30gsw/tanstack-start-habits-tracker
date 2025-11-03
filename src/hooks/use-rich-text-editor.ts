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
import { ReactNodeViewRenderer, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { common, createLowlight } from 'lowlight'
import { CodeBlockComponent } from '~/components/ui/rich-text-editor/code-block-component'
import { CodeBlockLanguageExtension } from '~/components/ui/rich-text-editor/code-block-language-extension'
import { LinkPreview } from '~/components/ui/rich-text-editor/link-preview-node'
import {
  CODEBLOCK_REGEX,
  LANGUAGE_NORMALIZATION,
  LANGUAGE_TO_EXTENSION,
  TEXTBLOCK_TYPE_INPUT_RULES_FIND_REGEX,
} from '~/constants/rich-text-editor'

const lowlight = createLowlight(common)

type UseRichTextEditorProps = {
  content: string
  onChange: (html: string) => void
  placeholder: string
  disabled: boolean
  editorKey?: string
  onSubmit?: () => void
  setLinkModalOpen: (open: boolean) => void
  setLinkUrl: (url: string) => void
  setLinkText: (text: string) => void
  setCodeBlockAttrs: (attrs: { language: string | null; filename: string | null }) => void
  isValidUrl: (text: string) => boolean
}

export function useRichTextEditor({
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
}: UseRichTextEditorProps) {
  return useEditor(
    {
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
          listItem: false,
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
                return this.editor.commands.sinkListItem('listItem')
              },
              'Shift-Tab': () => {
                return this.editor.commands.liftListItem('listItem')
              },
              Enter: () => {
                const { state } = this.editor
                const { $from } = state.selection
                const listItemDepth = $from.depth - 1

                if (listItemDepth < 0 || $from.node(listItemDepth).type.name !== 'listItem') {
                  return false
                }

                const currentListItem = $from.node(listItemDepth)
                const isEmpty = currentListItem.textContent.length === 0

                if (isEmpty) {
                  return this.editor.commands.liftListItem('listItem')
                }

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
                  const language = rawLanguage
                    ? LANGUAGE_NORMALIZATION[rawLanguage as keyof typeof LANGUAGE_NORMALIZATION] ||
                      rawLanguage
                    : null
                  let filename = match[2] || null

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
              Space: () => {
                if (this.editor.isActive('link')) {
                  const { $from } = this.editor.state.selection
                  const marks = $from.marks()
                  const hasLinkMark = marks.some((mark) => mark.type.name === 'link')

                  if (hasLinkMark) {
                    return this.editor.chain().insertContent(' ').unsetMark('link').run()
                  }
                }
                return false
              },
            }
          },
        }),
        LinkPreview,
      ],
      content,
      editable: !disabled,
      autofocus: 'end',
      onUpdate: ({ editor }) => {
        const html = editor.getHTML()
        onChange(html)
      },
      onSelectionUpdate: ({ editor }) => {
        if (editor.isActive('codeBlock')) {
          const attrs = editor.getAttributes('codeBlock')

          setCodeBlockAttrs({
            language: attrs.language || null,
            filename: attrs.filename || null,
          })
        } else {
          setCodeBlockAttrs({ language: null, filename: null })
        }
      },
      editorProps: {
        attributes: {
          class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none',
        },
        handlePaste: (view, event) => {
          const text = event.clipboardData?.getData('text/plain')
          const codeBlockMatch = text?.match(CODEBLOCK_REGEX)

          if (codeBlockMatch) {
            event.preventDefault()

            const language = codeBlockMatch[1]
              ? codeBlockMatch[1] === 'markdown'
                ? 'md'
                : codeBlockMatch[1]
              : null
            let filename = codeBlockMatch[2] || null
            const code = codeBlockMatch[3]

            if (filename && language && !filename.includes('.')) {
              const extension =
                LANGUAGE_TO_EXTENSION[language as keyof typeof LANGUAGE_TO_EXTENSION]

              if (extension) {
                filename = `${filename}${extension}`
              }
            }

            view.dispatch(
              view.state.tr.replaceSelectionWith(
                view.state.schema.nodes.codeBlock.create(
                  { language, filename },
                  code ? view.state.schema.text(code) : undefined,
                ),
              ),
            )

            return true
          }

          if (text && isValidUrl(text)) {
            const { state } = view
            const { selection } = state
            const { $from } = selection

            if ($from.parent.textContent === '') {
              event.preventDefault()
              const linkPreviewNode = state.schema.nodes.linkPreview
              if (linkPreviewNode) {
                view.dispatch(state.tr.replaceSelectionWith(linkPreviewNode.create({ url: text })))
              }

              return true
            }
          }
          return false
        },
      },
    },
    [editorKey],
  )
}

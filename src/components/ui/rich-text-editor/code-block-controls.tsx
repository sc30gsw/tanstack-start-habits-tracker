import { Select, TextInput } from '@mantine/core'
import type { Editor } from '@tiptap/react'
import {
  LANGUAGE_DENORMALIZATION,
  LANGUAGE_OPTIONS,
  LANGUAGE_TO_EXTENSION,
} from '~/constants/rich-text-editor'

type CodeBlockControlsProps = {
  editor: Editor
  disabled: boolean
  codeBlockAttrs: {
    language: string | null
    filename: string | null
  }
}

export function CodeBlockControls({ editor, disabled, codeBlockAttrs }: CodeBlockControlsProps) {
  if (!editor.isActive('codeBlock')) {
    return null
  }

  return (
    <>
      <Select
        data={LANGUAGE_OPTIONS}
        value={
          codeBlockAttrs.language
            ? LANGUAGE_DENORMALIZATION[codeBlockAttrs.language] || codeBlockAttrs.language
            : 'null'
        }
        onChange={(value) => {
          if (!value || value === 'null') {
            editor.commands.updateAttributes('codeBlock', { language: null })
          } else {
            const normalizedValue = value === 'markdown' ? 'md' : value
            editor.commands.updateAttributes('codeBlock', { language: normalizedValue })

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
        placeholder="言語を選択"
        searchable
        nothingFoundMessage="言語が見つかりません"
        maxDropdownHeight={300}
        clearable
        styles={{
          input: {
            fontSize: '12px',
            height: '28px',
            minHeight: '28px',
          },
        }}
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
  )
}

import { ActionIcon, Tooltip } from '@mantine/core'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import type { NodeViewProps } from '@tiptap/react'
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import { useState } from 'react'

export function CodeBlockComponent({ node }: NodeViewProps) {
  const [copied, setCopied] = useState(false)

  const language = node.attrs.language
  const filename = node.attrs.filename

  const handleCopy = async () => {
    const code = node.textContent

    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  return (
    <NodeViewWrapper className="code-block-wrapper">
      <Tooltip
        label={copied ? 'コピーしました！' : 'コピー'}
        position="left"
        withArrow
        opened={copied ? true : undefined}
      >
        <ActionIcon
          variant="subtle"
          color={copied ? 'green' : 'gray'}
          size="sm"
          onClick={handleCopy}
          className="code-block-copy-button"
          data-copied={copied}
          style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}
        >
          {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
        </ActionIcon>
      </Tooltip>
      <pre data-language={language || undefined} data-filename={filename || undefined}>
        <NodeViewContent as="div" />
      </pre>
    </NodeViewWrapper>
  )
}

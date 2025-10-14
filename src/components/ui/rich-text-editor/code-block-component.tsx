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
      <button
        type="button"
        className={`code-block-copy-button ${copied ? 'copied' : ''}`}
        onClick={handleCopy}
        contentEditable={false}
      >
        {copied ? 'コピーしました！' : 'コピー'}
      </button>
      <pre data-language={language || undefined} data-filename={filename || undefined}>
        <NodeViewContent as="div" />
      </pre>
    </NodeViewWrapper>
  )
}

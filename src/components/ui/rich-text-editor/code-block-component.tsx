import { ActionIcon, Tooltip, useComputedColorScheme } from '@mantine/core'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import type { NodeViewProps } from '@tiptap/react'
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import { useEffect, useState } from 'react'
import { getHighlighter, SUPPORTED_LANGUAGES } from '~/lib/shiki-config'

export function CodeBlockComponent({ node }: NodeViewProps) {
  const [copied, setCopied] = useState(false)
  const [highlightedCode, setHighlightedCode] = useState<string>('')
  const computedColorScheme = useComputedColorScheme('light')

  const language = node.attrs.language
  const filename = node.attrs.filename
  const code = node.textContent

  useEffect(() => {
    const highlightCode = async () => {
      try {
        const highlighter = await getHighlighter()
        const lang = SUPPORTED_LANGUAGES.includes(language as any) ? language : 'javascript'
        const theme = computedColorScheme === 'dark' ? 'github-dark' : 'github-light'

        const html = highlighter.codeToHtml(code, {
          lang,
          theme,
        })

        setHighlightedCode(html)
      } catch (err) {
        console.error('Failed to highlight code:', err)
      }
    }

    if (code) {
      highlightCode()
    }
  }, [code, language, computedColorScheme])

  const handleCopy = async () => {
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
      {highlightedCode ? (
        <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
      ) : (
        <pre data-language={language || undefined} data-filename={filename || undefined}>
          <NodeViewContent as="div" />
        </pre>
      )}
    </NodeViewWrapper>
  )
}

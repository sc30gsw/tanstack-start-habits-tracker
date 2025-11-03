import type { Editor } from '@tiptap/react'

export function useLinkActions(editor: Editor | null) {
  const handleOpenLinkModal = (
    setLinkUrl: (url: string) => void,
    setLinkText: (text: string) => void,
    setLinkModalOpen: (open: boolean) => void,
  ) => {
    if (!editor) return

    const previousUrl = editor.getAttributes('link').href
    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to, '')

    setLinkUrl(previousUrl || '')
    setLinkText(selectedText.trim())
    setLinkModalOpen(true)
  }

  const handleSetLink = (
    linkUrl: string,
    linkText: string,
    setLinkModalOpen: (open: boolean) => void,
    setLinkUrl: (url: string) => void,
    setLinkText: (text: string) => void,
  ) => {
    if (!editor || !linkUrl) {
      setLinkModalOpen(false)
      return
    }

    const trimmedLinkText = linkText.trim()

    if (trimmedLinkText) {
      editor
        .chain()
        .focus()
        .deleteSelection()
        .insertContent({
          type: 'text',
          text: trimmedLinkText,
          marks: [{ type: 'link', attrs: { href: linkUrl } }],
        })
        .run()
    } else {
      const { from, to } = editor.state.selection
      const selectedText = editor.state.doc.textBetween(from, to, '').trim()

      if (selectedText) {
        editor
          .chain()
          .focus()
          .deleteSelection()
          .insertContent({
            type: 'text',
            text: selectedText,
            marks: [{ type: 'link', attrs: { href: linkUrl } }],
          })
          .run()
      } else {
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'text',
            text: linkUrl,
            marks: [{ type: 'link', attrs: { href: linkUrl } }],
          })
          .run()
      }
    }

    setLinkModalOpen(false)
    setLinkUrl('')
    setLinkText('')
  }

  const handleUnsetLink = () => {
    if (!editor) return
    editor.chain().focus().unsetLink().run()
  }

  return {
    handleOpenLinkModal,
    handleSetLink,
    handleUnsetLink,
  }
}

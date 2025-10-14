export function htmlToShareText(html: string) {
  if (!html) {
    return ''
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  let result = ''

  const processNode = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || ''
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return ''
    }

    const element = node as Element
    const tagName = element.tagName.toLowerCase()
    let text = ''

    // 子要素を処理
    for (const child of Array.from(element.childNodes)) {
      text += processNode(child)
    }

    // タグに応じた処理
    switch (tagName) {
      case 'p':
        return `${text}\n`
      case 'br':
        return '\n'
      case 'strong':
      case 'b':
        return `**${text}**`
      case 'em':
      case 'i':
        return `*${text}*`
      case 'code':
        return `\`${text}\``
      case 'a': {
        const href = element.getAttribute('href')
        return href ? `${text} (${href})` : text
      }
      case 'ul':
      case 'ol':
        return `${text}\n`
      case 'li':
        return `• ${text}\n`
      case 'h1':
      case 'h2':
      case 'h3':
        return `${text}\n`
      default:
        return text
    }
  }

  result = processNode(doc.body)

  return result.replace(/\n{3,}/g, '\n\n').trim()
}

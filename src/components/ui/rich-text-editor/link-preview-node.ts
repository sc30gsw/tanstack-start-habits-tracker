import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { LinkPreviewComponent } from '~/components/ui/rich-text-editor/link-preview-component'

export interface LinkPreviewOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    linkPreview: {
      setLinkPreview: (options: { url: string }) => ReturnType
    }
  }
}

export const LinkPreview = Node.create<LinkPreviewOptions>({
  name: 'linkPreview',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      url: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-url'),
        renderHTML: (attributes) => {
          if (!attributes.url) {
            return {}
          }

          return {
            'data-url': attributes.url,
          }
        },
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-title'),
        renderHTML: (attributes) => {
          if (!attributes.title) {
            return {}
          }

          return {
            'data-title': attributes.title,
          }
        },
      },
      description: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-description'),
        renderHTML: (attributes) => {
          if (!attributes.description) {
            return {}
          }

          return {
            'data-description': attributes.description,
          }
        },
      },
      image: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-image'),
        renderHTML: (attributes) => {
          if (!attributes.image) {
            return {}
          }

          return {
            'data-image': attributes.image,
          }
        },
      },
      siteName: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-site-name'),
        renderHTML: (attributes) => {
          if (!attributes.siteName) {
            return {}
          }

          return {
            'data-site-name': attributes.siteName,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="link-preview"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'link-preview' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(LinkPreviewComponent)
  },

  addCommands() {
    return {
      setLinkPreview:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },
})

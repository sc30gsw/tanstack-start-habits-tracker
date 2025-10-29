import { mergeAttributes, Node } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'

export interface CodeBlockShikiOptions {
  defaultTheme: string
  HTMLAttributes: Record<string, unknown>
  languageClassPrefix: string
}

export const CodeBlockShikiExtension = Node.create<CodeBlockShikiOptions>({
  name: 'codeBlock',
  content: 'text*',
  marks: '',
  group: 'block',
  code: true,
  defining: true,

  addOptions() {
    return {
      defaultTheme: 'github-light',
      HTMLAttributes: {},
      languageClassPrefix: 'language-',
    }
  },

  addAttributes() {
    return {
      language: {
        default: null,
        parseHTML: (element) => {
          const { languageClassPrefix } = this.options
          const classNames = [...(element.firstElementChild?.classList || [])]
          const languages = classNames
            .filter((className) => className.startsWith(languageClassPrefix))
            .map((className) => className.replace(languageClassPrefix, ''))
          const language = languages[0]

          if (!language) {
            return null
          }

          return language
        },
        rendered: false,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'pre',
        preserveWhitespace: 'full',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'pre',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      [
        'code',
        {
          class: node.attrs.language
            ? this.options.languageClassPrefix + node.attrs.language
            : null,
        },
        0,
      ],
    ]
  },

  addCommands() {
    return {
      setCodeBlock:
        (attributes) =>
        ({ commands }) => {
          return commands.setNode(this.name, attributes)
        },
      toggleCodeBlock:
        (attributes) =>
        ({ commands }) => {
          return commands.toggleNode(this.name, 'paragraph', attributes)
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-c': () => this.editor.commands.toggleCodeBlock(),
      // Remove code block when at start and pressing backspace
      Backspace: () => {
        const { empty, $anchor } = this.editor.state.selection
        const isAtStart = $anchor.pos === 1

        if (!empty || $anchor.parent.type.name !== this.name) {
          return false
        }

        if (isAtStart || !$anchor.parent.textContent.length) {
          return this.editor.commands.clearNodes()
        }

        return false
      },
      // Exit code block when at end and pressing Enter
      Enter: ({ editor }) => {
        const { state } = editor
        const { selection } = state
        const { $from, empty } = selection

        if (!empty || $from.parent.type !== this.type) {
          return false
        }

        const isAtEnd = $from.parentOffset === $from.parent.nodeSize - 2

        if (!isAtEnd) {
          return false
        }

        const { tr } = state
        const above = $from.node(-1)
        const type = above.type.contentMatch.defaultType?.create()

        if (!type) {
          return false
        }

        tr.insert($from.after(), type)
        const pos = tr.doc.resolve($from.after() + 1)
        tr.setSelection(TextSelection.near(pos))
        editor.view.dispatch(tr)

        return true
      },
    }
  },
})

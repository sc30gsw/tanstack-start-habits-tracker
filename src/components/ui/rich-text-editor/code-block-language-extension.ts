import { Extension } from '@tiptap/core'

export const CodeBlockLanguageExtension = Extension.create({
  name: 'codeBlockLanguage',

  addGlobalAttributes() {
    return [
      {
        types: ['codeBlock'],
        attributes: {
          language: {
            default: null,
            parseHTML: (element) =>
              element.getAttribute('data-language') || element.className.replace('language-', ''),
            renderHTML: (attributes) => {
              if (!attributes.language) {
                return {}
              }

              return {
                'data-language': attributes.language,
                class: `language-${attributes.language}`,
              }
            },
          },
          filename: {
            default: null,
            parseHTML: (element) => element.getAttribute('data-filename'),
            renderHTML: (attributes) => {
              if (!attributes.filename) {
                return {}
              }

              return {
                'data-filename': attributes.filename,
              }
            },
          },
        },
      },
    ]
  },
})

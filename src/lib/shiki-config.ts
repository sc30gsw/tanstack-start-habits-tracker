import type { HighlighterCore } from 'shiki'

let highlighterInstance: HighlighterCore | null = null

export async function getHighlighter(): Promise<HighlighterCore> {
  if (highlighterInstance) {
    return highlighterInstance
  }

  const { createHighlighterCore, createOnigurumaEngine } = await import('shiki/core')

  // 必要な言語のみを動的インポート
  const [
    javascript,
    typescript,
    jsx,
    tsx,
    json,
    css,
    html,
    bash,
    python,
    sql,
    githubDark,
    githubLight,
  ] = await Promise.all([
    import('shiki/langs/javascript.mjs').then((m) => m.default),
    import('shiki/langs/typescript.mjs').then((m) => m.default),
    import('shiki/langs/jsx.mjs').then((m) => m.default),
    import('shiki/langs/tsx.mjs').then((m) => m.default),
    import('shiki/langs/json.mjs').then((m) => m.default),
    import('shiki/langs/css.mjs').then((m) => m.default),
    import('shiki/langs/html.mjs').then((m) => m.default),
    import('shiki/langs/bash.mjs').then((m) => m.default),
    import('shiki/langs/python.mjs').then((m) => m.default),
    import('shiki/langs/sql.mjs').then((m) => m.default),
    import('shiki/themes/github-dark.mjs').then((m) => m.default),
    import('shiki/themes/github-light.mjs').then((m) => m.default),
  ])

  highlighterInstance = await createHighlighterCore({
    themes: [githubDark, githubLight],
    langs: [javascript, typescript, jsx, tsx, json, css, html, bash, python, sql],
    engine: createOnigurumaEngine(import('shiki/wasm')),
  })

  return highlighterInstance
}

export const SUPPORTED_LANGUAGES = [
  'javascript',
  'typescript',
  'jsx',
  'tsx',
  'json',
  'css',
  'html',
  'bash',
  'python',
  'sql',
] as const satisfies readonly string[]

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

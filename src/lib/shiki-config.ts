import { createHighlighterCore } from 'shiki/core'
import bash from 'shiki/langs/bash.mjs'
import css from 'shiki/langs/css.mjs'
import html from 'shiki/langs/html.mjs'
import javascript from 'shiki/langs/javascript.mjs'
import json from 'shiki/langs/json.mjs'
import jsx from 'shiki/langs/jsx.mjs'
import python from 'shiki/langs/python.mjs'
import sql from 'shiki/langs/sql.mjs'
import tsx from 'shiki/langs/tsx.mjs'
import typescript from 'shiki/langs/typescript.mjs'
import githubDark from 'shiki/themes/github-dark.mjs'
import githubLight from 'shiki/themes/github-light.mjs'
import getWasm from 'shiki/wasm'

let highlighterInstance: Awaited<ReturnType<typeof createHighlighterCore>> | null = null

export async function getHighlighter() {
  if (highlighterInstance) {
    return highlighterInstance
  }

  highlighterInstance = await createHighlighterCore({
    themes: [githubDark, githubLight],
    langs: [javascript, typescript, jsx, tsx, json, css, html, bash, python, sql],
    loadWasm: getWasm,
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

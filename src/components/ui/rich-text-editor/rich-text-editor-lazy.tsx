import { Loader } from '@mantine/core'
import { lazy, Suspense } from 'react'

const RichTextEditorLazy = lazy(() =>
  import('./rich-text-editor').then((module) => ({
    default: module.RichTextEditor,
  })),
)

export function RichTextEditor(props: Parameters<typeof RichTextEditorLazy>[0]) {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <Loader />
        </div>
      }
    >
      <RichTextEditorLazy {...props} />
    </Suspense>
  )
}

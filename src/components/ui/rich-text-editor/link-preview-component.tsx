import { useQuery } from '@tanstack/react-query'
import type { NodeViewProps } from '@tiptap/react'
import { NodeViewWrapper } from '@tiptap/react'
import { useEffect, useState } from 'react'
import { LinkPreviewCard } from '~/components/ui/link-preview-card'
import { fetchOgpData } from '~/features/root/server/ogp-functions'

export function LinkPreviewComponent({ node, updateAttributes }: NodeViewProps) {
  const { url, title, description, image, siteName } = node.attrs as {
    url: string
    title?: string | null
    description?: string | null
    image?: string | null
    siteName?: string | null
  }
  const [shouldFetch, setShouldFetch] = useState(!title && !description && !image)

  const { data: ogpData, isLoading } = useQuery({
    queryKey: ['ogp', url],
    queryFn: async () => {
      const result = await fetchOgpData({ data: { url } })
      if (result.success) {
        return result.data
      }
      return null
    },
    enabled: shouldFetch && !!url,
    staleTime: 1000 * 60 * 60, // 1時間キャッシュ
  })

  useEffect(() => {
    if (ogpData && shouldFetch) {
      updateAttributes({
        title: ogpData.title,
        description: ogpData.description,
        image: ogpData.image,
        siteName: ogpData.siteName,
      })
      setShouldFetch(false)
    }
  }, [ogpData, shouldFetch, updateAttributes])

  return (
    <NodeViewWrapper>
      <LinkPreviewCard
        url={url}
        title={title || ogpData?.title}
        description={description || ogpData?.description}
        image={image || ogpData?.image}
        siteName={siteName || ogpData?.siteName}
        isLoading={isLoading && shouldFetch}
      />
    </NodeViewWrapper>
  )
}

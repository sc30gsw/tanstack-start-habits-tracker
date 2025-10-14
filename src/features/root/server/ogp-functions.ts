import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod/v4'

const fetchOgpDataSchema = z.object({
  url: z.url(),
})

type OgpData = {
  title: string | null
  description: string | null
  image: string | null
  siteName: string | null
  url: string
}

export const fetchOgpData = createServerFn({ method: 'GET' })
  .inputValidator(fetchOgpDataSchema)
  .handler(async ({ data }) => {
    try {
      const response = await fetch(data.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0)',
        },
      })

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to fetch URL: ${response.status}`,
        }
      }

      const html = await response.text()

      const ogpData = {
        title: extractMetaContent(html, 'og:title') || extractTitle(html),
        description:
          extractMetaContent(html, 'og:description') || extractMetaContent(html, 'description'),
        image: extractMetaContent(html, 'og:image'),
        siteName: extractMetaContent(html, 'og:site_name') || extractDomain(data.url),
        url: data.url,
      } as const satisfies OgpData

      return {
        success: true,
        data: ogpData,
      }
    } catch (error) {
      console.error('Error fetching OGP data:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  })

function extractMetaContent(html: string, property: string): string | null {
  const ogRegex = new RegExp(
    `<meta\\s+property=["']og:${property.replace('og:', '')}["']\\s+content=["']([^"']+)["']`,
    'i',
  )

  const ogMatch = html.match(ogRegex)

  if (ogMatch?.[1]) {
    return ogMatch[1]
  }

  const metaRegex = new RegExp(`<meta\\s+name=["']${property}["']\\s+content=["']([^"']+)["']`, 'i')
  const metaMatch = html.match(metaRegex)

  if (metaMatch?.[1]) {
    return metaMatch[1]
  }

  return null
}

function extractTitle(html: string) {
  const titleRegex = /<title>([^<]+)<\/title>/i
  const match = html.match(titleRegex)

  return match?.[1]?.trim() ?? null
}

function extractDomain(url: string) {
  try {
    const urlObj = new URL(url)

    return urlObj.hostname.replace('www.', '')
  } catch {
    return url
  }
}

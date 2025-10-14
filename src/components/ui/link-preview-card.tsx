import { Box, Group, Skeleton, Stack, Text, useComputedColorScheme } from '@mantine/core'
import { IconExternalLink } from '@tabler/icons-react'

type LinkPreviewCardProps = {
  url: string
  title?: string | null
  description?: string | null
  image?: string | null
  siteName?: string | null
  isLoading?: boolean
}

export function LinkPreviewCard({
  url,
  title,
  description,
  image,
  siteName,
  isLoading = false,
}: LinkPreviewCardProps) {
  const computedColorScheme = useComputedColorScheme('light')

  if (isLoading) {
    return (
      <Box
        style={{
          border:
            computedColorScheme === 'dark'
              ? '1px solid var(--mantine-color-dark-4)'
              : '1px solid var(--mantine-color-gray-3)',
          borderRadius: '8px',
          overflow: 'hidden',
          maxWidth: '500px',
          margin: '8px 0',
        }}
      >
        <Group gap={0} wrap="nowrap">
          <Skeleton height={120} width={120} />
          <Stack gap="xs" p="md" style={{ flex: 1 }}>
            <Skeleton height={20} width="80%" />
            <Skeleton height={16} width="100%" />
            <Skeleton height={14} width="60%" />
          </Stack>
        </Group>
      </Box>
    )
  }

  const displayUrl = new URL(url).hostname.replace('www.', '')

  return (
    <Box
      component="a"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        textDecoration: 'none',
        display: 'block',
        border:
          computedColorScheme === 'dark'
            ? '1px solid var(--mantine-color-dark-4)'
            : '1px solid var(--mantine-color-gray-3)',
        borderRadius: '8px',
        overflow: 'hidden',
        maxWidth: '500px',
        margin: '8px 0',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        backgroundColor:
          computedColorScheme === 'dark'
            ? 'var(--mantine-color-dark-6)'
            : 'var(--mantine-color-white)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow =
          computedColorScheme === 'dark'
            ? '0 4px 12px rgba(0, 0, 0, 0.3)'
            : '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <Group gap={0} wrap="nowrap" align="stretch">
        {image && (
          <Box
            style={{
              width: '120px',
              minWidth: '120px',
              height: '120px',
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor:
                computedColorScheme === 'dark'
                  ? 'var(--mantine-color-dark-5)'
                  : 'var(--mantine-color-gray-1)',
            }}
          />
        )}
        <Stack gap="xs" p="md" style={{ flex: 1, minWidth: 0 }}>
          {title && (
            <Text
              size="sm"
              fw={600}
              lineClamp={2}
              c={computedColorScheme === 'dark' ? 'gray.1' : 'dark.8'}
            >
              {title}
            </Text>
          )}
          {description && (
            <Text size="xs" c="dimmed" lineClamp={2}>
              {description}
            </Text>
          )}
          <Group gap="xs" align="center">
            <Text size="xs" c="dimmed">
              {siteName || displayUrl}
            </Text>
            <IconExternalLink size={12} color="var(--mantine-color-dimmed)" />
          </Group>
        </Stack>
      </Group>
    </Box>
  )
}

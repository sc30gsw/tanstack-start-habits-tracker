import { Anchor, Container, Divider, Group, Image, Stack, Text } from '@mantine/core'
import { IconBrandGithub, IconBrandTwitter } from '@tabler/icons-react'

export function LandingFooter() {
  return (
    <Container
      fluid
      style={{
        backgroundColor: '#1a1a1a',
        padding: '60px 0 30px',
        color: 'white',
      }}
    >
      <Container size="lg">
        <Stack gap="xl">
          <Group justify="space-between" align="flex-start" wrap="wrap">
            {/* Logo & Tagline */}
            <Stack gap="sm">
              <Group gap="xs" align="center">
                <Image src="/logo192.png" alt="Track Logo" w={40} h={40} fit="contain" />
                <Text
                  size="xl"
                  fw={700}
                  style={{
                    fontSize: '1.5rem',
                    background: 'linear-gradient(90deg, #4a90e2 0%, #50c9ce 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Track
                </Text>
              </Group>
              <Text size="sm" c="dimmed" style={{ color: '#b0b0b0', maxWidth: '300px' }}>
                習慣を追跡。継続を可視化。
              </Text>
            </Stack>

            {/* Links */}
            <Group gap="xl" wrap="wrap">
              <Stack gap="sm">
                <Text size="sm" fw={600} c="white">
                  製品
                </Text>
                <Anchor href="#features" size="sm" c="dimmed" style={{ color: '#b0b0b0' }}>
                  機能
                </Anchor>
                <Anchor href="#how-it-works" size="sm" c="dimmed" style={{ color: '#b0b0b0' }}>
                  使い方
                </Anchor>
              </Stack>

              <Stack gap="sm">
                <Text size="sm" fw={600} c="white">
                  サポート
                </Text>
                <Anchor href="/privacy" size="sm" c="dimmed" style={{ color: '#b0b0b0' }}>
                  プライバシー
                </Anchor>
                <Anchor href="/terms" size="sm" c="dimmed" style={{ color: '#b0b0b0' }}>
                  利用規約
                </Anchor>
              </Stack>

              <Stack gap="sm">
                <Text size="sm" fw={600} c="white">
                  ソーシャル
                </Text>
                <Group gap="sm">
                  <Anchor href="https://github.com" target="_blank" c="dimmed">
                    <IconBrandGithub size={20} style={{ color: '#b0b0b0' }} />
                  </Anchor>
                  <Anchor href="https://twitter.com" target="_blank" c="dimmed">
                    <IconBrandTwitter size={20} style={{ color: '#b0b0b0' }} />
                  </Anchor>
                </Group>
              </Stack>
            </Group>
          </Group>

          <Divider color="#333" />

          <Group justify="space-between" align="center" wrap="wrap">
            <Text size="sm" c="dimmed" style={{ color: '#888' }}>
              © 2025 Track. All rights reserved.
            </Text>
            <Text size="xs" c="dimmed" style={{ color: '#666' }}>
              Made with ❤️ using TanStack Start & Mantine UI
            </Text>
          </Group>
        </Stack>
      </Container>
    </Container>
  )
}

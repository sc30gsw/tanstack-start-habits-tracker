import { Anchor, Box, Container, Divider, Group, Stack, Text, Title } from '@mantine/core'
import { IconBrandGithub, IconBrandLinkedin, IconBrandTwitter } from '@tabler/icons-react'

export function LandingFooter() {
  return (
    <Container
      fluid
      style={{
        background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
        padding: '120px 0 40px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid #2a2a2a',
      }}
    >
      {/* Background decoration */}
      <Box
        style={{
          position: 'absolute',
          top: '-50%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(74, 144, 226, 0.05), transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(100px)',
        }}
      />

      <Container size="xl" style={{ position: 'relative', zIndex: 1 }}>
        <Stack gap="4rem">
          {/* Main Footer Content */}
          <Stack gap="3rem">
            {/* Large Tagline */}
            <Stack align="center" gap="md">
              <Title
                order={2}
                style={{
                  fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                  fontWeight: 800,
                  color: 'white',
                  textAlign: 'center',
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                }}
              >
                習慣を追跡。
              </Title>
              <Title
                order={3}
                style={{
                  fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #888 0%, #555 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}
              >
                継続を可視化。
              </Title>
            </Stack>

            {/* Links & Social */}
            <Group justify="center" gap="4rem" wrap="wrap">
              {/* Social Icons */}
              <Group gap="lg">
                <Anchor
                  href="https://linkedin.com"
                  target="_blank"
                  style={{
                    color: '#888',
                    transition: 'color 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#4a90e2'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#888'
                  }}
                >
                  <IconBrandLinkedin size={28} stroke={1.5} />
                </Anchor>
                <Anchor
                  href="https://twitter.com"
                  target="_blank"
                  style={{
                    color: '#888',
                    transition: 'color 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#4a90e2'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#888'
                  }}
                >
                  <IconBrandTwitter size={28} stroke={1.5} />
                </Anchor>
                <Anchor
                  href="https://github.com"
                  target="_blank"
                  style={{
                    color: '#888',
                    transition: 'color 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#4a90e2'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#888'
                  }}
                >
                  <IconBrandGithub size={28} stroke={1.5} />
                </Anchor>
              </Group>

              {/* Footer Links */}
              <Group gap="2rem">
                <Anchor
                  href="/contact"
                  style={{
                    color: '#888',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ccc'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#888'
                  }}
                >
                  CONTACT US
                </Anchor>
                <Anchor
                  href="/privacy"
                  style={{
                    color: '#888',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ccc'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#888'
                  }}
                >
                  PRIVACY
                </Anchor>
                <Anchor
                  href="/terms"
                  style={{
                    color: '#888',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ccc'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#888'
                  }}
                >
                  TERMS
                </Anchor>
              </Group>
            </Group>
          </Stack>

          <Divider color="#2a2a2a" />

          {/* Bottom Bar */}
          <Group justify="space-between" align="center" wrap="wrap">
            <Text
              size="sm"
              style={{
                color: '#666',
                fontSize: '0.9rem',
                letterSpacing: '0.05em',
              }}
            >
              © TRACK 2025
            </Text>
            <Anchor
              href="/"
              style={{
                color: '#888',
                fontSize: '0.9rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'color 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ccc'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#888'
              }}
            >
              ホームに戻る
            </Anchor>
          </Group>
        </Stack>
      </Container>
    </Container>
  )
}

import { Box, Button, Container, Group, Image, Stack, Text, Title } from '@mantine/core'
import { Link } from '@tanstack/react-router'

export function HeroSection() {
  return (
    <Container
      fluid
      style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box
        style={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(74, 144, 226, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(100px)',
        }}
      />

      <Container size="lg" style={{ position: 'relative', zIndex: 1 }}>
        <Stack align="center" gap="xl" py="xl">
          {/* Logo */}
          <Image
            src="/logo192.png"
            alt="Track Logo"
            w={120}
            h={120}
            fit="contain"
            style={{
              filter: 'drop-shadow(0 8px 16px rgba(74, 144, 226, 0.3))',
            }}
          />

          <Stack align="center" gap="md" style={{ maxWidth: '800px' }}>
            <Title
              order={1}
              style={{
                fontSize: 'clamp(3rem, 8vw, 5rem)',
                fontWeight: 700,
                color: 'white',
                textAlign: 'center',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              習慣を追跡。
            </Title>
            <Title
              order={2}
              style={{
                fontSize: 'clamp(2rem, 6vw, 4rem)',
                fontWeight: 600,
                color: '#e0e0e0',
                textAlign: 'center',
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
              }}
            >
              継続を可視化。
            </Title>
            <Text
              size="xl"
              c="dimmed"
              style={{
                textAlign: 'center',
                maxWidth: '600px',
                fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                color: '#b0b0b0',
                marginTop: '1rem',
              }}
            >
              Trackは日々の習慣を記録し、ヒートマップとカレンダーで継続状況を可視化します。
              シンプルで続けやすい習慣管理アプリです。
            </Text>
          </Stack>

          <Group gap="md" mt="xl">
            <Button
              component={Link}
              to="/auth/sign-up"
              size="xl"
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
              style={{
                fontSize: '1.1rem',
                padding: '1.5rem 3rem',
                borderRadius: '50px',
                boxShadow: '0 8px 24px rgba(74, 144, 226, 0.3)',
                transition: 'all 0.3s ease',
              }}
              styles={{
                root: {
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 32px rgba(74, 144, 226, 0.4)',
                  },
                },
              }}
            >
              無料で始める
            </Button>
            <Button
              component={Link}
              to="/auth/sign-in"
              size="xl"
              variant="outline"
              color="gray"
              style={{
                fontSize: '1.1rem',
                padding: '1.5rem 3rem',
                borderRadius: '50px',
                borderColor: '#555',
                color: 'white',
                transition: 'all 0.3s ease',
              }}
              styles={{
                root: {
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: '#888',
                  },
                },
              }}
            >
              ログイン
            </Button>
          </Group>
        </Stack>
      </Container>
    </Container>
  )
}

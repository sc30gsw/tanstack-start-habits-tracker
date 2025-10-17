import { Box, Button, Container, Group, Stack, Text, Title } from '@mantine/core'
import { Link } from '@tanstack/react-router'

export function HeroSection() {
  return (
    <Container
      fluid
      style={{
        background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 3D Floating Spheres */}
      <Box
        style={{
          position: 'absolute',
          top: '10%',
          right: '15%',
          width: '400px',
          height: '400px',
          background:
            'radial-gradient(circle at 30% 30%, rgba(74, 144, 226, 0.4), rgba(74, 144, 226, 0.1) 50%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'float 8s ease-in-out infinite',
        }}
      />
      <Box
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '10%',
          width: '500px',
          height: '500px',
          background:
            'radial-gradient(circle at 40% 40%, rgba(56, 189, 248, 0.3), rgba(56, 189, 248, 0.08) 50%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          animation: 'float 10s ease-in-out infinite 2s',
        }}
      />
      <Box
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background:
            'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15), transparent 60%)',
          borderRadius: '50%',
          filter: 'blur(120px)',
          animation: 'pulse 6s ease-in-out infinite',
        }}
      />

      <Container size="xl" style={{ position: 'relative', zIndex: 1 }}>
        <Stack align="center" gap="xl" py="xl">
          <Stack align="center" gap="lg" style={{ maxWidth: '1200px' }}>
            {/* Main Heading - Ultra Large */}
            <Title
              order={1}
              style={{
                fontSize: 'clamp(4rem, 12vw, 10rem)',
                fontWeight: 800,
                color: 'white',
                textAlign: 'center',
                lineHeight: 1,
                letterSpacing: '-0.04em',
                marginBottom: '0.5rem',
              }}
            >
              習慣を追跡。
            </Title>

            {/* Sub Heading */}
            <Title
              order={2}
              style={{
                fontSize: 'clamp(2.5rem, 7vw, 6rem)',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #e0e0e0 0%, #888888 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textAlign: 'center',
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
              }}
            >
              継続を可視化。
            </Title>

            {/* Description */}
            <Text
              size="xl"
              style={{
                textAlign: 'center',
                maxWidth: '700px',
                fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
                color: '#a0a0a0',
                marginTop: '2rem',
                lineHeight: 1.6,
                fontWeight: 400,
              }}
            >
              Trackは、すべてを一元化する習慣追跡アプリ。
              <br />
              日々の習慣を記録し、ヒートマップとカレンダーで継続状況を可視化します。
            </Text>
          </Stack>

          {/* CTA Buttons */}
          <Group gap="lg" mt="3rem">
            <Button
              component={Link}
              to="/auth/sign-up"
              size="xl"
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
              style={{
                fontSize: '1.2rem',
                padding: '2rem 4rem',
                borderRadius: '60px',
                boxShadow: '0 12px 40px rgba(74, 144, 226, 0.4)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontWeight: 700,
              }}
              styles={{
                root: {
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 16px 48px rgba(74, 144, 226, 0.6)',
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
              style={{
                fontSize: '1.2rem',
                padding: '2rem 4rem',
                borderRadius: '60px',
                borderColor: '#444',
                color: '#e0e0e0',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontWeight: 600,
              }}
              styles={{
                root: {
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderColor: '#666',
                    transform: 'translateY(-2px)',
                  },
                },
              }}
            >
              ログイン
            </Button>
          </Group>

          {/* Trust Badge */}
          <Text
            size="sm"
            style={{
              color: '#666',
              marginTop: '2rem',
              fontSize: '0.95rem',
              letterSpacing: '0.05em',
            }}
          >
            クレジットカード不要 • 1分で登録完了
          </Text>
        </Stack>
      </Container>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-30px) scale(1.05);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }
      `}</style>
    </Container>
  )
}

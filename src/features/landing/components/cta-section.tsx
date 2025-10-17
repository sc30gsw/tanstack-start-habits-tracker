import { Box, Container, Stack, Text, Title } from '@mantine/core'
import { Link } from '@tanstack/react-router'

export function CTASection() {
  return (
    <Container
      fluid
      style={{
        background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)',
        padding: '120px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 3D Sphere Decorations */}
      <Box
        style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '500px',
          height: '500px',
          background:
            'radial-gradient(circle at 40% 40%, rgba(74, 144, 226, 0.15), transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          animation: 'pulse 6s ease-in-out infinite',
        }}
      />
      <Box
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: '400px',
          height: '400px',
          background:
            'radial-gradient(circle at 60% 60%, rgba(56, 189, 248, 0.12), transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          animation: 'pulse 8s ease-in-out infinite 2s',
        }}
      />

      <Container size="lg" style={{ position: 'relative', zIndex: 1 }}>
        <Stack align="center" gap="xl">
          <Stack align="center" gap="md" style={{ maxWidth: '800px' }}>
            <Text
              size="sm"
              style={{
                color: '#4a90e2',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                fontWeight: 600,
                marginBottom: '1rem',
              }}
            >
              始めましょう
            </Text>
            <Title
              order={2}
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                fontWeight: 800,
                color: 'white',
                textAlign: 'center',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              早期アクセスに参加
            </Title>
            <Text
              size="xl"
              style={{
                textAlign: 'center',
                color: '#b0b0b0',
                fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
                maxWidth: '600px',
                marginTop: '1rem',
              }}
            >
              無料アカウントを作成して、習慣形成の旅を始めましょう。
              <br />
              登録は1分で完了します。
            </Text>
          </Stack>

          <Link
            to="/auth/sign-up"
            className="hover:-translate-y-1.5 mt-8 inline-block rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-10 py-5 font-bold text-lg text-white shadow-[0_16px_48px_rgba(74,144,226,0.5)] transition-all duration-300 ease-out hover:scale-105 hover:shadow-[0_20px_60px_rgba(74,144,226,0.6)] md:px-16 md:py-7 md:text-xl"
          >
            無料で始める
          </Link>

          <Text
            size="sm"
            style={{
              color: '#666',
              marginTop: '2rem',
              fontSize: '0.95rem',
              letterSpacing: '0.05em',
            }}
          >
            クレジットカード不要 • いつでもキャンセル可能
          </Text>
        </Stack>
      </Container>

      {/* CSS Animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }
      `}</style>
    </Container>
  )
}

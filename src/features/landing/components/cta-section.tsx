import { Box, Button, Container, Stack, Text, Title } from '@mantine/core'
import { Link } from '@tanstack/react-router'

export function CTASection() {
  return (
    <Container
      fluid
      style={{
        background: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)',
        padding: '100px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '1000px',
          height: '1000px',
          background: 'radial-gradient(circle, rgba(74, 144, 226, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(150px)',
        }}
      />

      <Container size="md" style={{ position: 'relative', zIndex: 1 }}>
        <Stack align="center" gap="xl">
          <Stack align="center" gap="md">
            <Title
              order={2}
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 700,
                color: 'white',
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              今日から始めよう
            </Title>
            <Text
              size="xl"
              c="dimmed"
              style={{
                textAlign: 'center',
                color: '#b0b0b0',
                maxWidth: '600px',
              }}
            >
              無料アカウントを作成して、習慣形成の旅を始めましょう。 登録は1分で完了します。
            </Text>
          </Stack>

          <Button
            component={Link}
            to="/auth/sign-up"
            size="xl"
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
            style={{
              fontSize: '1.2rem',
              padding: '1.75rem 4rem',
              borderRadius: '50px',
              boxShadow: '0 12px 32px rgba(74, 144, 226, 0.4)',
              marginTop: '1rem',
            }}
            styles={{
              root: {
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 16px 40px rgba(74, 144, 226, 0.5)',
                },
              },
            }}
          >
            無料で始める
          </Button>

          <Text size="sm" c="dimmed" style={{ color: '#888', marginTop: '1rem' }}>
            クレジットカード不要 • いつでもキャンセル可能
          </Text>
        </Stack>
      </Container>
    </Container>
  )
}

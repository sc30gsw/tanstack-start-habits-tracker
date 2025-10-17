import { Box, Container, Grid, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { type Icon, IconChartLine, IconCheck, IconFlame } from '@tabler/icons-react'

const FEATURES = [
  {
    icon: IconCheck,
    title: '簡単な記録',
    description:
      'ワンクリックで習慣を記録。時間追跡も可能で、どれだけ取り組んだかを正確に把握できます。',
    color: '#10b981',
  },
  {
    icon: IconChartLine,
    title: '視覚的な継続',
    description:
      'ヒートマップとカレンダーで継続状況を一目で確認。GitHubスタイルの視覚化で、モチベーションを維持します。',
    color: '#4a90e2',
  },
  {
    icon: IconFlame,
    title: 'モチベーション維持',
    description:
      '継続日数とレベルシステムで達成感を実感。バッジコレクションで楽しく習慣を続けられます。',
    color: '#f59e0b',
  },
] as const satisfies readonly { icon: Icon; title: string; description: string; color: string }[]

export function FeaturesSection() {
  return (
    <Container
      fluid
      style={{
        background: '#fafafa',
        padding: '120px 0',
      }}
    >
      <Container size="xl">
        <Stack align="center" gap="xl">
          <Stack align="center" gap="md" style={{ maxWidth: '700px' }}>
            <Title
              order={2}
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 800,
                textAlign: 'center',
                color: '#1a1a1a',
                letterSpacing: '-0.02em',
              }}
            >
              習慣形成を、もっとシンプルに
            </Title>
            <Text
              size="lg"
              style={{
                textAlign: 'center',
                color: '#666',
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              }}
            >
              Trackは習慣の記録と可視化に特化した、シンプルで使いやすいアプリです
            </Text>
          </Stack>

          <Grid gutter="xl" mt="3rem" style={{ width: '100%' }}>
            {FEATURES.map((feature, index) => (
              <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4 }}>
                <Box
                  style={{
                    height: '100%',
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    padding: '2.5rem 2rem',
                    border: '1px solid #e5e5e5',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'default',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-12px) rotateX(2deg)'
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.12)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) rotateX(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Background gradient */}
                  <Box
                    style={{
                      position: 'absolute',
                      top: '-50%',
                      right: '-30%',
                      width: '200px',
                      height: '200px',
                      background: `radial-gradient(circle, ${feature.color}20, transparent 70%)`,
                      borderRadius: '50%',
                      filter: 'blur(60px)',
                    }}
                  />

                  <Stack gap="lg" style={{ position: 'relative', zIndex: 1 }}>
                    <ThemeIcon
                      size={80}
                      radius="lg"
                      style={{
                        backgroundColor: feature.color,
                        boxShadow: `0 8px 24px ${feature.color}40`,
                      }}
                    >
                      <feature.icon size={40} stroke={2} />
                    </ThemeIcon>
                    <Title
                      order={3}
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: '#1a1a1a',
                      }}
                    >
                      {feature.title}
                    </Title>
                    <Text size="md" style={{ color: '#666', lineHeight: 1.7 }}>
                      {feature.description}
                    </Text>
                  </Stack>
                </Box>
              </Grid.Col>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Container>
  )
}

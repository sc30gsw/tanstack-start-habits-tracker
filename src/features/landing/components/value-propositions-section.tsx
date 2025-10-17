import { Box, Container, Grid, Group, Stack, Text, Title } from '@mantine/core'
import { type Icon, IconBolt, IconLock, IconSparkles } from '@tabler/icons-react'

const VALUE_PROPS = [
  {
    number: '01',
    title: '高速パフォーマンス',
    subtitle: 'Built for speed',
    description:
      'すべてのタスクで超高速パフォーマンスを実現。待ち時間なし、ストレスフリーな操作体験。',
    icon: IconBolt,
    gradient: 'linear-gradient(135deg, #4a90e2 0%, #38bdf8 100%)',
  },
  {
    number: '02',
    title: '美しいデザイン',
    subtitle: 'Beautifully crafted',
    description:
      '目に優しく、使いやすく設計された洗練されたインターフェース。毎日使いたくなるデザイン。',
    icon: IconSparkles,
    gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
  },
  {
    number: '03',
    title: 'セキュア',
    subtitle: 'Optimally secure',
    description: 'エンタープライズグレードのセキュリティで、あなたのデータを安全に保護します。',
    icon: IconLock,
    gradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
  },
] as const satisfies readonly {
  number: string
  title: string
  subtitle: string
  description: string
  icon: Icon
  gradient: `linear-gradient(135deg, #${string} 0%, #${string} 100%)`
}[]

export function ValuePropositionsSection() {
  return (
    <Container
      fluid
      style={{
        background: '#fafafa',
        padding: '120px 0',
        position: 'relative',
      }}
    >
      <Container size="xl">
        <Stack align="center" gap="xl">
          {/* Section Header */}
          <Stack align="center" gap="md" style={{ maxWidth: '800px', marginBottom: '3rem' }}>
            <Title
              order={2}
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 800,
                color: '#1a1a1a',
                textAlign: 'center',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              Track は、あなたの働き方に合わせます
            </Title>
          </Stack>

          {/* Value Props Grid */}
          <Grid gutter="xl" style={{ width: '100%' }}>
            {VALUE_PROPS.map((prop, index) => (
              <Grid.Col key={index} span={{ base: 12, md: 4 }}>
                <Box
                  style={{
                    height: '100%',
                    backgroundColor: 'white',
                    borderRadius: '24px',
                    padding: '3rem 2rem',
                    border: '1px solid #e5e5e5',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'default',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)'
                    e.currentTarget.style.boxShadow = '0 24px 48px rgba(0, 0, 0, 0.12)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Background gradient on hover */}
                  <Box
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '200px',
                      height: '200px',
                      background: prop.gradient,
                      borderRadius: '50%',
                      filter: 'blur(100px)',
                      opacity: 0.1,
                      transition: 'opacity 0.4s ease',
                    }}
                  />

                  <Stack gap="xl" style={{ position: 'relative', zIndex: 1 }}>
                    {/* Icon and Number */}
                    <Group justify="space-between" align="flex-start">
                      <Box
                        style={{
                          width: '70px',
                          height: '70px',
                          background: prop.gradient,
                          borderRadius: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <prop.icon size={36} color="white" stroke={2} />
                      </Box>
                      <Text
                        style={{
                          fontSize: '3rem',
                          fontWeight: 700,
                          color: '#e5e5e5',
                          lineHeight: 1,
                        }}
                      >
                        {prop.number}
                      </Text>
                    </Group>

                    {/* Title and Subtitle */}
                    <Stack gap="xs">
                      <Title
                        order={3}
                        style={{
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          color: '#1a1a1a',
                        }}
                      >
                        {prop.title}
                      </Title>
                      <Text
                        size="sm"
                        style={{
                          color: '#666',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                        }}
                      >
                        [ {prop.subtitle} ]
                      </Text>
                    </Stack>

                    {/* Description */}
                    <Text size="md" style={{ color: '#666', lineHeight: 1.7 }}>
                      {prop.description}
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

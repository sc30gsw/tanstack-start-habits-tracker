import { Box, Container, Grid, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { IconCircleCheck, IconFlame, IconTrendingUp } from '@tabler/icons-react'

const STEPS = [
  {
    number: '01',
    title: '習慣を登録',
    description:
      '追跡したい習慣を作成します。名前、説明、カスタムカラーを設定して、あなただけの習慣リストを作りましょう。',
    icon: IconCircleCheck,
    color: '#4a90e2',
  },
  {
    number: '02',
    title: '毎日記録',
    description:
      '習慣を実行したら、ワンクリックで記録。取り組んだ時間も記録できるので、どれだけ頑張ったかが一目瞭然です。',
    icon: IconFlame,
    color: '#f59e0b',
  },
  {
    number: '03',
    title: '継続を可視化',
    description:
      'ヒートマップとカレンダーで継続状況を確認。視覚的なフィードバックがモチベーションを高め、習慣を続けやすくします。',
    icon: IconTrendingUp,
    color: '#10b981',
  },
] as const

export function HowItWorksSection() {
  return (
    <Container
      fluid
      style={{
        backgroundColor: '#fafafa',
        padding: '120px 0',
      }}
    >
      <Container size="xl">
        <Stack align="center" gap="xl">
          <Stack align="center" gap="md" style={{ maxWidth: '700px', marginBottom: '3rem' }}>
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
              使い方はシンプル
            </Title>
            <Text
              size="lg"
              style={{
                textAlign: 'center',
                color: '#666',
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              }}
            >
              3つのステップで、今日から習慣形成をスタート
            </Text>
          </Stack>

          <Stack gap="5rem" style={{ width: '100%', maxWidth: '1000px' }}>
            {STEPS.map((step, index) => (
              <Grid
                key={index}
                gutter="xl"
                align="center"
                style={{
                  flexDirection: index % 2 === 0 ? 'row' : 'row-reverse',
                }}
              >
                {/* Icon Side */}
                <Grid.Col span={{ base: 12, md: 5 }}>
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Box
                      style={{
                        width: '200px',
                        height: '200px',
                        background: `linear-gradient(135deg, ${step.color}20, ${step.color}05)`,
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        border: `2px solid ${step.color}30`,
                      }}
                    >
                      <ThemeIcon
                        size={100}
                        radius="xl"
                        style={{
                          backgroundColor: step.color,
                          boxShadow: `0 12px 32px ${step.color}40`,
                        }}
                      >
                        <step.icon size={50} stroke={2} />
                      </ThemeIcon>

                      {/* Step Number Badge */}
                      <Box
                        style={{
                          position: 'absolute',
                          top: '-15px',
                          right: '-15px',
                          width: '60px',
                          height: '60px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `3px solid ${step.color}`,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: '1.5rem',
                            fontWeight: 800,
                            color: step.color,
                          }}
                        >
                          {step.number}
                        </Text>
                      </Box>
                    </Box>
                  </Box>
                </Grid.Col>

                {/* Content Side */}
                <Grid.Col span={{ base: 12, md: 7 }}>
                  <Stack gap="md" style={{ textAlign: index % 2 === 0 ? 'left' : 'right' }}>
                    <Title
                      order={3}
                      style={{
                        fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                        fontWeight: 700,
                        color: '#1a1a1a',
                      }}
                    >
                      {step.title}
                    </Title>
                    <Text
                      size="lg"
                      style={{
                        color: '#666',
                        lineHeight: 1.8,
                        fontSize: 'clamp(1rem, 2vw, 1.1rem)',
                      }}
                    >
                      {step.description}
                    </Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Container>
  )
}

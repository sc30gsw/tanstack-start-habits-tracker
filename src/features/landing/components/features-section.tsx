import {
  Card,
  Container,
  Grid,
  type MantineColor,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core'
import { type Icon, IconChartLine, IconCheck, IconFlame } from '@tabler/icons-react'

const FEATURES = [
  {
    icon: IconCheck,
    title: '簡単な記録',
    description:
      'ワンクリックで習慣を記録。時間追跡も可能で、どれだけ取り組んだかを正確に把握できます。',
    color: 'green',
  },
  {
    icon: IconChartLine,
    title: '視覚的な継続',
    description:
      'ヒートマップとカレンダーで継続状況を一目で確認。GitHubスタイルの視覚化で、モチベーションを維持します。',
    color: 'blue',
  },
  {
    icon: IconFlame,
    title: 'モチベーション維持',
    description:
      '継続日数とレベルシステムで達成感を実感。バッジコレクションで楽しく習慣を続けられます。',
    color: 'orange',
  },
] as const satisfies { icon: Icon; title: string; description: string; color: MantineColor }[]

export function FeaturesSection() {
  return (
    <Container size="lg" py={80}>
      <Stack align="center" gap="xl">
        <Stack align="center" gap="md" style={{ maxWidth: '700px' }}>
          <Title
            order={2}
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 700,
              textAlign: 'center',
              color: '#1a1a1a',
            }}
          >
            習慣形成を、もっとシンプルに
          </Title>
          <Text size="lg" c="dimmed" style={{ textAlign: 'center' }}>
            Trackは習慣の記録と可視化に特化した、シンプルで使いやすいアプリです
          </Text>
        </Stack>

        <Grid gutter="xl" mt="xl" style={{ width: '100%' }}>
          {FEATURES.map((feature, index) => (
            <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4 }}>
              <Card
                padding="xl"
                radius="md"
                withBorder
                style={{
                  height: '100%',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
                    },
                  },
                }}
              >
                <Stack gap="md">
                  <ThemeIcon size={60} radius="md" variant="light" color={feature.color}>
                    <feature.icon size={32} />
                  </ThemeIcon>
                  <Title order={3} size="h4" fw={600}>
                    {feature.title}
                  </Title>
                  <Text c="dimmed" size="sm">
                    {feature.description}
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Stack>
    </Container>
  )
}

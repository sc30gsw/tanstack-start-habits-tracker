import { Box, Container, Stack, Text, Timeline, Title } from '@mantine/core'
import { IconCircle1, IconCircle2, IconCircle3 } from '@tabler/icons-react'

export function HowItWorksSection() {
  return (
    <Container
      fluid
      style={{
        backgroundColor: '#f8f9fa',
        padding: '80px 0',
      }}
    >
      <Container size="lg">
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
              使い方はシンプル
            </Title>
            <Text size="lg" c="dimmed" style={{ textAlign: 'center' }}>
              3つのステップで、今日から習慣形成をスタート
            </Text>
          </Stack>

          <Box mt="xl" style={{ width: '100%', maxWidth: '600px' }}>
            <Timeline
              active={2}
              bulletSize={60}
              lineWidth={3}
              color="blue"
              styles={{
                itemBullet: {
                  boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)',
                },
              }}
            >
              <Timeline.Item
                bullet={<IconCircle1 size={24} />}
                title={
                  <Title order={3} size="h4" fw={600} mb="xs">
                    習慣を登録
                  </Title>
                }
              >
                <Text c="dimmed" size="sm">
                  追跡したい習慣を作成します。名前、説明、カスタムカラーを設定して、あなただけの習慣リストを作りましょう。
                </Text>
              </Timeline.Item>

              <Timeline.Item
                bullet={<IconCircle2 size={24} />}
                title={
                  <Title order={3} size="h4" fw={600} mb="xs">
                    毎日記録
                  </Title>
                }
              >
                <Text c="dimmed" size="sm">
                  習慣を実行したら、ワンクリックで記録。取り組んだ時間も記録できるので、どれだけ頑張ったかが一目瞭然です。
                </Text>
              </Timeline.Item>

              <Timeline.Item
                bullet={<IconCircle3 size={24} />}
                title={
                  <Title order={3} size="h4" fw={600} mb="xs">
                    継続を可視化
                  </Title>
                }
              >
                <Text c="dimmed" size="sm">
                  ヒートマップとカレンダーで継続状況を確認。視覚的なフィードバックがモチベーションを高め、習慣を続けやすくします。
                </Text>
              </Timeline.Item>
            </Timeline>
          </Box>
        </Stack>
      </Container>
    </Container>
  )
}

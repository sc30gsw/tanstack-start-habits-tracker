import { Alert, Card, Stack, Text, Title } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <Stack gap="lg">
      <Title order={2}>設定 (プレースホルダ)</Title>
      <Card withBorder padding="lg">
        <Stack gap="sm">
          <Text c="dimmed" size="sm">
            この画面は Story6 の「ミニマルUIデザイン」/ 設定機能 実装前のプレースホルダです。
          </Text>
          <Alert color="blue" title="予定機能">
            - テーマ切替 (light/dark)\n- 既定ビュー (calendar / heatmap)\n- 週開始曜日 /
            表示オプション
          </Alert>
        </Stack>
      </Card>
    </Stack>
  )
}

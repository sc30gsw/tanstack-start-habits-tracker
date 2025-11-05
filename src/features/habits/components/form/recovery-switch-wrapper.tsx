import { Alert, Card, Stack, Text } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'
import type { ReactNode } from 'react'

export function RecoverySwitchWrapper({ children }: Record<'children', ReactNode>) {
  return (
    <Card withBorder padding="md" radius="md">
      <Stack gap="md">
        <Alert
          color="blue"
          title="リカバリー試行の記録"
          icon={<IconInfoCircle stroke={2} />}
          variant="light"
        >
          <Text size="sm">
            この記録はスキップした習慣のリカバリー試行です。
            <br />
            実際に習慣を実行できたかどうかを記録してください。
          </Text>
        </Alert>

        {children}
      </Stack>
    </Card>
  )
}

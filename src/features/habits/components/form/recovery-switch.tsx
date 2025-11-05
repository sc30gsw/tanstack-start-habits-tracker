import { Alert, Card, Group, Stack, Switch, Text } from '@mantine/core'
import { IconCircleCheck, IconCircleX, IconInfoCircle } from '@tabler/icons-react'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { recordDto } from '~/features/habits/server/record-functions'
import type { RecordEntity } from '~/features/habits/types/habit'

type RecoverySwitchProps = {
  record: RecordEntity
  onSuccess?: () => void
}

export function RecoverySwitch({ record, onSuccess }: RecoverySwitchProps) {
  const [recoverySuccess, setRecoverySuccess] = useState<boolean | null>(
    record.recoverySuccess ?? null,
  )

  const toggleMutation = useMutation({
    mutationFn: async (success: boolean) => {
      const result = await recordDto.toggleRecoverySuccess({
        data: {
          recordId: record.id,
          success,
        },
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to toggle recovery success')
      }

      return result.data
    },
    onSuccess: (data) => {
      if (data) {
        setRecoverySuccess(data.recoverySuccess ?? null)
        onSuccess?.()
      }
    },
  })

  const handleToggle = (checked: boolean) => {
    toggleMutation.mutate(checked)
  }

  if (!record.isRecoveryAttempt) {
    return null
  }

  return (
    <Card withBorder padding="md" radius="md" bg="gray.0">
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

        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap="xs">
            {recoverySuccess === true ? (
              <IconCircleCheck size={20} color="var(--mantine-color-green-6)" />
            ) : recoverySuccess === false ? (
              <IconCircleX size={20} color="var(--mantine-color-red-6)" />
            ) : null}
            <Text size="sm" fw={500}>
              リカバリー結果
            </Text>
          </Group>

          <Group gap="md" wrap="nowrap">
            <Text
              size="sm"
              c={recoverySuccess === false ? 'red.6' : 'dimmed'}
              fw={recoverySuccess === false ? 600 : 400}
            >
              失敗
            </Text>
            <Switch
              checked={recoverySuccess ?? false}
              onChange={(event) => handleToggle(event.currentTarget.checked)}
              disabled={toggleMutation.isPending}
              size="md"
              onLabel="成功"
              offLabel="失敗"
              color="green"
            />
            <Text
              size="sm"
              c={recoverySuccess === true ? 'green.6' : 'dimmed'}
              fw={recoverySuccess === true ? 600 : 400}
            >
              成功
            </Text>
          </Group>
        </Group>

        {recoverySuccess !== null && (
          <Text size="xs" c="dimmed" ta="right">
            {recoverySuccess
              ? '✓ リカバリー成功として記録されました'
              : '✗ リカバリー失敗として記録されました'}
          </Text>
        )}

        {toggleMutation.isError && (
          <Alert color="red" title="エラー" variant="light">
            <Text size="sm">
              {toggleMutation.error instanceof Error
                ? toggleMutation.error.message
                : 'リカバリー状態の更新に失敗しました'}
            </Text>
          </Alert>
        )}
      </Stack>
    </Card>
  )
}

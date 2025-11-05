import { Group, Switch, Text, Tooltip } from '@mantine/core'
import { IconCircleCheck, IconCircleX } from '@tabler/icons-react'
import type { RecordTable } from '~/features/habits/types/habit'

type RecoverySwitchProps = {
  value: RecordTable['recoverySuccess']
  onChange: (value: RecordTable['recoverySuccess']) => void
  disabled: boolean
}

export function RecoverySwitch({ value, onChange, disabled }: RecoverySwitchProps) {
  const getTooltipLabel = () => {
    if (value === true) {
      return (
        <Group gap={6}>
          <IconCircleCheck size={16} stroke={2.5} color="var(--mantine-color-green-4)" />
          <Text size="sm" fw={700}>
            リカバリー
            <Text component="span" c="green.4" fw={700}>
              成功
            </Text>
            として記録されます
          </Text>
        </Group>
      )
    }

    if (value === false) {
      return (
        <Group gap={6}>
          <IconCircleX size={16} stroke={2.5} color="var(--mantine-color-red-4)" />
          <Text size="sm" fw={700}>
            リカバリー
            <Text component="span" c="red.4" fw={700}>
              失敗
            </Text>
            として記録されます
          </Text>
        </Group>
      )
    }

    return 'リカバリーの成功/失敗を選択してください'
  }

  return (
    <Group justify="space-between" align="center" wrap="nowrap">
      <Group gap="xs">
        {value === true ? (
          <IconCircleCheck size={20} color="var(--mantine-color-green-6)" />
        ) : value === false ? (
          <IconCircleX size={20} color="var(--mantine-color-red-6)" />
        ) : null}
        <Text size="sm" fw={500}>
          リカバリー結果
        </Text>
      </Group>

      <Tooltip label={getTooltipLabel()} position="top" withArrow>
        <Group gap="md" wrap="nowrap">
          <Text size="sm" c={value === false ? 'red.6' : 'dimmed'} fw={value === false ? 600 : 400}>
            失敗
          </Text>
          <Switch
            checked={value ?? false}
            onChange={(e) => onChange(e.currentTarget.checked)}
            disabled={disabled}
            size="md"
            thumbIcon={
              value ? (
                <IconCircleCheck size={12} color="var(--mantine-color-green-6)" stroke={3} />
              ) : (
                <IconCircleX size={12} color="var(--mantine-color-red-6)" stroke={3} />
              )
            }
            color="green"
          />
          <Text size="sm" c={value === true ? 'green.6' : 'dimmed'} fw={value === true ? 600 : 400}>
            成功
          </Text>
        </Group>
      </Tooltip>
    </Group>
  )
}

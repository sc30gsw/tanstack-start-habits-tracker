import { Group, Switch, Text, Tooltip } from '@mantine/core'
import { IconCircleCheck, IconCircleX } from '@tabler/icons-react'
import type { RecordTable } from '~/features/habits/types/habit'

type RecoverySwitchProps = {
  value: RecordTable['recoverySuccess']
  onChange: (value: RecordTable['recoverySuccess']) => void
  disabled: boolean
}

export function RecoverySwitch({ value, onChange, disabled }: RecoverySwitchProps) {
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

      <Tooltip
        label={
          value === true
            ? 'リカバリー成功として記録されます'
            : value === false
              ? 'リカバリー失敗として記録されます'
              : 'リカバリーの成功/失敗を選択してください'
        }
        position="top"
        withArrow
      >
        <Group gap="md" wrap="nowrap">
          <Group gap={4}>
            <IconCircleX size={16} color="var(--mantine-color-red-6)" stroke={2.5} />
            <Text
              size="sm"
              c={value === false ? 'red.6' : 'dimmed'}
              fw={value === false ? 700 : 500}
            >
              失敗
            </Text>
          </Group>
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
          <Group gap={4}>
            <IconCircleCheck size={16} color="var(--mantine-color-green-6)" stroke={2.5} />
            <Text
              size="sm"
              c={value === true ? 'green.6' : 'dimmed'}
              fw={value === true ? 700 : 500}
            >
              成功
            </Text>
          </Group>
        </Group>
      </Tooltip>
    </Group>
  )
}

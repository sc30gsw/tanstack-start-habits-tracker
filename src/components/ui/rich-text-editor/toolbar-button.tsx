import { Group, Kbd, Stack, Text, Tooltip } from '@mantine/core'
import type { ReactNode } from 'react'

type ToolbarButtonProps = {
  icon: ReactNode
  label: string
  shortcuts?: readonly string[]
  onClick: () => void
  disabled: boolean
  isActive?: boolean
}

export function ToolbarButton({
  icon,
  label,
  shortcuts,
  onClick,
  disabled,
  isActive = false,
}: ToolbarButtonProps) {
  return (
    <Tooltip
      label={
        shortcuts ? (
          <Stack gap={4} align="center">
            <Text size="xs">{label}</Text>
            <Group gap={4}>
              {shortcuts.map((key) => (
                <Kbd key={key} size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  {key}
                </Kbd>
              ))}
            </Group>
          </Stack>
        ) : (
          label
        )
      }
    >
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        style={{
          padding: '4px 8px',
          border: 'none',
          borderRadius: '4px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: isActive ? 'var(--mantine-color-blue-5)' : 'transparent',
          color: isActive ? 'white' : 'inherit',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {icon}
      </button>
    </Tooltip>
  )
}

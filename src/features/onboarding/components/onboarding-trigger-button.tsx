import { ActionIcon, Tooltip } from '@mantine/core'
import { IconHelp } from '@tabler/icons-react'

type OnboardingTriggerButtonProps = {
  variant: 'inline' | 'floating'
  onClick: () => void
}

export function OnboardingTriggerButton({ variant, onClick }: OnboardingTriggerButtonProps) {
  const isFloating = variant === 'floating'

  return (
    <Tooltip label="使い方を見る" position={isFloating ? 'left' : undefined}>
      <ActionIcon
        variant={isFloating ? 'filled' : 'light'}
        color="blue"
        size={isFloating ? 'xl' : 'lg'}
        onClick={onClick}
        style={
          isFloating
            ? {
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }
            : undefined
        }
        aria-label="使い方を見る"
      >
        <IconHelp size={isFloating ? 24 : 20} />
      </ActionIcon>
    </Tooltip>
  )
}

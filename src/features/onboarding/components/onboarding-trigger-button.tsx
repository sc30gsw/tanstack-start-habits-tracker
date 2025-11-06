import { ActionIcon, Tooltip } from '@mantine/core'
import { IconQuestionMark } from '@tabler/icons-react'

type OnboardingTriggerButtonProps = {
  variant: 'inline' | 'floating'
  onClick: () => void
}

export function OnboardingTriggerButton({ variant, onClick }: OnboardingTriggerButtonProps) {
  const isFloating = variant === 'floating'

  return (
    <Tooltip label="使い方を見る" position={'top'} withArrow>
      <ActionIcon
        variant={isFloating ? 'filled' : 'outline'}
        color="blue"
        size={isFloating ? 'xl' : 'lg'}
        radius={isFloating ? 'lg' : 99}
        onClick={onClick}
        style={
          isFloating
            ? {
                position: 'fixed',
                bottom: '16px',
                right: '24px',
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }
            : {
                borderWidth: '1.5px',
              }
        }
        aria-label="使い方を見る"
      >
        <IconQuestionMark stroke={2} size={isFloating ? 24 : 20} />
      </ActionIcon>
    </Tooltip>
  )
}

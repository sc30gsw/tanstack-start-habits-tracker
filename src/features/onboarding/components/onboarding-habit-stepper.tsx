import type { OnboardingTourController } from '@gfazioli/mantine-onboarding-tour'
import { Box, Group, Text } from '@mantine/core'
import { IconCheck } from '@tabler/icons-react'

export function OnboardingHabitProgressStepper(tourController: OnboardingTourController) {
  return (
    <Group gap="xs" justify="center">
      {tourController.tour.map((_, index) => {
        const isActive = index === tourController.currentStepIndex
        const isCompleted = index < (tourController.currentStepIndex ?? 0)

        return (
          <Box
            key={index}
            onClick={() => tourController.setCurrentStepIndex(index)}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: `2px solid ${
                isActive
                  ? 'var(--mantine-color-blue-6)'
                  : isCompleted
                    ? 'var(--mantine-color-green-6)'
                    : 'var(--mantine-color-gray-4)'
              }`,
              backgroundColor: isCompleted
                ? 'var(--mantine-color-green-1)'
                : isActive
                  ? 'var(--mantine-color-blue-1)'
                  : 'transparent',
              transition: 'all 0.2s',
            }}
          >
            {isCompleted ? (
              <IconCheck size={16} color="var(--mantine-color-green-6)" />
            ) : (
              <Text size="sm" fw={isActive ? 700 : 400} c={isActive ? 'blue' : 'gray'}>
                {index + 1}
              </Text>
            )}
          </Box>
        )
      })}
    </Group>
  )
}

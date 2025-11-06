import type { OnboardingTourController } from '@gfazioli/mantine-onboarding-tour'
import { Box, Flex, Text } from '@mantine/core'
import { IconCheck } from '@tabler/icons-react'

export function OnboardingHabitProgressStepper(tourController: OnboardingTourController) {
  return (
    <Flex
      align="center"
      justify="center"
      style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}
    >
      {tourController.tour.map((_, index) => {
        const isActive = index === tourController.currentStepIndex
        const isCompleted = index < (tourController.currentStepIndex ?? 0)
        const isLastStep = index === tourController.tour.length - 1

        const nextStepCompleted = index + 1 < (tourController.currentStepIndex ?? 0)
        const nextStepActive = index + 1 === tourController.currentStepIndex

        return (
          <>
            <Box
              key={`step-${index}`}
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
                flexShrink: 0,
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

            {!isLastStep && (
              <Box
                key={`line-${index}`}
                style={{
                  flex: 1,
                  height: 2,
                  backgroundColor: nextStepCompleted
                    ? 'var(--mantine-color-green-6)'
                    : nextStepActive
                      ? 'var(--mantine-color-blue-6)'
                      : 'var(--mantine-color-gray-4)',
                  transition: 'background-color 0.2s',
                  margin: '0 8px',
                }}
              />
            )}
          </>
        )
      })}
    </Flex>
  )
}

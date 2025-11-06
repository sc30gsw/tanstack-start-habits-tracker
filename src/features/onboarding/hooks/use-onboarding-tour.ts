import { useDisclosure } from '@mantine/hooks'

export function useOnboardingTour() {
  const [started, { open, close }] = useDisclosure(false)

  const handlers = {
    onStart: open,
    onEnd: close,
    onClose: close,
  }

  return {
    started,
    handlers,
  } as const
}

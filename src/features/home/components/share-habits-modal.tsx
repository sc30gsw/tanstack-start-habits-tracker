import { Group, Modal, Text, useComputedColorScheme } from '@mantine/core'
import { IconShare } from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'
import { ShareHabitsModalContainer } from '~/features/home/components/share-habits-modal-container'

export function ShareHabitsModal({ copyId }: Record<'copyId', string>) {
  const routeApi = getRouteApi('/')
  const navigate = routeApi.useNavigate()
  const searchParams = routeApi.useSearch()
  const open = searchParams.open

  const computedColorScheme = useComputedColorScheme('light')
  const titleColor = computedColorScheme === 'dark' ? 'gray.1' : 'dark.8'

  return (
    <>
      <style>
        {`
            .habit-card-group:hover .habit-copy-button {
              opacity: 1 !important;
            }
            .preview-box-group:hover .preview-copy-button {
              opacity: 1 !important;
            }
          `}
      </style>
      <Modal
        opened={open ?? false}
        onClose={() => {
          navigate({
            search: (prev) => ({
              ...prev,
              open: false,
            }),
            hash: copyId,
          })
        }}
        title={
          <Group gap="xs" align="center">
            <IconShare size={20} color="var(--mantine-color-blue-6)" />
            <Text size="xl" fw={600} c={titleColor}>
              習慣を共有
            </Text>
          </Group>
        }
        size="lg"
      >
        <ShareHabitsModalContainer />
      </Modal>
    </>
  )
}

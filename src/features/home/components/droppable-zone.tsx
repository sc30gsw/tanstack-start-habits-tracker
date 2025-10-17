import { useDroppable } from '@dnd-kit/core'
import { Box, Group, Text, useMantineColorScheme } from '@mantine/core'
import { IconCheck, IconCircleDashed, IconPlayerSkipForward, IconX } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import type { RecordStatus } from '~/features/habits/types/schemas/record-schemas'

type DropZoneId = RecordStatus | 'scheduled' | 'unscheduled'

function getStatusIcon(id: DropZoneId) {
  switch (id) {
    case 'completed':
      return { Icon: IconCheck, color: '#40c057', label: '完了' }

    case 'skipped':
      return { Icon: IconPlayerSkipForward, color: '#fd7e14', label: 'スキップ' }

    case 'scheduled':
    case 'active':
      return { Icon: IconCircleDashed, color: '#339af0', label: '進行中' }

    case 'unscheduled':
      return { Icon: IconX, color: '#868e96', label: '未完了' }

    default:
      return { Icon: IconCircleDashed, color: '#339af0', label: '進行中' }
  }
}

type DroppableZoneProps = {
  id: Parameters<typeof useDroppable>[0]['id']
  children: ReactNode
  disabled?: boolean
}

export function DroppableZone({ id, children, disabled = false }: DroppableZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    disabled,
  })
  const { colorScheme } = useMantineColorScheme()

  const { Icon, color, label } = getStatusIcon(id as DropZoneId)

  return (
    <Box
      ref={setNodeRef}
      style={{
        backgroundColor: isOver
          ? colorScheme === 'dark'
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(0, 0, 0, 0.05)'
          : undefined,
        borderRadius: '8px',
        transition: 'background-color 0.2s',
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : undefined,
        position: 'relative',
        padding: '0.5rem',
      }}
    >
      {isOver && (
        <Group
          gap="xs"
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <Icon size={20} color={color} />
          <Text size="sm" fw={600} c={color}>
            {label}に変更
          </Text>
        </Group>
      )}
      {children}
    </Box>
  )
}

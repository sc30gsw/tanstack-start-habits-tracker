import { useDroppable } from '@dnd-kit/core'
import type { ReactNode } from 'react'

type DroppableZoneProps = {
  id: string
  children: ReactNode
  disabled?: boolean
}

export function DroppableZone({ id, children, disabled = false }: DroppableZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    disabled,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        backgroundColor: isOver ? 'rgba(0, 0, 0, 0.05)' : undefined,
        borderRadius: '8px',
        transition: 'background-color 0.2s',
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : undefined,
        position: 'relative',
      }}
    >
      {children}
    </div>
  )
}

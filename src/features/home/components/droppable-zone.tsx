import { useDroppable } from '@dnd-kit/core'
import type { ReactNode } from 'react'

type DroppableZoneProps = {
  id: string
  children: ReactNode
}

export function DroppableZone({ id, children }: DroppableZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        backgroundColor: isOver ? 'rgba(0, 0, 0, 0.05)' : undefined,
        borderRadius: '8px',
        transition: 'background-color 0.2s',
      }}
    >
      {children}
    </div>
  )
}

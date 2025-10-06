import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { HabitEntity, RecordEntity } from '~/features/habits/types/habit'
import { DailyHabitCard } from '~/features/home/components/daily-habit-card'

type DraggableHabitCardProps = {
  habit: HabitEntity
  record?: RecordEntity
  isCompleted: boolean
}

export function DraggableHabitCard({ habit, record, isCompleted }: DraggableHabitCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: habit.id,
    data: {
      habit,
      record,
    },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <DailyHabitCard habit={habit} record={record} isCompleted={isCompleted} />
    </div>
  )
}

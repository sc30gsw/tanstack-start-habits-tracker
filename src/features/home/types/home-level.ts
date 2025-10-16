import type { MantineColor } from '@mantine/core'
import type { InferSelectModel } from 'drizzle-orm'
import type { habitLevels } from '~/db/schema'

type HabitLevel = InferSelectModel<typeof habitLevels>

export type HomeAggregatedLevel = Record<
  'totalLevel' | 'totalHabits' | 'totalCompletionDays',
  number
> &
  Pick<HabitLevel, 'totalHoursDecimal' | 'currentStreak' | 'longestStreak'>

export type HomeBadge = {
  level: number
  title: string
  icon: string
  color: MantineColor
  type: 'habits' | 'days' | 'streak' | 'hours'
}

export type HomeBadgeProgress = HomeBadge & {
  unlocked: boolean
  currentValue: number
  remainingValue: number
}

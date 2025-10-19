import type { MantineColor } from '@mantine/core'
import type { InferSelectModel } from 'drizzle-orm'
import type { habitLevels } from '~/db/schema'

type HabitLevel = InferSelectModel<typeof habitLevels>

export type ProfileAggregatedLevel = Record<
  'totalLevel' | 'totalHabits' | 'totalCompletionDays',
  number
> &
  Pick<HabitLevel, 'totalHoursDecimal' | 'currentStreak' | 'longestStreak'>

export type ProfileBadge = {
  level: number
  title: string
  icon: string
  color: MantineColor
  type: 'habits' | 'days' | 'streak' | 'hours'
  unlocked?: boolean
}

export type ProfileBadgeProgress = ProfileBadge & {
  unlocked: boolean
  currentValue: number
  remainingValue: number
}

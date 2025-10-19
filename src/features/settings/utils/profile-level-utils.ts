import type { InferSelectModel } from 'drizzle-orm'
import type { habitLevels } from '~/db/schema'
import type { ProfileAggregatedLevel } from '~/features/settings/types/profile-level'

const MAX_PROGRESS = 100

export function calculateProfileAggregatedLevel(levels: InferSelectModel<typeof habitLevels>[]) {
  if (levels.length === 0) {
    return {
      totalLevel: 0,
      totalHabits: 0,
      totalCompletionDays: 0,
      totalHoursDecimal: 0,
      longestStreak: 0,
      currentStreak: 0,
    } as const
  }

  const totalLevel = levels.reduce(
    (sum, level) => sum + level.completionLevel + level.hoursLevel,
    0,
  )

  const totalHabits = levels.length
  const totalCompletionDays = levels.reduce((sum, level) => sum + level.uniqueCompletionDays, 0)
  const totalHoursDecimal = levels.reduce((sum, level) => sum + level.totalHoursDecimal, 0)
  const longestStreak = Math.max(...levels.map((level) => level.longestStreak), 0)
  const currentStreakSum = levels.reduce((sum, level) => sum + level.currentStreak, 0)

  return {
    totalLevel,
    totalHabits,
    totalCompletionDays,
    totalHoursDecimal,
    longestStreak,
    currentStreak: currentStreakSum,
  } as const
}

export function calculateProfileLevelProgress(
  totalLevel: ProfileAggregatedLevel['totalLevel'],
  currentTierMinLevel: number,
  currentTierMaxLevel: number,
) {
  // 現在の段階内での進捗を計算
  const rangeSize = currentTierMaxLevel - currentTierMinLevel + 1
  const progress = totalLevel - currentTierMinLevel

  return Math.round((progress / rangeSize) * MAX_PROGRESS)
}

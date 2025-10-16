import type { InferSelectModel } from 'drizzle-orm'
import type { habitLevels } from '~/db/schema'
import type { HomeAggregatedLevel } from '~/features/home/types/home-level'

const LEVEL_THRESHOLDS = [0, 11, 31, 61, 101] as const satisfies readonly number[]
const MAX_PROGRESS = 100

export function calculateHomeAggregatedLevel(levels: InferSelectModel<typeof habitLevels>[]) {
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

export function calculateHomeLevelProgress(totalLevel: HomeAggregatedLevel['totalLevel']) {
  let currentThresholdIndex = 0

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalLevel >= LEVEL_THRESHOLDS[i]) {
      currentThresholdIndex = i
    } else {
      break
    }
  }

  if (currentThresholdIndex === LEVEL_THRESHOLDS.length - 1) {
    return MAX_PROGRESS
  }

  const currentThreshold = LEVEL_THRESHOLDS[currentThresholdIndex]
  const nextThreshold = LEVEL_THRESHOLDS[currentThresholdIndex + 1]
  const rangeSize = nextThreshold - currentThreshold
  const progress = totalLevel - currentThreshold

  return Math.round((progress / rangeSize) * MAX_PROGRESS)
}

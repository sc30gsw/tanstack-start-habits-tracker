import {
  PROFILE_ALL_BADGES,
  PROFILE_BADGES_BY_CATEGORY,
} from '~/features/settings/constants/profile-badges'
import type { ProfileAggregatedLevel, ProfileBadge } from '~/features/settings/types/profile-level'

export function evaluateProfileBadges(aggregated: ProfileAggregatedLevel) {
  return PROFILE_ALL_BADGES.map((badge) => {
    const currentValue = getCurrentValueForBadgeType(badge, aggregated)
    const unlocked = currentValue >= badge.level
    const remainingValue = Math.max(0, badge.level - currentValue)

    return {
      ...badge,
      unlocked,
      currentValue,
      remainingValue,
    }
  })
}

function getCurrentValueForBadgeType(badge: ProfileBadge, aggregated: ProfileAggregatedLevel) {
  switch (badge.type) {
    case 'habits':
      return aggregated.totalHabits
    case 'days':
      return aggregated.totalCompletionDays
    case 'streak':
      return aggregated.longestStreak
    case 'hours':
      return Math.floor(aggregated.totalHoursDecimal)
    default:
      return 0
  }
}

export function getProfileBadgesByCategory(aggregated: ProfileAggregatedLevel) {
  return {
    habits: evaluateCategoryBadges(PROFILE_BADGES_BY_CATEGORY.habits, aggregated.totalHabits),
    days: evaluateCategoryBadges(PROFILE_BADGES_BY_CATEGORY.days, aggregated.totalCompletionDays),
    streak: evaluateCategoryBadges(PROFILE_BADGES_BY_CATEGORY.streak, aggregated.longestStreak),
    hours: evaluateCategoryBadges(
      PROFILE_BADGES_BY_CATEGORY.hours,
      Math.floor(aggregated.totalHoursDecimal),
    ),
  }
}

function evaluateCategoryBadges(badges: readonly ProfileBadge[], currentValue: number) {
  return badges.map((badge) => ({
    ...badge,
    unlocked: currentValue >= badge.level,
    currentValue,
    remainingValue: Math.max(0, badge.level - currentValue),
  }))
}

export function calculateBadgeCompletionRate(badges: readonly ProfileBadge[]) {
  if (badges.length === 0) {
    return 0
  }

  const unlockedCount = badges.filter((badge) => badge.unlocked).length

  return Math.round((unlockedCount / badges.length) * 100)
}

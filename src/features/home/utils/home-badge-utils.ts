import { HOME_ALL_BADGES, HOME_BADGES_BY_CATEGORY } from '~/features/home/constants/home-badges'
import type {
  HomeAggregatedLevel,
  HomeBadge,
  HomeBadgeProgress,
} from '~/features/home/types/home-level'

export function evaluateHomeBadges(aggregated: HomeAggregatedLevel) {
  return HOME_ALL_BADGES.map((badge) => {
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

function getCurrentValueForBadgeType(badge: HomeBadge, aggregated: HomeAggregatedLevel) {
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

export function getHomeBadgesByCategory(aggregated: HomeAggregatedLevel) {
  return {
    habits: evaluateCategoryBadges(HOME_BADGES_BY_CATEGORY.habits, aggregated.totalHabits),
    days: evaluateCategoryBadges(HOME_BADGES_BY_CATEGORY.days, aggregated.totalCompletionDays),
    streak: evaluateCategoryBadges(HOME_BADGES_BY_CATEGORY.streak, aggregated.longestStreak),
    hours: evaluateCategoryBadges(
      HOME_BADGES_BY_CATEGORY.hours,
      Math.floor(aggregated.totalHoursDecimal),
    ),
  }
}

function evaluateCategoryBadges(badges: readonly HomeBadge[], currentValue: number) {
  return badges.map((badge) => ({
    ...badge,
    unlocked: currentValue >= badge.level,
    currentValue,
    remainingValue: Math.max(0, badge.level - currentValue),
  }))
}

export function calculateBadgeCompletionRate(badges: readonly HomeBadgeProgress[]) {
  if (badges.length === 0) {
    return 0
  }

  const unlockedCount = badges.filter((badge) => badge.unlocked).length

  return Math.round((unlockedCount / badges.length) * 100)
}

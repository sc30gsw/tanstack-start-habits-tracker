import type { HabitLevelInfo } from '~/features/habits/types/habit'
import { COMPLETION_TITLES, HOURS_TITLES } from './level-titles'

export type BadgeItem = Record<'type', 'completion' | 'hours'> &
  Omit<HabitLevelInfo['completion'], 'nextLevelDays' | 'progressPercent' | 'currentDays'>

export const COMPLETION_BADGES: readonly BadgeItem[] = COMPLETION_TITLES.map((item) => ({
  level: item.maxLevel,
  title: item.info.title,
  icon: item.info.icon,
  color: item.info.color,
  type: 'completion' as const,
}))

// HOURS_TITLESから生成
export const HOURS_BADGES: readonly BadgeItem[] = HOURS_TITLES.map((item) => ({
  level: item.maxLevel,
  title: item.info.title,
  icon: item.info.icon,
  color: item.info.color,
  type: 'hours' as const,
}))

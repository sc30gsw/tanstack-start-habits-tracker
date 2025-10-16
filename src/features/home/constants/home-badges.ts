import type { HomeBadge } from '~/features/home/types/home-level'

const HOME_HABITS_BADGES = [
  {
    level: 1,
    title: '習慣の一歩',
    icon: '🎯',
    color: 'blue',
    type: 'habits',
  },
  {
    level: 5,
    title: '習慣コレクター',
    icon: '📚',
    color: 'cyan',
    type: 'habits',
  },
  {
    level: 10,
    title: '習慣マスター',
    icon: '🏆',
    color: 'indigo',
    type: 'habits',
  },
  {
    level: 20,
    title: '習慣の達人',
    icon: '👑',
    color: 'violet',
    type: 'habits',
  },
] as const satisfies readonly HomeBadge[]

const HOME_DAYS_BADGES = [
  {
    level: 10,
    title: '10日の継続',
    icon: '🌱',
    color: 'green',
    type: 'days',
  },
  {
    level: 50,
    title: '50日の継続',
    icon: '🌿',
    color: 'teal',
    type: 'days',
  },
  {
    level: 100,
    title: '100日の継続',
    icon: '🌳',
    color: 'lime',
    type: 'days',
  },
  {
    level: 365,
    title: '1年の継続',
    icon: '🎄',
    color: 'green',
    type: 'days',
  },
] as const satisfies readonly HomeBadge[]

const HOME_STREAK_BADGES = [
  {
    level: 7,
    title: '1週間ストリーク',
    icon: '🔥',
    color: 'orange',
    type: 'streak',
  },
  {
    level: 30,
    title: '1ヶ月ストリーク',
    icon: '⚡',
    color: 'yellow',
    type: 'streak',
  },
  {
    level: 100,
    title: '100日ストリーク',
    icon: '💎',
    color: 'cyan',
    type: 'streak',
  },
  {
    level: 365,
    title: '1年ストリーク',
    icon: '🌟',
    color: 'yellow',
    type: 'streak',
  },
] as const satisfies readonly HomeBadge[]

const HOME_HOURS_BADGES = [
  {
    level: 10,
    title: '10時間達成',
    icon: '⏰',
    color: 'blue',
    type: 'hours',
  },
  {
    level: 100,
    title: '100時間達成',
    icon: '⏳',
    color: 'indigo',
    type: 'hours',
  },
  {
    level: 1000,
    title: '1000時間達成',
    icon: '⌛',
    color: 'violet',
    type: 'hours',
  },
  {
    level: 10000,
    title: '10000時間達成',
    icon: '🕐',
    color: 'grape',
    type: 'hours',
  },
] as const satisfies readonly HomeBadge[]

export const HOME_ALL_BADGES = [
  ...HOME_HABITS_BADGES,
  ...HOME_DAYS_BADGES,
  ...HOME_STREAK_BADGES,
  ...HOME_HOURS_BADGES,
] as const satisfies readonly HomeBadge[]

export const HOME_BADGES_BY_CATEGORY = {
  habits: HOME_HABITS_BADGES,
  days: HOME_DAYS_BADGES,
  streak: HOME_STREAK_BADGES,
  hours: HOME_HOURS_BADGES,
} as const satisfies Record<'habits' | 'days' | 'streak' | 'hours', readonly HomeBadge[]>

export const HOME_BADGE_CATEGORY_LABELS = {
  habits: '習慣数',
  days: '完了日数',
  streak: '継続日数',
  hours: '作業時間',
} as const satisfies Record<keyof typeof HOME_BADGES_BY_CATEGORY, string>

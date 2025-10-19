import type { ProfileBadge } from '~/features/settings/types/profile-level'

const PROFILE_HABITS_BADGES = [
  {
    level: 5,
    title: '習慣の一歩',
    icon: 'IconCircleDot',
    color: 'blue',
    type: 'habits',
  },
  {
    level: 10,
    title: '習慣コレクター',
    icon: 'IconStack',
    color: 'cyan',
    type: 'habits',
  },
  {
    level: 20,
    title: '習慣マスター',
    icon: 'IconTrophy',
    color: 'indigo',
    type: 'habits',
  },
  {
    level: 50,
    title: '習慣の達人',
    icon: 'IconCrown',
    color: 'violet',
    type: 'habits',
  },
] as const satisfies readonly ProfileBadge[]

const PROFILE_DAYS_BADGES = [
  {
    level: 50,
    title: '50日の継続',
    icon: 'IconSeedling',
    color: 'green',
    type: 'days',
  },
  {
    level: 100,
    title: '100日の継続',
    icon: 'IconPlant2',
    color: 'teal',
    type: 'days',
  },
  {
    level: 365,
    title: '1年の継続',
    icon: 'IconTree',
    color: 'lime',
    type: 'days',
  },
  {
    level: 1000,
    title: '1000日の継続',
    icon: 'IconTrees',
    color: 'green',
    type: 'days',
  },
] as const satisfies readonly ProfileBadge[]

const PROFILE_STREAK_BADGES = [
  {
    level: 30,
    title: '1ヶ月ストリーク',
    icon: 'IconFlame',
    color: 'orange',
    type: 'streak',
  },
  {
    level: 100,
    title: '100日ストリーク',
    icon: 'IconBolt',
    color: 'red',
    type: 'streak',
  },
  {
    level: 365,
    title: '1年ストリーク',
    icon: 'IconDiamond',
    color: 'pink',
    type: 'streak',
  },
  {
    level: 1000,
    title: '1000日ストリーク',
    icon: 'IconSparkles',
    color: 'yellow',
    type: 'streak',
  },
] as const satisfies readonly ProfileBadge[]

const PROFILE_HOURS_BADGES = [
  {
    level: 100,
    title: '100時間達成',
    icon: 'IconClock',
    color: 'blue',
    type: 'hours',
  },
  {
    level: 1000,
    title: '1000時間達成',
    icon: 'IconClockHour4',
    color: 'indigo',
    type: 'hours',
  },
  {
    level: 5000,
    title: '5000時間達成',
    icon: 'IconHourglass',
    color: 'violet',
    type: 'hours',
  },
  {
    level: 10000,
    title: '10000時間達成',
    icon: 'IconInfinity',
    color: 'grape',
    type: 'hours',
  },
] as const satisfies readonly ProfileBadge[]

export const PROFILE_ALL_BADGES = [
  ...PROFILE_HABITS_BADGES,
  ...PROFILE_DAYS_BADGES,
  ...PROFILE_STREAK_BADGES,
  ...PROFILE_HOURS_BADGES,
] as const satisfies readonly ProfileBadge[]

export const PROFILE_BADGES_BY_CATEGORY = {
  habits: PROFILE_HABITS_BADGES,
  days: PROFILE_DAYS_BADGES,
  streak: PROFILE_STREAK_BADGES,
  hours: PROFILE_HOURS_BADGES,
} as const satisfies Record<'habits' | 'days' | 'streak' | 'hours', readonly ProfileBadge[]>

export const PROFILE_BADGE_CATEGORY_LABELS = {
  habits: '登録習慣数',
  days: '累計達成日数',
  streak: '最長連続日数',
  hours: '累計作業時間',
} as const satisfies Record<keyof typeof PROFILE_BADGES_BY_CATEGORY, string>

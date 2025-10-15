import type { HabitLevelInfo } from '~/features/habits/types/habit'

export const LEVEL_TITLE_THRESHOLDS = {
  TIER1: 50,
  TIER2: 100,
  TIER3: 200,
  TIER4: 400,
  TIER5: 600,
  TIER6: 700,
  TIER7: 800,
  TIER8: 900,
  TIER9: 999,
} as const satisfies Record<string, number>

export const COMPLETION_TITLES = [
  {
    maxLevel: LEVEL_TITLE_THRESHOLDS.TIER1,
    info: { title: '習慣の芽生え', icon: 'IconSeedling', color: 'teal' },
  },
  {
    maxLevel: LEVEL_TITLE_THRESHOLDS.TIER2,
    info: { title: '習慣の新芽', icon: 'IconPlant', color: 'cyan' },
  },
  {
    maxLevel: LEVEL_TITLE_THRESHOLDS.TIER3,
    info: { title: '習慣の若木', icon: 'IconTree', color: 'blue' },
  },
  {
    maxLevel: LEVEL_TITLE_THRESHOLDS.TIER4,
    info: { title: '継続の達人', icon: 'IconFlame', color: 'indigo' },
  },
  {
    maxLevel: LEVEL_TITLE_THRESHOLDS.TIER5,
    info: { title: '習慣マスター', icon: 'IconBolt', color: 'violet' },
  },
  {
    maxLevel: LEVEL_TITLE_THRESHOLDS.TIER7,
    info: { title: '習慣の賢者', icon: 'IconWand', color: 'grape' },
  },
  {
    maxLevel: LEVEL_TITLE_THRESHOLDS.TIER9,
    info: { title: '習慣の伝説', icon: 'IconCrown', color: 'yellow' },
  },
] as const satisfies Readonly<
  Array<{
    maxLevel: number
    info: Pick<HabitLevelInfo['completion'], 'title' | 'icon' | 'color'>
  }>
>

export const HOURS_TITLES = [
  {
    maxLevel: LEVEL_TITLE_THRESHOLDS.TIER1,
    info: { title: '努力の一歩', icon: 'IconPlant2', color: 'orange' },
  },
  {
    maxLevel: LEVEL_TITLE_THRESHOLDS.TIER2,
    info: { title: '努力の積み重ね', icon: 'IconBook2', color: 'red' },
  },
  {
    maxLevel: LEVEL_TITLE_THRESHOLDS.TIER4,
    info: { title: '努力の探求者', icon: 'IconTarget', color: 'pink' },
  },
  {
    maxLevel: LEVEL_TITLE_THRESHOLDS.TIER5,
    info: { title: '努力の達人', icon: 'IconMedal', color: 'grape' },
  },
  {
    maxLevel: LEVEL_TITLE_THRESHOLDS.TIER6,
    info: { title: '努力のエキスパート', icon: 'IconSparkles', color: 'violet' },
  },
  {
    maxLevel: LEVEL_TITLE_THRESHOLDS.TIER8,
    info: { title: '努力のマエストロ', icon: 'IconSchool', color: 'indigo' },
  },
  {
    maxLevel: LEVEL_TITLE_THRESHOLDS.TIER9,
    info: { title: '10,000時間の法則', icon: 'IconTrophy', color: 'yellow' },
  },
] as const satisfies Readonly<
  Array<{
    maxLevel: number
    info: Pick<HabitLevelInfo['hours'], 'title' | 'icon' | 'color'>
  }>
>

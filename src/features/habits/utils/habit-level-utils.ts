import dayjs from 'dayjs'
import type { HabitLevelInfo, HabitLevelTable } from '~/features/habits/types/habit'
import type { SearchParams } from '~/features/habits/types/schemas/search-params'

const LEVEL = {
  MIN: 1,
  MAX: 999,
} as const satisfies Record<string, number>

const COMPLETION_THRESHOLDS = {
  TIER1: { level: 100, days: 100, rate: 1 },
  TIER2: { level: 300, days: 300, rate: 1.5 },
  TIER3: { level: 500, days: 400, rate: 2 },
  TIER4: { level: 999, days: 295, rate: 0.59 },
  MAX_DAYS: 1095,
} as const satisfies Record<string, number | Record<string, number>>

const HOURS_THRESHOLDS = {
  TIER1: { level: 100, hours: 100, rate: 1 },
  TIER2: { level: 300, hours: 400, rate: 2 },
  TIER3: { level: 500, hours: 1000, rate: 5 },
  TIER4: { level: 700, hours: 2000, rate: 10 },
  TIER5: { level: 900, hours: 4000, rate: 20 },
  TIER6: { level: 999, hours: 2500, rate: 25.25 },
  MAX_HOURS: 10000,
} as const satisfies Record<string, number | Record<string, number>>

const STREAK_THRESHOLDS = {
  WEEK: 7,
  MONTH: 30,
  RECENT_DAYS: 7,
  FIRST_DAY: 1,
} as const satisfies Record<string, number>

const PROGRESS_BAR = {
  MIN: 0,
  MAX: 100,
} as const satisfies Record<string, number>

const STREAK_CONSTANTS = {
  MIN_VALUE: 0,
  INITIAL_LONGEST: 1,
  INITIAL_CURRENT: 1,
  CONSECUTIVE_DAY_DIFF: 1,
  MINIMUM_ACTIVITY: 1,
  ARRAY_START_INDEX: 1,
  LAST_INDEX_OFFSET: 1,
  YESTERDAY_OFFSET: 1,
  MINUTES_TO_HOURS_DIVISOR: 60,
} as const satisfies Record<string, number>

type RecordStatus = 'active' | 'completed' | 'skipped'

type RecordWithDate = {
  date: string
  status: RecordStatus
}

type RecordWithDuration = RecordWithDate & Record<'duration_minutes', number | null>

function calculateLevelByTiers(
  value: number,
  tiers: Array<Record<'level' | 'amount' | 'rate', number>>,
) {
  if (value === STREAK_CONSTANTS.MIN_VALUE) {
    return LEVEL.MIN
  }

  let currentLevel: number = LEVEL.MIN
  let remaining = value

  for (const tier of tiers) {
    const progressInTier = Math.min(remaining, tier.amount)
    const levelsGained = Math.floor(progressInTier / tier.rate)

    currentLevel = Math.min(tier.level, currentLevel + levelsGained)

    if (currentLevel >= tier.level) {
      remaining -= tier.amount
    } else {
      break
    }
  }

  return Math.min(LEVEL.MAX, Math.max(LEVEL.MIN, currentLevel))
}

export function calculateCompletionLevel(uniqueDays: number) {
  const tiers = [
    {
      level: COMPLETION_THRESHOLDS.TIER1.level,
      amount: COMPLETION_THRESHOLDS.TIER1.days,
      rate: COMPLETION_THRESHOLDS.TIER1.rate,
    },
    {
      level: COMPLETION_THRESHOLDS.TIER2.level,
      amount: COMPLETION_THRESHOLDS.TIER2.days,
      rate: COMPLETION_THRESHOLDS.TIER2.rate,
    },
    {
      level: COMPLETION_THRESHOLDS.TIER3.level,
      amount: COMPLETION_THRESHOLDS.TIER3.days,
      rate: COMPLETION_THRESHOLDS.TIER3.rate,
    },
    {
      level: COMPLETION_THRESHOLDS.TIER4.level,
      amount: COMPLETION_THRESHOLDS.TIER4.days,
      rate: COMPLETION_THRESHOLDS.TIER4.rate,
    },
  ] as const satisfies Record<string, number>[]

  return calculateLevelByTiers(uniqueDays, tiers)
}

export function calculateHoursLevel(totalHours: number) {
  const tiers = [
    {
      level: HOURS_THRESHOLDS.TIER1.level,
      amount: HOURS_THRESHOLDS.TIER1.hours,
      rate: HOURS_THRESHOLDS.TIER1.rate,
    },
    {
      level: HOURS_THRESHOLDS.TIER2.level,
      amount: HOURS_THRESHOLDS.TIER2.hours,
      rate: HOURS_THRESHOLDS.TIER2.rate,
    },
    {
      level: HOURS_THRESHOLDS.TIER3.level,
      amount: HOURS_THRESHOLDS.TIER3.hours,
      rate: HOURS_THRESHOLDS.TIER3.rate,
    },
    {
      level: HOURS_THRESHOLDS.TIER4.level,
      amount: HOURS_THRESHOLDS.TIER4.hours,
      rate: HOURS_THRESHOLDS.TIER4.rate,
    },
    {
      level: HOURS_THRESHOLDS.TIER5.level,
      amount: HOURS_THRESHOLDS.TIER5.hours,
      rate: HOURS_THRESHOLDS.TIER5.rate,
    },
    {
      level: HOURS_THRESHOLDS.TIER6.level,
      amount: HOURS_THRESHOLDS.TIER6.hours,
      rate: HOURS_THRESHOLDS.TIER6.rate,
    },
  ] as const satisfies Record<string, number>[]

  return calculateLevelByTiers(totalHours, tiers)
}

export function calculateNextLevelRequirement(currentLevel: number, type: 'completion' | 'hours') {
  if (currentLevel >= LEVEL.MAX) {
    return type === 'completion' ? COMPLETION_THRESHOLDS.MAX_DAYS : HOURS_THRESHOLDS.MAX_HOURS
  }

  if (type === 'completion') {
    return calculateNextCompletionRequirement(currentLevel)
  }

  return calculateNextHoursRequirement(currentLevel)
}

function calculateNextCompletionRequirement(currentLevel: number) {
  const { TIER1, TIER2, TIER3, TIER4 } = COMPLETION_THRESHOLDS

  switch (true) {
    case currentLevel < TIER1.level:
      return currentLevel + STREAK_CONSTANTS.MINIMUM_ACTIVITY

    case currentLevel < TIER2.level:
      return (
        TIER1.days +
        Math.ceil((currentLevel - TIER1.level + STREAK_CONSTANTS.MINIMUM_ACTIVITY) * TIER2.rate)
      )

    case currentLevel < TIER3.level:
      return (
        TIER1.days +
        TIER2.days +
        (currentLevel - TIER2.level + STREAK_CONSTANTS.MINIMUM_ACTIVITY) * TIER3.rate
      )

    default:
      return (
        TIER1.days +
        TIER2.days +
        TIER3.days +
        Math.ceil((currentLevel - TIER3.level + STREAK_CONSTANTS.MINIMUM_ACTIVITY) * TIER4.rate)
      )
  }
}

function calculateNextHoursRequirement(currentLevel: number) {
  const { TIER1, TIER2, TIER3, TIER4, TIER5, TIER6 } = HOURS_THRESHOLDS

  switch (true) {
    case currentLevel < TIER1.level:
      return currentLevel + STREAK_CONSTANTS.MINIMUM_ACTIVITY

    case currentLevel < TIER2.level:
      return (
        TIER1.hours + (currentLevel - TIER1.level + STREAK_CONSTANTS.MINIMUM_ACTIVITY) * TIER2.rate
      )

    case currentLevel < TIER3.level:
      return (
        TIER1.hours +
        TIER2.hours +
        (currentLevel - TIER2.level + STREAK_CONSTANTS.MINIMUM_ACTIVITY) * TIER3.rate
      )

    case currentLevel < TIER4.level:
      return (
        TIER1.hours +
        TIER2.hours +
        TIER3.hours +
        (currentLevel - TIER3.level + STREAK_CONSTANTS.MINIMUM_ACTIVITY) * TIER4.rate
      )

    case currentLevel < TIER5.level:
      return (
        TIER1.hours +
        TIER2.hours +
        TIER3.hours +
        TIER4.hours +
        (currentLevel - TIER4.level + STREAK_CONSTANTS.MINIMUM_ACTIVITY) * TIER5.rate
      )

    default:
      return (
        TIER1.hours +
        TIER2.hours +
        TIER3.hours +
        TIER4.hours +
        TIER5.hours +
        Math.ceil((currentLevel - TIER5.level + STREAK_CONSTANTS.MINIMUM_ACTIVITY) * TIER6.rate)
      )
  }
}

export function calculateProgressPercent(current: number, next: number) {
  if (next === PROGRESS_BAR.MIN) {
    return PROGRESS_BAR.MAX
  }

  return Math.min(PROGRESS_BAR.MAX, Math.round((current / next) * PROGRESS_BAR.MAX))
}

function getUniqueSortedDates(dates: string[]) {
  return [...new Set(dates)].sort()
}

function calculateCurrentStreak(uniqueDates: string[], today: string) {
  let streak = STREAK_CONSTANTS.MIN_VALUE

  for (
    let i = uniqueDates.length - STREAK_CONSTANTS.LAST_INDEX_OFFSET;
    i >= STREAK_CONSTANTS.MIN_VALUE;
    i--
  ) {
    const expectedDate = dayjs(today).subtract(streak, 'day').format('YYYY-MM-DD')

    if (uniqueDates[i] === expectedDate) {
      streak++
    } else {
      break
    }
  }

  return streak
}

function calculatePreviousStreak(uniqueDates: string[]) {
  if (uniqueDates.length === STREAK_CONSTANTS.MIN_VALUE) {
    return STREAK_CONSTANTS.MIN_VALUE
  }

  let streak = STREAK_CONSTANTS.MIN_VALUE

  for (
    let i = uniqueDates.length - STREAK_CONSTANTS.LAST_INDEX_OFFSET;
    i > STREAK_CONSTANTS.MIN_VALUE;
    i--
  ) {
    const currentDate = dayjs(uniqueDates[i])
    const prevDate = dayjs(uniqueDates[i - STREAK_CONSTANTS.LAST_INDEX_OFFSET])

    if (currentDate.diff(prevDate, 'day') === STREAK_CONSTANTS.CONSECUTIVE_DAY_DIFF) {
      streak++
    } else {
      break
    }
  }

  return streak === STREAK_CONSTANTS.MIN_VALUE && uniqueDates.length > STREAK_CONSTANTS.MIN_VALUE
    ? STREAK_CONSTANTS.MINIMUM_ACTIVITY
    : streak
}

function calculateLongestStreak(uniqueDates: string[]) {
  if (uniqueDates.length === STREAK_CONSTANTS.MIN_VALUE) {
    return STREAK_CONSTANTS.MIN_VALUE
  }

  let longest: number = STREAK_CONSTANTS.INITIAL_LONGEST
  let current: number = STREAK_CONSTANTS.INITIAL_CURRENT

  for (let i = STREAK_CONSTANTS.ARRAY_START_INDEX; i < uniqueDates.length; i++) {
    const prevDate = dayjs(uniqueDates[i - STREAK_CONSTANTS.LAST_INDEX_OFFSET])
    const currDate = dayjs(uniqueDates[i])

    if (currDate.diff(prevDate, 'day') === STREAK_CONSTANTS.CONSECUTIVE_DAY_DIFF) {
      current++
      longest = Math.max(longest, current)
    } else {
      current = STREAK_CONSTANTS.INITIAL_CURRENT
    }
  }

  return longest
}

export function calculateStreak(dates: string[]) {
  if (dates.length === STREAK_CONSTANTS.MIN_VALUE) {
    return {
      currentStreak: STREAK_CONSTANTS.MIN_VALUE,
      longestStreak: STREAK_CONSTANTS.MIN_VALUE,
      lastActivityDate: null,
      daysSinceLastActivity: null,
      previousStreak: STREAK_CONSTANTS.MIN_VALUE,
    }
  }

  const uniqueDates = getUniqueSortedDates(dates)
  const today = dayjs().format('YYYY-MM-DD')
  const lastActivityDate = uniqueDates[uniqueDates.length - STREAK_CONSTANTS.LAST_INDEX_OFFSET]
  const daysSinceLastActivity = dayjs(today).diff(dayjs(lastActivityDate), 'day')

  const currentStreak = calculateCurrentStreak(uniqueDates, today)
  const longestStreak = calculateLongestStreak(uniqueDates)
  const previousStreak =
    currentStreak === STREAK_CONSTANTS.MIN_VALUE
      ? calculatePreviousStreak(uniqueDates)
      : STREAK_CONSTANTS.MIN_VALUE

  return {
    currentStreak,
    longestStreak,
    lastActivityDate,
    daysSinceLastActivity,
    previousStreak,
  }
}

function getActiveStreakMessage(currentStreak: number) {
  if (currentStreak === STREAK_THRESHOLDS.FIRST_DAY) {
    return '🌱 素晴らしい！今日から新たなスタートです。この調子で続けましょう！'
  }
  if (currentStreak < STREAK_THRESHOLDS.WEEK) {
    return `🔥 素晴らしい！現在${currentStreak}日間継続中です。この調子で続けましょう！`
  }
  if (currentStreak < STREAK_THRESHOLDS.MONTH) {
    return `⚡ 素晴らしい！${currentStreak}日間の継続は素晴らしい成果です！`
  }
  return `👑 驚異的！${currentStreak}日間の継続は偉業です。あなたは習慣のマスターです！`
}

function getInactiveStreakMessage(daysSinceLastActivity: number | null, previousStreak: number) {
  if (daysSinceLastActivity === null) {
    return '🌱 新たなスタート！小さな一歩から始めましょう。'
  }

  if (daysSinceLastActivity === STREAK_THRESHOLDS.FIRST_DAY) {
    if (previousStreak > STREAK_CONSTANTS.MIN_VALUE) {
      return `⚡ 昨日まで${previousStreak}日間継続していました。今日も実行してストリークを伸ばしましょう！`
    }
    return '💪 昨日実行しました。今日も続けてストリークを作りましょう！'
  }

  if (daysSinceLastActivity <= STREAK_THRESHOLDS.RECENT_DAYS) {
    if (previousStreak > STREAK_CONSTANTS.MIN_VALUE) {
      return `💪 ${daysSinceLastActivity}日前まで${previousStreak}日間継続していました。今日から再開しましょう！`
    }
    return `🌟 ${daysSinceLastActivity}日前に実行しました。今日から再開しましょう！`
  }

  if (previousStreak > STREAK_CONSTANTS.MIN_VALUE) {
    return `🌱 以前は${previousStreak}日間継続していました。新たなスタートを切りましょう！`
  }

  return '🌱 新たなスタート！小さな一歩から始めましょう。'
}

export function generateMotivationMessage(
  currentStreak: number,
  previousStreak: number,
  daysSinceLastActivity: number | null,
) {
  if (currentStreak > STREAK_CONSTANTS.MIN_VALUE) {
    return getActiveStreakMessage(currentStreak)
  }

  return getInactiveStreakMessage(daysSinceLastActivity, previousStreak)
}

export function calculateStreakAtDate(dates: string[], targetDate: string) {
  if (dates.length === STREAK_CONSTANTS.MIN_VALUE) {
    return STREAK_CONSTANTS.MIN_VALUE
  }

  const uniqueDates = getUniqueSortedDates(dates)
  const target = dayjs(targetDate).format('YYYY-MM-DD')

  const datesUpToTarget = uniqueDates.filter((date) => dayjs(date).isSameOrBefore(target, 'day'))

  if (datesUpToTarget.length === STREAK_CONSTANTS.MIN_VALUE) {
    return STREAK_CONSTANTS.MIN_VALUE
  }

  return calculateCurrentStreak(datesUpToTarget, target)
}

const LEVEL_TITLE_THRESHOLDS = {
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

const COMPLETION_TITLES = [
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

const HOURS_TITLES = [
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

function findLevelTitle(
  level: number,
  titles: Readonly<
    Array<{
      maxLevel: number
      info: Pick<HabitLevelInfo['hours'], 'title' | 'icon' | 'color'>
    }>
  >,
) {
  const found = titles.find((t) => level <= t.maxLevel)

  return found?.info ?? titles[titles.length - STREAK_CONSTANTS.LAST_INDEX_OFFSET].info
}

export function getLevelTitle(level: number, type: 'completion' | 'hours') {
  return type === 'completion'
    ? findLevelTitle(level, COMPLETION_TITLES)
    : findLevelTitle(level, HOURS_TITLES)
}

export function calculateHabitStats(records: Array<RecordWithDuration>) {
  const completedRecords = records.filter((r) => r.status === 'completed')

  const uniqueDays = new Set(completedRecords.map((r) => r.date)).size

  const totalMinutes = completedRecords.reduce(
    (sum, r) => sum + (r.duration_minutes ?? STREAK_CONSTANTS.MIN_VALUE),
    STREAK_CONSTANTS.MIN_VALUE as number,
  )
  const totalHours = totalMinutes / STREAK_CONSTANTS.MINUTES_TO_HOURS_DIVISOR

  const { currentStreak, longestStreak } = calculateStreak(completedRecords.map((r) => r.date))

  const dates = completedRecords.map((r) => r.date).sort()
  const lastDate = dates[dates.length - STREAK_CONSTANTS.LAST_INDEX_OFFSET] ?? null

  return {
    uniqueDays,
    completionLevel: calculateCompletionLevel(uniqueDays),
    totalHours,
    hoursLevel: calculateHoursLevel(totalHours),
    currentStreak,
    longestStreak,
    lastDate,
  }
}

export function calculateLevelInfo(
  levelData: HabitLevelTable,
  records: Array<RecordWithDate>,
  selectedDate?: SearchParams['selectedDate'],
) {
  const completionTitle = getLevelTitle(levelData.completionLevel, 'completion')
  const hoursTitle = getLevelTitle(levelData.hoursLevel, 'hours')

  const nextCompletionDays = calculateNextLevelRequirement(levelData.completionLevel, 'completion')
  const nextHoursRequirement = calculateNextLevelRequirement(levelData.hoursLevel, 'hours')

  const completedDates = records.filter((r) => r.status === 'completed').map((r) => r.date)

  const streakDetails = calculateStreak(completedDates)
  const motivationMessage = generateMotivationMessage(
    streakDetails.currentStreak,
    streakDetails.previousStreak,
    streakDetails.daysSinceLastActivity,
  )

  const yesterday = dayjs().subtract(STREAK_CONSTANTS.YESTERDAY_OFFSET, 'day').format('YYYY-MM-DD')
  const yesterdayStreak = calculateStreakAtDate(completedDates, yesterday)
  const selectedDateStreak = selectedDate
    ? calculateStreakAtDate(completedDates, selectedDate)
    : null

  return {
    completion: {
      level: levelData.completionLevel,
      currentDays: levelData.uniqueCompletionDays,
      nextLevelDays: nextCompletionDays,
      progressPercent: calculateProgressPercent(levelData.uniqueCompletionDays, nextCompletionDays),
      ...completionTitle,
    },
    hours: {
      level: levelData.hoursLevel,
      currentHours: levelData.totalHoursDecimal,
      nextLevelHours: nextHoursRequirement,
      progressPercent: calculateProgressPercent(levelData.totalHoursDecimal, nextHoursRequirement),
      ...hoursTitle,
    },
    streak: {
      current: streakDetails.currentStreak,
      longest: streakDetails.longestStreak,
      lastActivityDate: streakDetails.lastActivityDate,
      daysSinceLastActivity: streakDetails.daysSinceLastActivity,
      previousStreak: streakDetails.previousStreak,
      motivationMessage,
      yesterdayStreak,
      selectedDateStreak,
    },
  }
}

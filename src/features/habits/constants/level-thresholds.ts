export const LEVEL = {
  MIN: 1,
  MAX: 999,
} as const satisfies Record<string, number>

export const COMPLETION_THRESHOLDS = {
  TIER1: { level: 100, days: 100, rate: 1 },
  TIER2: { level: 300, days: 300, rate: 1.5 },
  TIER3: { level: 500, days: 400, rate: 2 },
  TIER4: { level: 999, days: 295, rate: 0.59 },
  MAX_DAYS: 1095,
} as const satisfies Record<string, number | Record<string, number>>

export const HOURS_THRESHOLDS = {
  TIER1: { level: 100, hours: 100, rate: 1 },
  TIER2: { level: 300, hours: 400, rate: 2 },
  TIER3: { level: 500, hours: 1000, rate: 5 },
  TIER4: { level: 700, hours: 2000, rate: 10 },
  TIER5: { level: 900, hours: 4000, rate: 20 },
  TIER6: { level: 999, hours: 2500, rate: 25.25 },
  MAX_HOURS: 10000,
} as const satisfies Record<string, number | Record<string, number>>

export const STREAK_THRESHOLDS = {
  WEEK: 7,
  MONTH: 30,
  RECENT_DAYS: 7,
  FIRST_DAY: 1,
} as const satisfies Record<string, number>

export const PROGRESS_BAR = {
  MIN: 0,
  MAX: 100,
} as const satisfies Record<string, number>

export const STREAK_CONSTANTS = {
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

import type { InferSelectModel } from 'drizzle-orm'
import type { habits, records } from '~/db/schema'
import type { SearchParams } from '~/features/habits/types/schemas/search-params'

export type PomodoroPhase = NonNullable<SearchParams['pomodoroPhase']>

export type PomodoroSettings = Record<
  'focusDuration' | 'breakDuration' | 'longBreakDuration' | 'longBreakInterval',
  number
>

export type PomodoroState = Record<'phase', SearchParams['pomodoroPhase']> &
  Record<'currentSet' | 'completedPomodoros' | 'accumulatedFocusTime', number>

export type PhaseConfig = Record<'title' | 'message', string> & {
  color: InferSelectModel<typeof habits>['color']
  duration: InferSelectModel<typeof records>['duration_minutes']
}

export type NotificationConfig = Pick<PhaseConfig, 'title' | 'message'> &
  Pick<InferSelectModel<typeof habits>, 'color'>

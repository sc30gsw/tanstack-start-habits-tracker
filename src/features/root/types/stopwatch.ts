import type { InferSelectModel } from 'drizzle-orm'
import type { habits, records } from '~/db/schema'

export type StopwatchMode = 'stopwatch' | 'pomodoro'

export type PomodoroPhase = 'focus' | 'break' | 'longBreak' | 'waiting'

export type PomodoroSettings = Record<
  'focusDuration' | 'breakDuration' | 'longBreakDuration' | 'longBreakInterval',
  number
>

export type PomodoroState = Record<'phase', PomodoroPhase> &
  Record<'currentSet' | 'completedPomodoros' | 'accumulatedFocusTime', number>

export type PhaseConfig = Record<'title' | 'message', string> & {
  color: InferSelectModel<typeof habits>['color']
  duration: InferSelectModel<typeof records>['duration_minutes']
}

export type NotificationConfig = Pick<PhaseConfig, 'title' | 'message'> &
  Pick<InferSelectModel<typeof habits>, 'color'>

import type { SearchParams } from '~/features/habits/types/schemas/search-params'
import type { PomodoroSettings } from '~/features/root/types/stopwatch'

/**
 * デフォルトのポモドーロ設定
 */
export const DEFAULT_POMODORO_SETTINGS = {
  focusDuration: 25, // 25分
  breakDuration: 5, // 5分
  longBreakDuration: 15, // 15分
  longBreakInterval: 3, // 3セット毎
} as const satisfies PomodoroSettings

/**
 * 次のフェーズを決定する
 */
export function determineNextPhase(
  currentPhase: SearchParams['pomodoroPhase'],
  completedPomodoros: number,
  longBreakInterval: number,
) {
  if (currentPhase === 'focus') {
    const shouldLongBreak = (completedPomodoros + 1) % longBreakInterval === 0

    return shouldLongBreak ? 'longBreak' : 'break'
  }

  return 'focus'
}

/**
 * 現在のフェーズの時間設定を取得する（分）
 */
export function getCurrentPhaseDuration(
  phase: NonNullable<SearchParams['pomodoroPhase']>,
  settings: PomodoroSettings,
) {
  const durations = {
    focus: settings.focusDuration,
    break: settings.breakDuration,
    longBreak: settings.longBreakDuration,
    waiting: 0,
  } as const satisfies Record<NonNullable<SearchParams['pomodoroPhase']>, number>

  return durations[phase]
}

/**
 * フェーズに応じたカラーを取得する
 */
export function getPhaseColor(phase: NonNullable<SearchParams['pomodoroPhase']>) {
  const colors = {
    focus: 'red',
    break: 'green',
    longBreak: 'grape',
    waiting: 'gray',
  } as const satisfies Record<NonNullable<SearchParams['pomodoroPhase']>, string>

  return colors[phase]
}

/**
 * フェーズに応じたラベルを取得する
 */
export function getPhaseLabel(phase: NonNullable<SearchParams['pomodoroPhase']>) {
  const labels = {
    focus: '🍅 集中時間',
    break: '☕ 休憩',
    longBreak: '🌟 長い休憩',
    waiting: '待機中',
  } as const satisfies Record<NonNullable<SearchParams['pomodoroPhase']>, string>

  return labels[phase]
}

/**
 * 開始ボタンのラベルを取得する
 */
export function getStartButtonLabel(nextPhase: NonNullable<SearchParams['pomodoroPhase']>) {
  const labels = {
    focus: '集中開始',
    break: '休憩開始',
    longBreak: '長い休憩開始',
    waiting: '開始',
  } as const satisfies Record<NonNullable<SearchParams['pomodoroPhase']>, string>

  return labels[nextPhase]
}

/**
 * 次に開始するフェーズを決定する（waiting状態から）
 */
export function determineStartPhase(completedPomodoros: number, longBreakInterval: number) {
  if (completedPomodoros === 0) {
    return 'focus'
  }

  const shouldLongBreak = completedPomodoros % longBreakInterval === 0

  return shouldLongBreak ? 'longBreak' : 'break'
}

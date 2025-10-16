import type { PomodoroPhase, PomodoroSettings } from '~/features/root/types/stopwatch'

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
  currentPhase: PomodoroPhase,
  completedPomodoros: number,
  longBreakInterval: number,
) {
  if (currentPhase === 'focus') {
    // 完了したポモドーロ数が長い休憩の間隔の倍数なら長い休憩
    // completedPomodorosは既に+1されているため、そのまま判定
    const shouldLongBreak = completedPomodoros % longBreakInterval === 0

    return shouldLongBreak ? 'longBreak' : 'break'
  }

  // 休憩終了後は必ず集中時間に戻る
  if (currentPhase === 'break' || currentPhase === 'longBreak') {
    return 'focus'
  }

  // waiting状態からの開始
  return 'focus'
}

/**
 * 現在のフェーズの時間設定を取得する（分）
 */
export function getCurrentPhaseDuration(phase: PomodoroPhase, settings: PomodoroSettings) {
  const durations = {
    focus: settings.focusDuration,
    break: settings.breakDuration,
    longBreak: settings.longBreakDuration,
    waiting: 0,
  } as const satisfies Record<PomodoroPhase, number>

  return durations[phase]
}

/**
 * フェーズに応じたカラーを取得する
 */
export function getPhaseColor(phase: PomodoroPhase) {
  const colors = {
    focus: 'red',
    break: 'green',
    longBreak: 'grape',
    waiting: 'gray',
  } as const satisfies Record<PomodoroPhase, string>

  return colors[phase]
}

/**
 * フェーズに応じたラベルを取得する
 */
export function getPhaseLabel(phase: PomodoroPhase) {
  const labels = {
    focus: '🍅 集中時間',
    break: '☕ 休憩',
    longBreak: '🌟 長い休憩',
    waiting: '待機中',
  } as const satisfies Record<PomodoroPhase, string>

  return labels[phase]
}

/**
 * 開始ボタンのラベルを取得する
 */
export function getStartButtonLabel(nextPhase: PomodoroPhase) {
  const labels = {
    focus: '集中開始',
    break: '休憩開始',
    longBreak: '長い休憩開始',
    waiting: '開始',
  } as const satisfies Record<PomodoroPhase, string>

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

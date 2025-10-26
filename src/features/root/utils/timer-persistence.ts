import type { InferSelectModel } from 'drizzle-orm'
import type { habits } from '~/db/schema'
import type { PomodoroPhase, PomodoroSettings } from '~/features/root/types/stopwatch'

const STORAGE_KEY = 'habits-tracker-timer-state'

export type TimerState = {
  mode: 'stopwatch' | 'pomodoro'
  habitId: InferSelectModel<typeof habits>['id'] | null
  isRunning: boolean
  startTime: number | null
  pausedElapsed: number
  // ポモドーロ固有
  phase?: PomodoroPhase
  currentSet?: number
  completedPomodoros?: number
  accumulatedTime?: number
  settings?: PomodoroSettings
  // タイムスタンプ
  lastSaved: number
}

/**
 * タイマーの状態をLocalStorageに保存
 */
export function saveTimerState(state: TimerState) {
  try {
    const stateWithTimestamp = {
      ...state,
      lastSaved: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateWithTimestamp))
  } catch (error) {
    console.error('タイマー状態の保存に失敗:', error)
  }
}

/**
 * LocalStorageからタイマーの状態を復元
 * 24時間以上古い状態は無視する
 */
export function loadTimerState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const state = JSON.parse(stored) as TimerState
    const now = Date.now()
    const hoursSinceLastSave = (now - state.lastSaved) / (1000 * 60 * 60)

    // 24時間以上経過している場合は無視
    if (hoursSinceLastSave > 24) {
      clearTimerState()
      return null
    }

    return state
  } catch (error) {
    console.error('タイマー状態の復元に失敗:', error)
    return null
  }
}

/**
 * 保存されたタイマー状態をクリア
 */
export function clearTimerState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('タイマー状態のクリアに失敗:', error)
  }
}

/**
 * Wake Lock API を使用して画面のスリープを防止
 */
export class WakeLockManager {
  private wakeLock: WakeLockSentinel | null = null

  /**
   * Wake Lockを要求
   */
  async request(): Promise<boolean> {
    // 既にアクティブな場合はスキップ
    if (this.isActive()) {
      console.log('🔒 Wake Lock は既に取得済み')
      return true
    }

    if (!('wakeLock' in navigator)) {
      console.warn('Wake Lock API はこのブラウザではサポートされていません')
      return false
    }

    try {
      this.wakeLock = await navigator.wakeLock.request('screen')

      // Wake Lockが解除されたときのハンドラー
      this.wakeLock.addEventListener('release', () => {
        console.log('🔓 Wake Lock解除')
        this.wakeLock = null
      })

      console.log('🔒 Wake Lock取得成功')

      return true
    } catch (error) {
      console.error('Wake Lock取得に失敗:', error)
      return false
    }
  }

  /**
   * Wake Lockを解放
   */
  async release() {
    if (this.wakeLock && !this.wakeLock.released) {
      try {
        console.log('🔓 Wake Lock解放開始...')
        await this.wakeLock.release()
        this.wakeLock = null
        console.log('✅ Wake Lock解放完了')
      } catch (error) {
        console.error('❌ Wake Lock解放に失敗:', error)
        // エラーでも null にして次回の request を可能にする
        this.wakeLock = null
      }
    } else if (this.wakeLock) {
      console.log('ℹ️ Wake Lock は既に解放済み')
      this.wakeLock = null
    }
  }

  /**
   * Wake Lockがアクティブかどうか
   */
  isActive() {
    return this.wakeLock !== null && !this.wakeLock.released
  }
}

/**
 * ページの可視性が変わったときに実行されるコールバックを登録
 */
export function onVisibilityChange(callback: (isVisible: boolean) => void) {
  const handleVisibilityChange = () => {
    callback(!document.hidden)
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)

  // クリーンアップ関数を返す
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
}

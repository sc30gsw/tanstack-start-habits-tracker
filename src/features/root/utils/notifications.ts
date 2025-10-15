import { notifications } from '@mantine/notifications'
import type { NotificationConfig, PomodoroPhase } from '~/features/root/types/stopwatch'

// 最後に表示された通知のタイムスタンプを記録（重複防止用）
let lastNotificationTime = 0
const NOTIFICATION_DEBOUNCE_MS = 1000 // 1秒以内の重複を防ぐ

/**
 * ブラウザ通知の権限をリクエストする
 */
export async function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission()
  }
}

/**
 * フェーズ完了時の通知設定を取得する
 */
function getPhaseCompleteConfig(currentPhase: PomodoroPhase, nextPhase: PomodoroPhase) {
  const configs = {
    focus: {
      title: '🍅 集中時間完了！',
      message: nextPhase === 'longBreak' ? '長い休憩に入ります' : '休憩しましょう',
      color: 'green',
    },
    break: {
      title: '⏰ 休憩終了',
      message: '次の集中時間を始めましょう',
      color: 'blue',
    },
    longBreak: {
      title: '🎉 長い休憩終了',
      message: '新しいサイクルを始めましょう！',
      color: 'grape',
    },
    waiting: {
      title: '',
      message: '',
      color: 'gray',
    },
  } as const satisfies Record<PomodoroPhase, NotificationConfig>

  return configs[currentPhase]
}

/**
 * 音声通知を再生する
 */
function playNotificationSound() {
  // ブラウザのデフォルト音を使用（実際の音声ファイルは不要）
  const audioContext = new AudioContext()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.value = 800
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.5)
}

/**
 * フェーズ完了通知を表示する
 */
export function showPhaseCompleteNotification(
  currentPhase: PomodoroPhase,
  nextPhase: PomodoroPhase,
) {
  const now = Date.now()

  // デバウンス: 1秒以内の重複通知を防ぐ
  if (now - lastNotificationTime < NOTIFICATION_DEBOUNCE_MS) {
    if (import.meta.env.DEV) {
      console.log('🚫 通知デバウンス: 重複防止')
    }
    return
  }

  lastNotificationTime = now
  const config = getPhaseCompleteConfig(currentPhase, nextPhase)
  const notificationId = `pomodoro-phase-${currentPhase}-to-${nextPhase}`

  // Mantine通知（IDを付けて重複を防ぐ）
  notifications.show({
    id: notificationId,
    title: config.title,
    message: config.message,
    color: config.color,
    autoClose: 5000,
  })

  // ブラウザ通知
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(config.title, {
      body: config.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: notificationId, // 同じtagの通知は置き換えられる
    })

    // 通知を3秒後に自動クローズ
    setTimeout(() => notification.close(), 3000)
  }

  // 音声通知
  playNotificationSound()
}

/**
 * ポモドーロ完了通知を表示する
 */
export function showPomodoroCompleteNotification(completedSets: number) {
  notifications.show({
    title: '🎉 ポモドーロ完了！',
    message: `${completedSets}セット完了しました`,
    color: 'green',
    autoClose: 5000,
  })
}

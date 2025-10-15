import { notifications } from '@mantine/notifications'
import type { NotificationConfig, PomodoroPhase } from '~/features/root/types/stopwatch'

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
      message:
        nextPhase === 'longBreak'
          ? '素晴らしい！15分の長い休憩です'
          : '素晴らしい！5分休憩しましょう',
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
  const config = getPhaseCompleteConfig(currentPhase, nextPhase)

  // Mantine通知
  notifications.show({
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

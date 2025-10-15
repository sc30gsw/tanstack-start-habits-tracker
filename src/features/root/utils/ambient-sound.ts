export const AMBIENT_SOUNDS = [
  { id: 'none', name: 'なし', file: null },
  { id: 'rain', name: '🌧️ 雨音', file: '/audio/雨.mp3' },
  { id: 'thunder-rain', name: '⛈️ 雷雨', file: '/audio/雷雨.mp3' },
  { id: 'wave', name: '🌊 波の音', file: '/audio/波.mp3' },
  { id: 'river', name: '💧 川のせせらぎ', file: '/audio/川.mp3' },
  { id: 'waterfall', name: '💦 滝の音', file: '/audio/滝.mp3' },
  { id: 'bonfire', name: '🔥 焚き火', file: '/audio/焚き火.mp3' },
  { id: 'morning-bird', name: '🐦 小鳥のさえずり', file: '/audio/朝の雰囲気（鳥）.mp3' },
  { id: 'cafe', name: '☕ カフェの雰囲気', file: '/audio/カフェ.mp3' },
  { id: 'countryside', name: '🌾 田園風景', file: '/audio/countryside.mp3' },
  { id: 'harbor', name: '⚓ 港の音', file: '/audio/港.mp3' },
] as const satisfies readonly { id: string; name: string; file: `/audio/${string}.mp3` | null }[]

export type AmbientSound = (typeof AMBIENT_SOUNDS)[number]
export type AmbientSoundId = AmbientSound['id']

const STORAGE_KEY = 'habits-tracker-ambient-settings'

export type AmbientSettings = {
  soundId: AmbientSound['id']
  volume: number
}

/**
 * 環境音の設定をLocalStorageに保存
 */
export function saveAmbientSettings(settings: AmbientSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('環境音設定の保存に失敗:', error)
  }
}

/**
 * LocalStorageから環境音の設定を復元
 */
export function loadAmbientSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (!stored) {
      return null
    }

    return JSON.parse(stored) as AmbientSettings
  } catch (error) {
    console.error('環境音設定の復元に失敗:', error)
    return null
  }
}

/**
 * 環境音を管理するクラス
 */
export class AmbientSoundManager {
  private audio: HTMLAudioElement | null = null
  private currentSoundId: AmbientSound['id'] = 'none'
  private currentVolume = 0.5

  constructor() {
    // 保存された設定を復元
    const savedSettings = loadAmbientSettings()
    if (savedSettings) {
      this.currentVolume = savedSettings.volume
    }
  }

  /**
   * 環境音を再生
   */
  play(soundId: AmbientSound['id']) {
    // 同じ音源が既に再生中の場合は何もしない
    if (this.currentSoundId === soundId && this.audio && !this.audio.paused) {
      return
    }

    // 現在再生中の音源を停止
    this.stop()

    // "なし"が選択された場合は停止のみ
    if (soundId === 'none') {
      this.currentSoundId = 'none'
      return
    }

    const sound = AMBIENT_SOUNDS.find((s) => s.id === soundId)
    if (!sound || !sound.file) {
      console.warn(`環境音が見つかりません: ${soundId}`)
      return
    }

    try {
      this.audio = new Audio(sound.file)
      this.audio.loop = true // 無限ループ
      this.audio.volume = this.currentVolume
      this.currentSoundId = soundId

      // 再生を試みる
      const playPromise = this.audio.play()

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error('環境音の再生に失敗:', error)
        })
      }
    } catch (error) {
      console.error('環境音の初期化に失敗:', error)
    }
  }

  /**
   * 環境音を停止
   */
  stop() {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
      this.audio = null
    }

    this.currentSoundId = 'none'
  }

  /**
   * 音量を設定（0.0 - 1.0）
   */
  setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume))

    if (this.audio) {
      this.audio.volume = this.currentVolume
    }

    // 設定を保存
    saveAmbientSettings({
      soundId: this.currentSoundId,
      volume: this.currentVolume,
    })
  }

  /**
   * 現在の音量を取得
   */
  getVolume() {
    return this.currentVolume
  }

  /**
   * 現在再生中の環境音IDを取得
   */
  getCurrentSoundId() {
    return this.currentSoundId
  }

  /**
   * 再生中かどうか
   */
  isPlaying() {
    return this.audio !== null && !this.audio.paused
  }

  /**
   * リソースをクリーンアップ
   */
  dispose() {
    this.stop()
  }
}

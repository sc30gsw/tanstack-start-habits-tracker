/**
 * 時間関連のユーティリティ関数
 */

/**
 * 分を「X時間（Y分）」形式にフォーマット
 * @param minutes 分数
 * @returns フォーマットされた文字列
 */
export function formatDuration(minutes: number) {
  if (minutes <= 0) return '0分'

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) {
    return `${remainingMinutes}分`
  }

  if (remainingMinutes === 0) {
    return `${hours}時間（${minutes}分）`
  }

  return `${hours}時間${remainingMinutes}分（${minutes}分）`
}

/**
 * 時間を分に変換
 * @param hours 時間（小数点可）
 * @returns 分数
 */
export function hoursToMinutes(hours: number) {
  return Math.round(hours * 60)
}

/**
 * 分を時間に変換
 * @param minutes 分数
 * @returns 時間（小数点）
 */
export function minutesToHours(minutes: number) {
  return Number((minutes / 60).toFixed(2))
}

/**
 * 合計時間を表示用文字列にフォーマット
 * @param totalMinutes 合計分数
 * @returns 表示用文字列（例: "合計: 5時間30分（330分）"）
 */
export function formatTotalDuration(totalMinutes: number) {
  if (totalMinutes <= 0) {
    return '合計: 0分'
  }

  return `合計: ${formatDuration(totalMinutes)}`
}

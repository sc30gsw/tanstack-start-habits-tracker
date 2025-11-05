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

export function hoursToMinutes(hours: number) {
  return Math.round(hours * 60)
}

export function minutesToHours(minutes: number) {
  return Number((minutes / 60).toFixed(2))
}

export function formatTotalDuration(totalMinutes: number) {
  if (totalMinutes <= 0) {
    return '合計: 0分'
  }

  return `合計: ${formatDuration(totalMinutes)}`
}

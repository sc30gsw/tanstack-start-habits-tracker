const MINIMUM_RECORDABLE_SECONDS = 60
const SECONDS_PER_MINUTE = 60

export function convertSecondsToMinutes(seconds: number): number {
  if (seconds < MINIMUM_RECORDABLE_SECONDS) {
    return 0
  }
  return Math.round(seconds / SECONDS_PER_MINUTE)
}

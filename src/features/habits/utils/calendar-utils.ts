import dayjs from 'dayjs'

// 日本の祝日を判定する関数
export function isJapaneseHoliday(date: dayjs.Dayjs): boolean {
  const year = date.year()
  const month = date.month() + 1 // dayjsは0ベースなので+1
  const day = date.date()

  // 固定祝日
  const fixedHolidays = [
    { month: 1, day: 1 }, // 元日
    { month: 2, day: 11 }, // 建国記念の日
    { month: 2, day: 23 }, // 天皇誕生日
    { month: 4, day: 29 }, // 昭和の日
    { month: 5, day: 3 }, // 憲法記念日
    { month: 5, day: 4 }, // みどりの日
    { month: 5, day: 5 }, // こどもの日
    { month: 8, day: 11 }, // 山の日
    { month: 11, day: 3 }, // 文化の日
    { month: 11, day: 23 }, // 勤労感謝の日
  ] as const satisfies Record<string, number>[]

  // 固定祝日チェック
  if (fixedHolidays.some((h) => h.month === month && h.day === day)) {
    return true
  }

  // 移動祝日（簡略版）
  // 成人の日（1月第2月曜日）
  if (month === 1) {
    const firstMonday = dayjs(`${year}-01-01`).day(1) // 最初の月曜日
    if (firstMonday.date() > 7) {
      firstMonday.add(7, 'day') // 第2週に調整
    }
    const secondMonday = firstMonday.add(7, 'day')
    if (day === secondMonday.date()) return true
  }

  // 海の日（7月第3月曜日）
  if (month === 7) {
    const firstMonday = dayjs(`${year}-07-01`).day(1)
    if (firstMonday.date() > 7) {
      firstMonday.add(7, 'day')
    }
    const thirdMonday = firstMonday.add(14, 'day')
    if (day === thirdMonday.date()) return true
  }

  // 敬老の日（9月第3月曜日）
  if (month === 9) {
    const firstMonday = dayjs(`${year}-09-01`).day(1)
    if (firstMonday.date() > 7) {
      firstMonday.add(7, 'day')
    }
    const thirdMonday = firstMonday.add(14, 'day')
    if (day === thirdMonday.date()) return true
  }

  // スポーツの日（10月第2月曜日）
  if (month === 10) {
    const firstMonday = dayjs(`${year}-10-01`).day(1)
    if (firstMonday.date() > 7) {
      firstMonday.add(7, 'day')
    }
    const secondMonday = firstMonday.add(7, 'day')
    if (day === secondMonday.date()) return true
  }

  // 春分の日・秋分の日（概算）
  if (month === 3) {
    const vernal = Math.floor(20.8431 + 0.242194 * (year - 1851) - Math.floor((year - 1851) / 4))
    if (day === vernal) return true
  }
  if (month === 9) {
    const autumnal = Math.floor(23.2488 + 0.242194 * (year - 1851) - Math.floor((year - 1851) / 4))
    if (day === autumnal) return true
  }

  return false
}

// 日付の種類を判定する関数
export function getDateType(date: dayjs.Dayjs): 'holiday' | 'saturday' | 'sunday' | 'weekday' {
  const dayOfWeek = date.day() // 0: 日曜, 1: 月曜, ..., 6: 土曜

  if (isJapaneseHoliday(date) || dayOfWeek === 0) {
    return 'holiday' // 祝日または日曜日
  }

  if (dayOfWeek === 6) {
    return 'saturday' // 土曜日
  }

  return 'weekday' // 平日
}

// 日付タイプに応じた色を取得する関数
export function getDateColor(dateType: string, isSelected: boolean, hasRecord: boolean): string {
  if (isSelected) {
    return 'var(--mantine-color-blue-6)'
  }

  if (hasRecord) {
    return 'var(--mantine-color-green-6)' // 記録がある場合は緑
  }

  switch (dateType) {
    case 'holiday':
      return 'var(--mantine-color-red-1)' // 祝日・日曜日は薄い赤
    case 'saturday':
      return 'var(--mantine-color-blue-1)' // 土曜日は薄い青
    default:
      return 'var(--mantine-color-gray-0)' // 平日は通常色
  }
}

// 日付タイプに応じたテキスト色を取得する関数
export function getDateTextColor(
  dateType: string,
  isSelected: boolean,
  hasRecord: boolean,
  isFuture: boolean,
): string {
  if (isFuture) {
    return 'var(--mantine-color-gray-5)'
  }

  if (isSelected || hasRecord) {
    return '#fff'
  }

  switch (dateType) {
    case 'holiday':
      return 'var(--mantine-color-red-7)' // 祝日・日曜日は赤文字
    case 'saturday':
      return 'var(--mantine-color-blue-7)' // 土曜日は青文字
    default:
      return 'var(--mantine-color-dark-7)' // 平日は通常の文字色
  }
}

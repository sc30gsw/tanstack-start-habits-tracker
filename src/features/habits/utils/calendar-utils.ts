import { isHoliday } from '@holiday-jp/holiday_jp'
import type dayjs from 'dayjs'

// 日本の祝日を判定する関数
export function isJapaneseHoliday(date: dayjs.Dayjs) {
  // @holiday-jp/holiday_jpライブラリを使用して正確な祝日判定
  const dateString = date.format('YYYY-MM-DD')
  return isHoliday(new Date(dateString))
}

// 日付の種類を判定する関数
export function getDateType(date: dayjs.Dayjs) {
  const dayOfWeek = date.day()

  switch (dayOfWeek) {
    case 0:
      return 'sunday' // 日曜日
    case 6:
      return 'saturday' // 土曜日
    default:
      return isJapaneseHoliday(date) ? 'holiday' : 'weekday' // 祝日か平日
  }
}

// 日付タイプに応じた色を取得する関数
export function getDateColor(
  dateType: ReturnType<typeof getDateType>,
  isSelected: boolean,
  hasRecord: boolean,
) {
  if (isSelected) {
    return 'var(--mantine-color-blue-6)'
  }

  if (hasRecord) {
    return 'var(--mantine-color-green-6)' // 記録がある場合は緑
  }

  switch (dateType) {
    case 'sunday':
      return 'var(--mantine-color-red-1)' // 日曜日は薄い赤
    case 'holiday':
      return 'var(--mantine-color-red-1)' // 祝日は薄い赤
    case 'saturday':
      return 'var(--mantine-color-blue-1)' // 土曜日は薄い青
    default:
      return 'var(--mantine-color-gray-0)' // 平日は通常色
  }
}

// 日付タイプに応じたテキスト色を取得する関数
export function getDateTextColor(
  dateType: ReturnType<typeof getDateType>,
  isSelected: boolean,
  hasRecord: boolean,
) {
  if (isSelected || hasRecord) {
    return '#fff'
  }

  switch (dateType) {
    case 'sunday':
      return 'var(--mantine-color-red-7)' // 日曜日は赤文字
    case 'holiday':
      return 'var(--mantine-color-red-7)' // 祝日は赤文字
    case 'saturday':
      return 'var(--mantine-color-blue-7)' // 土曜日は青文字
    default:
      return 'var(--mantine-color-dark-7)' // 平日は通常の文字色
  }
}

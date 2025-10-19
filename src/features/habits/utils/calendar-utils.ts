import { isHoliday } from '@holiday-jp/holiday_jp'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

export const WEEK_DAYS = [
  '日',
  '月',
  '火',
  '水',
  '木',
  '金',
  '土',
] as const satisfies readonly string[]

export function isJapaneseHoliday(date: dayjs.Dayjs) {
  const dateString = date.format('YYYY-MM-DD')

  return isHoliday(new Date(dateString))
}

export function getDateType(date: dayjs.Dayjs) {
  const dayOfWeek = date.day()

  switch (dayOfWeek) {
    case 0:
      return 'sunday'

    case 6:
      return 'saturday'

    default:
      return isJapaneseHoliday(date) ? 'holiday' : 'weekday'
  }
}

export function getDateColor(
  dateType: ReturnType<typeof getDateType>,
  isSelected?: boolean,
  hasRecord?: boolean,
  colorStrength?: number,
) {
  if (isSelected) {
    return 'var(--mantine-color-blue-6)'
  }

  if (hasRecord) {
    return 'var(--mantine-color-green-6)'
  }

  switch (dateType) {
    case 'sunday':
      return `var(--mantine-color-red-${colorStrength ?? 1})`

    case 'holiday':
      return `var(--mantine-color-red-${colorStrength ?? 1})`

    case 'saturday':
      return `var(--mantine-color-blue-${colorStrength ?? 1})`

    default:
      return `var(--mantine-color-gray-${colorStrength ?? 0})`
  }
}

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
      return 'var(--mantine-color-red-7)'

    case 'holiday':
      return 'var(--mantine-color-red-7)'

    case 'saturday':
      return 'var(--mantine-color-blue-7)'

    default:
      return 'var(--mantine-color-dark-7)'
  }
}

export function getDatePresets() {
  const today = dayjs().tz('Asia/Tokyo')

  const formatDateLabel = (date: dayjs.Dayjs, baseLabel: string) => {
    const dateStr = date.format('YYYY-MM-DD')
    const dayOfWeek = WEEK_DAYS[date.day()]
    const dateType = getDateType(date)

    return {
      label: baseLabel,
      dateStr,
      dayOfWeek,
      dateType,
    }
  }

  return [
    {
      group: 'basic',
      groupLabel: '基本',
      items: [
        {
          value: today.subtract(1, 'day').format('YYYY-MM-DD'),
          ...formatDateLabel(today.subtract(1, 'day'), '昨日'),
        },
        {
          value: today.format('YYYY-MM-DD'),
          ...formatDateLabel(today, '今日'),
        },
        {
          value: today.add(1, 'day').format('YYYY-MM-DD'),
          ...formatDateLabel(today.add(1, 'day'), '明日'),
        },
      ],
    },
    {
      group: 'week',
      groupLabel: '週',
      items: [
        {
          value: today.startOf('week').format('YYYY-MM-DD'),
          ...formatDateLabel(today.startOf('week'), '今週の開始'),
        },
        {
          value: today.subtract(1, 'week').startOf('week').format('YYYY-MM-DD'),
          ...formatDateLabel(today.subtract(1, 'week').startOf('week'), '先週の開始'),
        },
        {
          value: today.subtract(7, 'day').format('YYYY-MM-DD'),
          ...formatDateLabel(today.subtract(7, 'day'), '7日前'),
        },
      ],
    },
    {
      group: 'month',
      groupLabel: '月',
      items: [
        {
          value: today.startOf('month').format('YYYY-MM-DD'),
          ...formatDateLabel(today.startOf('month'), '今月の初日'),
        },
        {
          value: today.subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
          ...formatDateLabel(today.subtract(1, 'month').startOf('month'), '先月の初日'),
        },
        {
          value: today.subtract(30, 'day').format('YYYY-MM-DD'),
          ...formatDateLabel(today.subtract(30, 'day'), '30日前'),
        },
      ],
    },
    {
      group: 'year',
      groupLabel: '年',
      items: [
        {
          value: today.startOf('year').format('YYYY-MM-DD'),
          ...formatDateLabel(today.startOf('year'), '今年の初日'),
        },
        {
          value: today.subtract(1, 'year').startOf('year').format('YYYY-MM-DD'),
          ...formatDateLabel(today.subtract(1, 'year').startOf('year'), '去年の初日'),
        },
      ],
    },
  ] as const satisfies Readonly<
    Record<string, string | Array<Record<string, string | ReturnType<typeof formatDateLabel>>>>[]
  >
}

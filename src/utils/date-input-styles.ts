import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { getDateType } from '~/features/habits/utils/calendar-utils'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

export function getDayPropsForJapaneseCalendar(date: string) {
  const dayjsDate = dayjs(date).tz('Asia/Tokyo')
  const dateType = getDateType(dayjsDate)

  const baseStyle: React.CSSProperties = {}

  switch (dateType) {
    case 'sunday':
    case 'holiday':
      baseStyle.color = 'var(--mantine-color-red-7)'
      break

    case 'saturday':
      baseStyle.color = 'var(--mantine-color-blue-7)'
      break
  }

  return {
    style: baseStyle,
  }
}

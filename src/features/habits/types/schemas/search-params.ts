import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { z } from 'zod/v4'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

const dateStringValidator = z
  .string()
  .optional()
  .transform((val) => {
    if (!val) {
      return undefined
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/

    if (!dateRegex.test(val)) {
      return dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD')
    }

    const parsed = dayjs.tz(val, 'Asia/Tokyo')

    if (!parsed.isValid()) {
      return dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD')
    }

    return val
  })

const calendarViewValidator = z
  .enum(['month', 'week', 'day'])
  .optional()
  .catch((_) => {
    return 'month'
  })

const metricValidator = z
  .enum(['duration', 'completion'])
  .optional()
  .catch((_) => {
    return 'duration'
  })

const showRecordFormValidator = z
  .boolean()
  .optional()
  .catch((_) => {
    return false
  })

const currentMonthValidator = z
  .string()
  .optional()
  .transform((val) => {
    if (!val) {
      return undefined
    }

    const monthRegex = /^\d{4}-\d{2}$/

    if (!monthRegex.test(val)) {
      return dayjs().tz('Asia/Tokyo').format('YYYY-MM')
    }

    const parsed = dayjs.tz(val, 'Asia/Tokyo')

    if (!parsed.isValid()) {
      return dayjs().tz('Asia/Tokyo').format('YYYY-MM')
    }

    return val
  })

const boolValidator = z.boolean().optional().catch(false)

const habitSortValidator = z
  .enum(['all', 'priority'])
  .optional()
  .catch((_) => {
    return 'all'
  })

const habitFilterValidator = z
  .enum(['all', 'high', 'middle', 'low', 'null'])
  .optional()
  .catch((_) => {
    return 'all'
  })

const stopwatchOpenValidator = boolValidator
const stopwatchHabitIdValidator = z.string().nullable().optional().catch(null)
const stopwatchRunningValidator = boolValidator
const stopwatchStartTimeValidator = z.number().nullable().optional().catch(null)
const stopwatchElapsedValidator = z.number().optional().catch(0)

const stopwatchModeValidator = z.enum(['stopwatch', 'pomodoro']).optional().catch('stopwatch')

const levelTabValidator = z
  .enum(['overview', 'levels', 'streak', 'badges'])
  .optional()
  .catch((_) => {
    return 'overview'
  })

const detailTabValidator = z
  .enum(['dashboard', 'analytics'])
  .optional()
  .catch((_) => {
    return 'dashboard'
  })

const qValidator = z.string().optional().catch('')

const habitSelectorQueryValidator = z.string().optional().catch('')

const habitSelectorFilterValidator = z
  .enum(['all', 'high', 'middle', 'low'])
  .optional()
  .catch((_) => {
    return 'all'
  })

const habitSelectorSortValidator = z
  .enum(['all', 'priority'])
  .optional()
  .catch((_) => {
    return 'all'
  })

const presetValidator = dateStringValidator

export const searchSchema = z.object({
  selectedDate: dateStringValidator,
  calendarView: calendarViewValidator,
  metric: metricValidator,
  showRecordForm: showRecordFormValidator,
  currentMonth: currentMonthValidator,
  skip: boolValidator,
  open: boolValidator,
  habitSort: habitSortValidator,
  habitFilter: habitFilterValidator,
  stopwatchOpen: stopwatchOpenValidator,
  stopwatchHabitId: stopwatchHabitIdValidator,
  stopwatchRunning: stopwatchRunningValidator,
  stopwatchStartTime: stopwatchStartTimeValidator,
  stopwatchElapsed: stopwatchElapsedValidator,
  stopwatchMode: stopwatchModeValidator,
  levelTab: levelTabValidator,
  detailTab: detailTabValidator,
  q: qValidator,
  habitSelectorQuery: habitSelectorQueryValidator,
  habitSelectorFilter: habitSelectorFilterValidator,
  habitSelectorSort: habitSelectorSortValidator,
  preset: presetValidator,
})

export type SearchParams = z.infer<typeof searchSchema>

export function getValidatedDate(dateString?: string) {
  if (!dateString) {
    return dayjs().tz('Asia/Tokyo').toDate()
  }

  const parsed = dayjs.tz(dateString, 'Asia/Tokyo')

  if (!parsed.isValid()) {
    return dayjs().tz('Asia/Tokyo').toDate()
  }

  return parsed.toDate()
}

export function formatDateForUrl(date: Date) {
  return dayjs(date).tz('Asia/Tokyo').format('YYYY-MM-DD')
}

export function getDefaultSearchParams() {
  return {
    selectedDate: dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD'),
    calendarView: 'month',
    metric: 'duration',
    showRecordForm: false,
    currentMonth: dayjs().tz('Asia/Tokyo').format('YYYY-MM'),
    skip: false,
    open: false,
    habitSort: 'all',
    habitFilter: 'all',
    stopwatchOpen: false,
    stopwatchHabitId: null,
    stopwatchRunning: false,
    stopwatchStartTime: null,
    stopwatchElapsed: 0,
    stopwatchMode: 'stopwatch',
    levelTab: 'overview',
    detailTab: 'dashboard',
    q: '',
    habitSelectorQuery: '',
    habitSelectorFilter: 'all',
    habitSelectorSort: 'all',
    preset: dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD'),
  }
}

import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { z } from 'zod/v4'
import 'dayjs/locale/ja'

dayjs.extend(isSameOrBefore)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('ja')

dayjs.tz.setDefault('Asia/Tokyo')

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

const isValidDate = (dateString: string) => {
  if (!DATE_REGEX.test(dateString)) {
    return false
  }

  const date = dayjs(dateString)

  return date.isValid() && date.format('YYYY-MM-DD') === dateString
}

export const recordStatusSchema = z.enum(['active', 'completed', 'skipped'])
export type RecordStatus = z.infer<typeof recordStatusSchema>

export const createRecordSchema = z
  .object({
    habitId: z.string({ message: '習慣IDは必須です' }).min(1, '習慣IDを指定してください'),
    date: z
      .string({ message: '日付は必須です' })
      .regex(DATE_REGEX, '日付はYYYY-MM-DD形式で入力してください')
      .refine(isValidDate, '有効な日付を入力してください'),
    status: recordStatusSchema.default('active'),
    durationMinutes: z
      .number({ message: '実行時間は数値で入力してください' })
      .int('実行時間は整数で入力してください')
      .min(0, '実行時間は0分以上で入力してください')
      .max(1440, '実行時間は1440分（24時間）以下で入力してください')
      .default(0),
    notes: z
      .string()
      .optional()
      .transform((val) => val?.trim() || undefined),
  })
  .refine(
    (data) => {
      if (data.status === 'completed' && data.durationMinutes === 0) {
        return false
      }

      return true
    },
    {
      message: '習慣を完了した場合は、実行時間を入力してください',
      path: ['durationMinutes'],
    },
  )
  .refine(
    (data) => {
      const inputDate = data.date
      const todayJST = dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD')

      if (inputDate > todayJST && data.status === 'completed') {
        return false
      }

      return true
    },
    {
      message: '未来の日付には「完了」ステータスは記録できません',
      path: ['status'],
    },
  )

export const updateRecordSchema = z
  .object({
    id: z.string({ message: '記録IDは必須です' }).min(1, '記録IDを指定してください'),
    date: z
      .string({ message: '日付は必須です' })
      .regex(DATE_REGEX, '日付はYYYY-MM-DD形式で入力してください')
      .refine(isValidDate, '有効な日付を入力してください')
      .optional(),
    status: recordStatusSchema.optional(),
    durationMinutes: z
      .number({ message: '実行時間は数値で入力してください' })
      .int('実行時間は整数で入力してください')
      .min(0, '実行時間は0分以上で入力してください')
      .max(1440, '実行時間は1440分（24時間）以下で入力してください')
      .optional(),
    notes: z
      .string()
      .optional()
      .transform((val) => val?.trim() || undefined),
  })
  .refine(
    (data) => {
      if (data.status === 'completed' && data.durationMinutes === 0) {
        return false
      }

      return true
    },
    {
      message: '習慣を完了した場合は、実行時間を入力してください',
      path: ['durationMinutes'],
    },
  )
  .refine(
    (data) => {
      if (!data.date) {
        return true
      }

      const inputDate = data.date
      const todayJST = dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD')

      if (inputDate > todayJST && data.status === 'completed') {
        return false
      }

      return true
    },
    {
      message: '未来の日付には「完了」ステータスは記録できません',
      path: ['status'],
    },
  )

export const recordSchema = z.object({
  id: z.string(),
  habit_id: z.string(),
  date: z.string(),
  status: recordStatusSchema,
  durationMinutes: z.number(),
  notes: z.string().optional(),
  createdAt: z.string(),
})

export type CreateRecordInput = z.infer<typeof createRecordSchema>
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>
export type RecordSchema = z.infer<typeof recordSchema>

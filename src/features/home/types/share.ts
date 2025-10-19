import type { InferSelectModel } from 'drizzle-orm'
import { z } from 'zod/v4'
import type { habits, records } from '~/db/schema'

export type ShareHabitData = {
  habitId: InferSelectModel<typeof habits>['id']
  habitName: InferSelectModel<typeof habits>['name']
  habitColor: InferSelectModel<typeof habits>['color']
  notes: InferSelectModel<typeof records>['notes'][]
  duration: InferSelectModel<typeof records>['duration_minutes']
}

export type ShareDataResponse = {
  success: boolean
  data?: ShareHabitData[]
  error?: string
}

export const getShareDataSchema = z.object({
  date: z.string(),
})

export type GetShareDataInput = z.infer<typeof getShareDataSchema>

import z from 'zod/v4'

export const searchSchema = z.object({
  selectedDate: z.string().optional(),
  calendarView: z.enum(['month', 'week', 'day']).optional(),
  metric: z.enum(['duration', 'completion']).optional(),
})

export type SearchParams = z.infer<typeof searchSchema>

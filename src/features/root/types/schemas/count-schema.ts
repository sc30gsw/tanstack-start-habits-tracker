import z from 'zod/v4'

export const countSchema = z.object({
  count: z.number().min(0),
})

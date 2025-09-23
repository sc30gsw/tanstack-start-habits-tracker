import { z } from 'zod/v4'

// Settings schema
export const settingsSchema = z.object({
  theme: z.enum(['light', 'dark']).default('light'),
  default_view: z.enum(['calendar', 'list']).default('calendar'),
})

// Settings update schema
export const updateSettingsSchema = z.object({
  id: z.string({ message: 'Settings ID is required' }).min(1, 'Settings ID is required'),
  theme: z.enum(['light', 'dark']).optional(),
  default_view: z.enum(['calendar', 'list']).optional(),
})

// Settings read schema
export const settingsReadSchema = z.object({
  id: z.string(),
  theme: z.string(),
  default_view: z.string(),
  created_at: z.string(),
})

// TypeScript types derived from schemas
export type SettingsInput = z.infer<typeof settingsSchema>
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>
export type Settings = z.infer<typeof settingsReadSchema>

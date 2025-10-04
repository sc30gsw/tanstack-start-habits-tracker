import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod/v4'
import { db } from '~/db'
import { settings } from '~/db/schema'

// Theme schemas
const themeSchema = z.enum(['light', 'dark', 'auto'])

const updateThemeSchema = z.object({
  theme: themeSchema,
})

/**
 * テーマ設定を取得する
 */
const getThemeSettings = createServerFn({ method: 'GET' }).handler(
  async (): Promise<{ success: boolean; theme?: string; error?: string }> => {
    try {
      // TODO: セッションからuserIdを取得
      const userId = 'temp-user-id'

      const userSettings = await db.query.settings.findFirst({
        where: eq(settings.userId, userId),
      })

      if (!userSettings) {
        return {
          success: true,
          theme: 'auto',
        }
      }

      return {
        success: true,
        theme: userSettings.theme || 'auto',
      }
    } catch (error) {
      console.error('Error fetching theme settings:', error)
      return {
        success: false,
        error: 'Failed to fetch theme settings',
      }
    }
  },
)

/**
 * テーマ設定を更新する
 */
const updateThemeSettings = createServerFn({ method: 'POST' })
  .inputValidator(updateThemeSchema)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      // TODO: セッションからuserIdを取得
      const userId = 'temp-user-id'

      const existingSettings = await db.query.settings.findFirst({
        where: eq(settings.userId, userId),
      })

      if (!existingSettings) {
        // 新規作成
        await db.insert(settings).values({
          id: nanoid(),
          theme: data.theme,
          userId: userId,
        })
      } else {
        // 更新
        await db.update(settings).set({ theme: data.theme }).where(eq(settings.userId, userId))
      }

      return {
        success: true,
      }
    } catch (error) {
      console.error('Error updating theme settings:', error)
      return {
        success: false,
        error: 'Failed to update theme settings',
      }
    }
  })

export const themeDto = {
  getThemeSettings,
  updateThemeSettings,
} as const

export type ThemeMode = z.infer<typeof themeSchema>

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
      const userSettings = await db.select().from(settings).limit(1)

      if (userSettings.length === 0) {
        // 設定が存在しない場合はデフォルト設定を作成
        const settingsId = nanoid()
        await db.insert(settings).values({
          id: settingsId,
          theme: 'auto',
          default_view: 'calendar',
          created_at: new Date().toISOString(),
        })

        return {
          success: true,
          theme: 'auto',
        }
      }

      return {
        success: true,
        theme: userSettings[0].theme ?? undefined,
      }
    } catch (error) {
      console.error('Error getting theme settings:', error)

      return {
        success: false,
        error: 'Failed to get theme settings',
      }
    }
  },
)

/**
 * テーマ設定を更新する
 */
const updateThemeSettings = createServerFn({ method: 'POST' })
  .validator(updateThemeSchema)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      const userSettings = await db.select().from(settings).limit(1)

      if (userSettings.length === 0) {
        // 設定が存在しない場合は新規作成
        const settingsId = nanoid()
        await db.insert(settings).values({
          id: settingsId,
          theme: data.theme,
          default_view: 'calendar',
          created_at: new Date().toISOString(),
        })
      } else {
        // 既存の設定を更新
        await db
          .update(settings)
          .set({
            theme: data.theme,
          })
          .where(eq(settings.id, userSettings[0].id))
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

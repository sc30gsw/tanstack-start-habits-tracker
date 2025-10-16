import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { useEffect, useRef } from 'react'
import { GET_USER_SETTINGS_CACHE_KEY } from '~/constants/cache-key'
import { settingsDto } from '~/features/settings/server/settings-functions'
import { notificationDto } from '../server/notification-functions'

// Configure dayjs for JST timezone
dayjs.extend(utc)
dayjs.extend(timezone)

/**
 * Default notification times in JST (9:00, 13:00, 17:00, 21:00)
 */
const DEFAULT_NOTIFICATION_TIMES = ['09:00', '13:00', '17:00', '21:00'] as const

/**
 * Hook to generate notifications based on user settings
 * Sends reminder notifications at:
 * - 9:00, 13:00, 17:00, 21:00 JST (default times) - habit status notifications
 * - User's custom daily reminder time JST - general reminder only
 *
 * Note: This is a client-side hook that only works when the app is open.
 * For production, consider using a server-side cron job or scheduled task.
 */
export function useNotificationGenerator() {
  const lastDefaultCheckRef = useRef<string | null>(null)
  const lastCustomCheckRef = useRef<string | null>(null)

  // Fetch user settings (use useQuery instead of useSuspenseQuery to handle unauthenticated users)
  const { data: settings } = useQuery({
    queryKey: [GET_USER_SETTINGS_CACHE_KEY],
    queryFn: () => settingsDto.getUserSettings(),
    refetchInterval: 60000, // Refetch every minute
    retry: false, // Don't retry if user is not authenticated
  })

  // Check if notifications are enabled
  const notificationsEnabled = settings?.notificationsEnabled ?? false

  useEffect(() => {
    if (!notificationsEnabled || !settings) {
      return
    }

    // Check notification schedule every minute
    const intervalId = setInterval(() => {
      checkAndGenerateNotifications()
    }, 60000) // Every 60 seconds

    // Initial check
    checkAndGenerateNotifications()

    return () => {
      clearInterval(intervalId)
    }
  }, [notificationsEnabled, settings])

  /**
   * Check current time and generate notifications if it's a scheduled time
   */
  const checkAndGenerateNotifications = async () => {
    if (!settings) {
      return
    }

    // Get current time in JST
    const now = dayjs().tz('Asia/Tokyo')
    const currentTime = now.format('HH:mm')
    const currentDate = now.format('YYYY-MM-DD')

    // Check default notification times (9:00, 13:00, 17:00, 21:00 JST)
    const isDefaultTime = DEFAULT_NOTIFICATION_TIMES.includes(
      currentTime as (typeof DEFAULT_NOTIFICATION_TIMES)[number],
    )

    if (isDefaultTime) {
      const checkKey = `${currentDate}_${currentTime}_default`
      if (lastDefaultCheckRef.current !== checkKey) {
        lastDefaultCheckRef.current = checkKey
        await generateDefaultTimeNotifications(currentTime, settings)
      }
    }

    // Check custom reminder time
    const isCustomTime = settings.dailyReminderTime === currentTime
    if (isCustomTime) {
      const checkKey = `${currentDate}_${currentTime}_custom`
      if (lastCustomCheckRef.current !== checkKey) {
        lastCustomCheckRef.current = checkKey
        await generateCustomReminderNotification()
      }
    }
  }

  /**
   * Generate notifications for default times (9:00, 13:00, 17:00, 21:00)
   * These include habit status notifications
   */
  const generateDefaultTimeNotifications = async (
    time: string,
    userSettings: Awaited<ReturnType<typeof settingsDto.getUserSettings>>,
  ) => {
    const timeMessages: Record<string, string> = {
      '09:00': '今日の習慣を始めましょう！朝の習慣を実行する時間です。',
      '13:00': 'お昼の習慣チェック！午前中の習慣を記録しましたか？',
      '17:00': '夕方の習慣確認！今日の目標達成まであと少しです。',
      '21:00': '今日の習慣を振り返りましょう。まだ実行していない習慣はありませんか？',
    }

    try {
      // Always send the main reminder
      await notificationDto.createNotification({
        data: {
          title: '今日の習慣を確認しましょう',
          message: timeMessages[time] || '習慣の実行状況を記録して、継続的な成長を目指しましょう！',
          type: 'reminder',
        },
      })

      // Generate habit-specific notifications if enabled
      if (userSettings.incompleteReminderEnabled) {
        await generateIncompleteHabitNotifications()
      }

      if (userSettings.skippedReminderEnabled) {
        await generateSkippedHabitNotifications()
      }

      if (userSettings.scheduledReminderEnabled) {
        await generateScheduledHabitNotifications()
      }
    } catch (error) {
      console.error('Failed to generate default time notifications:', error)
    }
  }

  /**
   * Generate custom reminder notification (user-set time)
   * Only sends a general reminder, no habit status notifications
   */
  const generateCustomReminderNotification = async () => {
    try {
      await notificationDto.createNotification({
        data: {
          title: 'リマインダー',
          message: '設定した時刻になりました。今日の習慣を確認しましょう！',
          type: 'reminder',
        },
      })
    } catch (error) {
      console.error('Failed to generate custom reminder:', error)
    }
  }

  /**
   * Generate notifications for incomplete habits
   * Incomplete = records with 'active' status or no record for today
   */
  const generateIncompleteHabitNotifications = async () => {
    try {
      const habitStatuses = await notificationDto.getTodayHabitStatuses()
      const incompleteHabits = habitStatuses.incomplete

      if (incompleteHabits.length === 0) {
        return
      }

      // Generate a notification for each incomplete habit
      for (const habit of incompleteHabits) {
        await notificationDto.createNotification({
          data: {
            title: `未完了: ${habit.name}`,
            message: '開始した習慣がまだ完了していません。記録を完了させましょう！',
            type: 'habit_incomplete',
            habitId: habit.id,
          },
        })
      }
    } catch (error) {
      console.error('Failed to generate incomplete habit notifications:', error)
    }
  }

  /**
   * Generate notifications for skipped habits
   * Skipped = records with 'skipped' status
   */
  const generateSkippedHabitNotifications = async () => {
    try {
      const habitStatuses = await notificationDto.getTodayHabitStatuses()
      const skippedHabits = habitStatuses.skipped

      if (skippedHabits.length === 0) {
        return
      }

      // Generate a notification for each skipped habit
      for (const habit of skippedHabits) {
        await notificationDto.createNotification({
          data: {
            title: `スキップ: ${habit.name}`,
            message: 'この習慣をスキップしました。明日は実行できるよう頑張りましょう！',
            type: 'habit_skipped',
            habitId: habit.id,
          },
        })
      }
    } catch (error) {
      console.error('Failed to generate skipped habit notifications:', error)
    }
  }

  /**
   * Generate notifications for scheduled habits
   * Scheduled = habits that have no record for today
   */
  const generateScheduledHabitNotifications = async () => {
    try {
      const habitStatuses = await notificationDto.getTodayHabitStatuses()
      const scheduledHabits = habitStatuses.scheduled

      if (scheduledHabits.length === 0) {
        return
      }

      // Generate a notification for each scheduled habit
      for (const habit of scheduledHabits) {
        await notificationDto.createNotification({
          data: {
            title: `予定: ${habit.name}`,
            message: 'この習慣はまだ実行されていません。今日の目標を達成しましょう！',
            type: 'habit_scheduled',
            habitId: habit.id,
          },
        })
      }
    } catch (error) {
      console.error('Failed to generate scheduled habit notifications:', error)
    }
  }

  return {
    notificationsEnabled,
    checkAndGenerateNotifications,
  } as const
}

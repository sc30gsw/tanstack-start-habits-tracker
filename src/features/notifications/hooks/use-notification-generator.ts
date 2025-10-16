import { useSuspenseQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useEffect, useRef } from 'react'
import { GET_USER_SETTINGS_CACHE_KEY } from '~/constants/cache-key'
import { settingsDto } from '~/features/settings/server/settings-functions'
import { notificationDto } from '../server/notification-functions'

/**
 * Notification schedule times (HH:mm format)
 * 9:00, 13:00, 17:00, 21:00 (4-hour intervals)
 */
const NOTIFICATION_TIMES = ['09:00', '13:00', '17:00', '21:00'] as const satisfies readonly string[]

/**
 * Hook to generate notifications based on user settings and habits status
 * This hook checks for incomplete, skipped, and scheduled habits
 * and creates notifications at scheduled times (9:00, 13:00, 17:00, 21:00)
 */
export function useNotificationGenerator() {
  const lastCheckRef = useRef<string | null>(null)

  // Fetch user settings
  const { data: settings } = useSuspenseQuery({
    queryKey: [GET_USER_SETTINGS_CACHE_KEY],
    queryFn: () => settingsDto.getUserSettings(),
    refetchInterval: 60000, // Refetch every minute
  })

  // Check if notifications are enabled
  const notificationsEnabled = settings?.notificationsEnabled ?? false

  useEffect(() => {
    if (!notificationsEnabled) {
      return
    }

    // Check notification schedule every minute
    const intervalId = setInterval(() => {
      checkAndGenerateNotifications()
    }, 60000) // Every 60 seconds

    // Initial check
    checkAndGenerateNotifications()

    return () => clearInterval(intervalId)
  }, [notificationsEnabled, settings])

  /**
   * Check current time and generate notifications if it's a scheduled time
   */
  const checkAndGenerateNotifications = async () => {
    if (!settings) {
      return
    }

    const now = dayjs()
    const currentTime = now.format('HH:mm')
    const currentDate = now.format('YYYY-MM-DD')

    // Check if current time matches any notification schedule
    const isScheduledTime = NOTIFICATION_TIMES.includes(
      currentTime as (typeof NOTIFICATION_TIMES)[number],
    )

    if (!isScheduledTime) {
      return
    }

    // Prevent duplicate notifications in the same minute
    const checkKey = `${currentDate}_${currentTime}`
    if (lastCheckRef.current === checkKey) {
      return
    }
    lastCheckRef.current = checkKey

    try {
      // Generate daily reminder notification
      if (currentTime === settings.dailyReminderTime) {
        await generateDailyReminder()
      }

      // Generate habit-specific notifications
      if (settings.incompleteReminderEnabled) {
        await generateIncompleteHabitNotifications()
      }

      if (settings.skippedReminderEnabled) {
        await generateSkippedHabitNotifications()
      }

      if (settings.scheduledReminderEnabled) {
        await generateScheduledHabitNotifications()
      }
    } catch (error) {
      console.error('Failed to generate notifications:', error)
    }
  }

  /**
   * Generate daily reminder notification
   */
  const generateDailyReminder = async () => {
    await notificationDto.createNotification({
      data: {
        title: '今日の習慣を確認しましょう',
        message: '習慣の実行状況を記録して、継続的な成長を目指しましょう！',
        type: 'reminder',
      },
    })
  }

  /**
   * Generate notifications for incomplete habits
   * Incomplete = records with 'active' status or no record for today
   */
  const generateIncompleteHabitNotifications = async () => {
    // TODO: Fetch today's incomplete habits
    // This would require a new server function to fetch habits with incomplete records
    // For now, we'll generate a generic notification
    await notificationDto.createNotification({
      data: {
        title: '未完了の習慣があります',
        message: '今日実行予定の習慣を確認してください',
        type: 'habit_incomplete',
      },
    })
  }

  /**
   * Generate notifications for skipped habits
   * Skipped = records with 'skipped' status
   */
  const generateSkippedHabitNotifications = async () => {
    // TODO: Fetch today's skipped habits
    // This would require a new server function to fetch habits with skipped status
    await notificationDto.createNotification({
      data: {
        title: 'スキップした習慣があります',
        message: 'まだ時間があります。今日の習慣を実行しましょう！',
        type: 'habit_skipped',
      },
    })
  }

  /**
   * Generate notifications for scheduled habits
   * Scheduled = habits that have no record for today
   */
  const generateScheduledHabitNotifications = async () => {
    // TODO: Fetch habits with no records for today
    // This would require a new server function
    await notificationDto.createNotification({
      data: {
        title: '実行予定の習慣があります',
        message: '今日実行する習慣を記録しましょう',
        type: 'habit_scheduled',
      },
    })
  }

  return {
    notificationsEnabled,
    checkAndGenerateNotifications,
  } as const
}

import type { Session } from 'better-auth'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { and, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from '~/db'
import { habits, notifications, records, settings } from '~/db/schema'

dayjs.extend(utc)
dayjs.extend(timezone)

/**
 * Default notification times in JST (9:00, 13:00, 17:00, 21:00)
 */
const DEFAULT_NOTIFICATION_TIMES = [
  '09:00',
  '13:00',
  '17:00',
  '21:00',
] as const satisfies readonly string[]

/**
 * Time-specific messages for default notification times
 */
const TIME_MESSAGES = {
  '09:00': '今日の習慣を始めましょう！朝の習慣を実行する時間です。',
  '13:00': 'お昼の習慣チェック！午前中の習慣を記録しましたか？',
  '17:00': '夕方の習慣確認！今日の目標達成まであと少しです。',
  '21:00': '今日の習慣を振り返りましょう。まだ実行していない習慣はありませんか？',
} as const satisfies Record<(typeof DEFAULT_NOTIFICATION_TIMES)[number], string>

/**
 * Main cron job function - runs every minute
 * Checks all users' notification settings and generates notifications
 */
export async function runNotificationCron(options?: Partial<Record<'testMode', boolean>>) {
  const currentTime = dayjs().tz('Asia/Tokyo')
  const currentTimeStr = currentTime.format('HH:mm')
  const currentDate = currentTime.format('YYYY-MM-DD')

  const testMode = options?.testMode ?? false

  console.log(`🔔 [Notification Cron] Running at ${currentTimeStr} JST (${currentDate})`)
  if (testMode) {
    console.log(`   🧪 TEST MODE: Will generate all notification types regardless of time`)
  }

  try {
    // Get all users with notifications enabled
    const enabledSettings = await db
      .select()
      .from(settings)
      .where(eq(settings.notificationsEnabled, true))

    console.log(`   Found ${enabledSettings.length} users with notifications enabled`)

    let notificationsCreated = 0

    for (const userSetting of enabledSettings) {
      // Check if current time matches default notification times
      const isDefaultTime = DEFAULT_NOTIFICATION_TIMES.includes(
        currentTimeStr as (typeof DEFAULT_NOTIFICATION_TIMES)[number],
      )

      if (isDefaultTime || testMode) {
        const time = isDefaultTime
          ? (currentTimeStr as (typeof DEFAULT_NOTIFICATION_TIMES)[number])
          : '09:00' // Use 09:00 as default in test mode

        await generateDefaultTimeNotifications(userSetting.userId, time, userSetting)

        notificationsCreated++
      }

      // Check if current time matches custom reminder time
      const isCustomTime =
        userSetting.customReminderEnabled && userSetting.dailyReminderTime === currentTimeStr

      if (isCustomTime || (testMode && userSetting.customReminderEnabled)) {
        await generateCustomReminderNotification(userSetting.userId)
        notificationsCreated++
      }
    }

    console.log(`   ✅ Created ${notificationsCreated} notification batches`)
  } catch (error) {
    console.error('❌ [Notification Cron] Error:', error)
  }
}

/**
 * Generate notifications for default times (9:00, 13:00, 17:00, 21:00)
 */
async function generateDefaultTimeNotifications(
  userId: Session['userId'],
  time: (typeof DEFAULT_NOTIFICATION_TIMES)[number],
  userSettings: typeof settings.$inferSelect,
) {
  try {
    // 1. Create main reminder notification
    await db.insert(notifications).values({
      id: nanoid(),
      userId,
      title: '今日の習慣を確認しましょう',
      message: TIME_MESSAGES[time],
      type: 'reminder',
      isRead: false,
    })

    // 2. Generate habit-specific notifications based on user settings
    if (userSettings.incompleteReminderEnabled) {
      await generateIncompleteHabitNotifications(userId)
    }

    if (userSettings.skippedReminderEnabled) {
      await generateSkippedHabitNotifications(userId)
    }

    if (userSettings.scheduledReminderEnabled) {
      await generateScheduledHabitNotifications(userId)
    }
  } catch (error) {
    console.error(`   ❌ Error generating default time notifications for user ${userId}:`, error)
  }
}

/**
 * Generate custom reminder notification
 */
async function generateCustomReminderNotification(userId: Session['userId']) {
  try {
    await db.insert(notifications).values({
      id: nanoid(),
      userId,
      title: 'リマインダー',
      message: '設定した時刻になりました。今日の習慣を確認しましょう！',
      type: 'reminder',
      isRead: false,
    })
  } catch (error) {
    console.error(`   ❌ Error generating custom reminder for user ${userId}:`, error)
  }
}

/**
 * Generate notifications for incomplete habits
 */
async function generateIncompleteHabitNotifications(userId: Session['userId']) {
  try {
    const today = dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD')

    const userHabits = await db.query.habits.findMany({
      where: and(eq(habits.userId, userId), eq(habits.notificationsEnabled, true)),
    })

    const todayRecords = await db
      .select()
      .from(records)
      .where(and(eq(records.date, today), eq(habits.userId, userId)))
      .innerJoin(habits, eq(records.habitId, habits.id))

    const recordMap = new Map(todayRecords.map((r) => [r.records.habitId, r.records]))

    for (const habit of userHabits) {
      const record = recordMap.get(habit.id)

      if (!record || record.status === 'active') {
        await db.insert(notifications).values({
          id: nanoid(),
          userId,
          habitId: habit.id,
          title: `予定中: ${habit.name}`,
          message: '今日の習慣を実行しましょう！継続が力になります。',
          type: 'habit_incomplete',
          isRead: false,
        })
      }
    }
  } catch (error) {
    console.error(
      `   ❌ Error generating incomplete habit notifications for user ${userId}:`,
      error,
    )
  }
}

/**
 * Generate notifications for skipped habits
 */
async function generateSkippedHabitNotifications(userId: Session['userId']) {
  try {
    const today = dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD')

    // Get user's habits (only those with notifications enabled)
    const userHabits = await db
      .select()
      .from(habits)
      .where(and(eq(habits.userId, userId), eq(habits.notificationsEnabled, true)))

    // Get today's records with direct DB query
    const todayRecords = await db
      .select()
      .from(records)
      .where(and(eq(records.date, today), eq(records.userId, userId)))

    const recordMap = new Map(todayRecords.map((r) => [r.habitId, r]))

    // Find skipped habits
    for (const habit of userHabits) {
      const record = recordMap.get(habit.id)

      if (record?.status === 'skipped') {
        await db.insert(notifications).values({
          id: nanoid(),
          userId,
          habitId: habit.id,
          title: `スキップ: ${habit.name}`,
          message: 'この習慣をスキップしました。明日は実行できるよう頑張りましょう！',
          type: 'habit_skipped',
          isRead: false,
        })
      }
    }
  } catch (error) {
    console.error(`   ❌ Error generating skipped habit notifications for user ${userId}:`, error)
  }
}

/**
 * Generate notifications for scheduled habits (no record today)
 */
async function generateScheduledHabitNotifications(userId: Session['userId']) {
  try {
    const today = dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD')

    // Get user's habits (only those with notifications enabled)
    const userHabits = await db
      .select()
      .from(habits)
      .where(and(eq(habits.userId, userId), eq(habits.notificationsEnabled, true)))

    // Get today's records with direct DB query
    const todayRecords = await db
      .select()
      .from(records)
      .where(and(eq(records.date, today), eq(records.userId, userId)))

    const recordMap = new Map(todayRecords.map((r) => [r.habitId, r]))

    // Find habits with no record today
    for (const habit of userHabits) {
      const record = recordMap.get(habit.id)

      if (!record) {
        await db.insert(notifications).values({
          id: nanoid(),
          userId,
          habitId: habit.id,
          title: `${habit.name}をやりませんか？`,
          message: 'まだ予定を立てていません。今日も習慣を続けて、目標達成を目指しましょう！',
          type: 'habit_scheduled',
          isRead: false,
        })
      }
    }
  } catch (error) {
    console.error(`   ❌ Error generating scheduled habit notifications for user ${userId}:`, error)
  }
}

import { runNotificationCron } from './notification-cron'

/**
 * Cloudflare Workers Cron Handler
 * This is called by Cloudflare Workers' scheduled trigger
 */
export async function handleScheduledEvent(event: Record<'scheduledTime', number>) {
  const timestamp = new Date(event.scheduledTime).toISOString()
  console.log(`🕐 [CRON START] Scheduled event triggered at ${timestamp}`)
  console.log(`🕐 [CRON START] Event details:`, JSON.stringify(event, null, 2))

  try {
    console.log(`🕐 [CRON] About to run notification cron...`)
    await runNotificationCron()
    console.log(`✅ [CRON SUCCESS] Notification cron completed successfully`)
  } catch (error) {
    console.error('❌ [CRON ERROR] Scheduled event failed')
    console.error('❌ [CRON ERROR] Error type:', error?.constructor?.name)
    console.error(
      '❌ [CRON ERROR] Error message:',
      error instanceof Error ? error.message : String(error),
    )
    console.error(
      '❌ [CRON ERROR] Error stack:',
      error instanceof Error ? error.stack : 'No stack trace',
    )
    console.error(
      '❌ [CRON ERROR] Full error object:',
      JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
    )
    throw error
  }
}

/**
 * For local testing
 * Run: bun run src/cron/index.ts
 */
if (import.meta.main) {
  console.log('🧪 Running notification cron in TEST MODE...\n')
  console.log('   This will generate all notification types regardless of time\n')
  await runNotificationCron({ testMode: true })
  console.log('\n✅ Local cron test completed')
}

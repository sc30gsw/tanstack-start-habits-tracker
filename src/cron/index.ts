import { runNotificationCron } from './notification-cron'

/**
 * Cloudflare Workers Cron Handler
 * This is called by Cloudflare Workers' scheduled trigger
 */
export async function handleScheduledEvent(event: Record<'scheduledTime', number>) {
  console.log(`🕐 Scheduled event triggered at ${new Date(event.scheduledTime).toISOString()}`)

  try {
    await runNotificationCron()
  } catch (error) {
    console.error('❌ Scheduled event failed:', error)
    throw error
  }
}

/**
 * For local testing
 * Run: bun run src/cron/index.ts
 */
if (import.meta.main) {
  console.log('🧪 Running notification cron locally...\n')
  await runNotificationCron()
  console.log('\n✅ Local cron test completed')
}

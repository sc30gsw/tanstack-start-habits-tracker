/**
 * Cloudflare Workers Entry Point
 * This file is the main entry for Cloudflare Workers and includes:
 * - Default fetch handler from TanStack Start
 * - Custom scheduled handler for cron jobs
 */

// Import the TanStack Start server handler
// @ts-ignore - Generated file at build time
import tanstackHandler from './dist/server/index.js'

// Import our cron handler
import { handleScheduledEvent } from './src/cron/index.ts'

// Export a single default object with both fetch and scheduled handlers
export default {
  // Re-export the fetch handler from TanStack Start
  fetch: tanstackHandler.fetch || tanstackHandler,
  
  // Add the scheduled handler for Cloudflare Cron Triggers
  async scheduled(
    event: ScheduledEvent,
    _env: Env,
    _ctx: ExecutionContext,
  ): Promise<void> {
    console.log('🕐 [WORKER] Cron scheduled() function called')
    console.log('🕐 [WORKER] Event:', JSON.stringify({
      scheduledTime: event.scheduledTime,
      cron: event.cron,
    }))
    
    try {
      await handleScheduledEvent({ scheduledTime: event.scheduledTime })
      console.log('✅ [WORKER] Cron execution completed successfully')
    } catch (error) {
      console.error('❌ [WORKER] Cron execution failed:', error)
      console.error('❌ [WORKER] Error details:', {
        name: error?.constructor?.name,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
      throw error
    }
  },
}

// Type definitions for Cloudflare Workers
interface Env {
  [key: string]: unknown
}

interface ScheduledEvent {
  scheduledTime: number
  cron: string
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void
  passThroughOnException(): void
}

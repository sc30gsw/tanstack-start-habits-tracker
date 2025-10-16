import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { and, eq } from 'drizzle-orm'
import { db } from '~/db'
import { habitLevels } from '~/db/schema'
import { calculateHomeAggregatedLevel } from '~/features/home/utils/home-level-utils'
import { auth } from '~/lib/auth'

const getHomeAggregatedLevel = createServerFn({
  method: 'GET',
}).handler(async () => {
  const session = await auth.api.getSession(getRequest())

  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const userHabitLevels = await db
    .select()
    .from(habitLevels)
    .where(and(eq(habitLevels.userId, session.user.id)))
    .execute()

  const aggregated = calculateHomeAggregatedLevel(userHabitLevels)

  return aggregated
})

export const homeLevelInfoDto = {
  getHomeAggregatedLevel,
} as const satisfies {
  getHomeAggregatedLevel: typeof getHomeAggregatedLevel
}

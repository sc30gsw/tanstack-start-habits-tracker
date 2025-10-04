import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { db } from '~/db'
import { auth } from '~/lib/auth'

export const getCurrentUser = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const session = await auth.api.getSession(getRequest())

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, session.user.id),
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    return {
      success: true,
      user,
    }
  } catch (error) {
    console.error('Error fetching user:', error)

    return {
      success: false,
      error: 'Failed to fetch user',
    }
  }
})

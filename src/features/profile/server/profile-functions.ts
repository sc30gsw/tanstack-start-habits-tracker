import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod/v4'
import { db } from '~/db'
import { users } from '~/db/schema'
import { auth } from '~/lib/auth'

const getUserProfile = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await auth.api.getSession(getRequest())

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })

  if (!user) {
    throw new Error('User not found')
  }

  return user
})

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.email('Invalid email address'),
})

type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export const updateUserProfile = createServerFn({ method: 'POST' })
  .inputValidator((data: UpdateProfileInput) => updateProfileSchema.parse(data))
  .handler(async ({ data }) => {
    const session = await auth.api.getSession(getRequest())

    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    if (data.email !== session.user.email) {
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, data.email),
      })

      if (existingUser && existingUser.id !== session.user.id) {
        throw new Error('Email already exists')
      }
    }

    await db
      .update(users)
      .set({
        name: data.name,
        email: data.email,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id))

    return { success: true, message: 'Profile updated successfully' }
  })

const deleteUserAccount = createServerFn({ method: 'POST' }).handler(async () => {
  const session = await auth.api.getSession(getRequest())

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const userId = session.user.id

  await db.delete(users).where(eq(users.id, userId))

  const request = getRequest()
  await auth.api.signOut({ request, headers: request.headers })

  return { success: true, message: 'Account deleted successfully' }
})

export const profileDto = {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
} as const satisfies {
  getUserProfile: typeof getUserProfile
  updateUserProfile: typeof updateUserProfile
  deleteUserAccount: typeof deleteUserAccount
}

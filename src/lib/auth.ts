import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { reactStartCookies } from 'better-auth/react-start'
import { db } from '~/db'
import * as schema from '~/db/schema'

export const auth = betterAuth({
  //...your config
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: schema,
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: import.meta.env.VITE_GITHUB_CLIENT_ID,
      clientSecret: import.meta.env.VITE_GITHUB_CLIENT_SECRET,
    },
  },
  plugins: [reactStartCookies()], // make sure this is the last plugin in the array
})

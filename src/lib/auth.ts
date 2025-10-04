import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { passkey } from 'better-auth/plugins/passkey'
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
    requireEmailVerification: false,
  },
  socialProviders: {
    github: {
      clientId: import.meta.env.VITE_GITHUB_CLIENT_ID,
      clientSecret: import.meta.env.VITE_GITHUB_CLIENT_SECRET,
    },
  },
  plugins: [
    reactStartCookies(),
    passkey({
      rpID: import.meta.env.DEV ? 'localhost' : import.meta.env.VITE_PASSKEY_RP_ID,
      rpName: import.meta.env.VITE_PASSKEY_RP_NAME,
    }),
  ], // make sure passkey is the last plugin in the array
})

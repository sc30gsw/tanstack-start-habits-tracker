import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config({ path: '.env' })

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './migrations',
  dialect: 'turso',
  dbCredentials: {
    url: import.meta.env.VITE_TURSO_CONNECTION_URL,
    authToken: import.meta.env.VITE_TURSO_AUTH_TOKEN,
  },
})
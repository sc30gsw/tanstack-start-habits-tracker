import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

export const db = drizzle({
  connection: {
    url: import.meta.env.VITE_TURSO_CONNECTION_URL,
    authToken: import.meta.env.VITE_TURSO_AUTH_TOKEN,
  },
  schema,
})

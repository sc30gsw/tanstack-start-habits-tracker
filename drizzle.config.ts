import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.VITE_TURSO_CONNECTION_URL!,
    authToken: process.env.VITE_TURSO_AUTH_TOKEN!,
  },
} satisfies Config;
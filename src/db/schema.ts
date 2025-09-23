import { sql } from 'drizzle-orm'
import { int, integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  age: int().notNull(),
  email: text().notNull().unique(),
})

// Habits table for habit definitions
export const habits = sqliteTable('habits', {
  id: text().primaryKey(),
  name: text().notNull().unique(),
  description: text(),
  created_at: text().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().default(sql`CURRENT_TIMESTAMP`),
})

// Records table for daily habit execution tracking
export const records = sqliteTable(
  'records',
  {
    id: text().primaryKey(),
    habit_id: text()
      .notNull()
      .references(() => habits.id, { onDelete: 'cascade' }),
    date: text().notNull(), // ISO date string (YYYY-MM-DD)
    completed: integer({ mode: 'boolean' }).default(false),
    duration_minutes: integer().default(0),
    notes: text(),
    created_at: text().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    // Unique constraint to prevent duplicate records for the same habit on the same date
    unique().on(table.habit_id, table.date),
  ],
)

// Settings table for user preferences
export const settings = sqliteTable('settings', {
  id: text().primaryKey(),
  theme: text().default('light'),
  default_view: text().default('calendar'),
  created_at: text().default(sql`CURRENT_TIMESTAMP`),
})

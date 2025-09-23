import { sql } from 'drizzle-orm'
import { int, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const usersTable = sqliteTable('users', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  age: int().notNull(),
  email: text().notNull().unique(),
})

// Habits table for habit definitions
export const habitsTable = sqliteTable('habits', {
  id: text().primaryKey(),
  name: text().notNull().unique(),
  description: text(),
  created_at: text().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().default(sql`CURRENT_TIMESTAMP`),
})

// Records table for daily habit execution tracking
export const recordsTable = sqliteTable('records', {
  id: text().primaryKey(),
  habit_id: text()
    .notNull()
    .references(() => habitsTable.id, { onDelete: 'cascade' }),
  date: text().notNull(), // ISO date string (YYYY-MM-DD)
  completed: integer({ mode: 'boolean' }).default(false),
  duration_minutes: integer().default(0),
  created_at: text().default(sql`CURRENT_TIMESTAMP`),
})

// Settings table for user preferences
export const settingsTable = sqliteTable('settings', {
  id: text().primaryKey(),
  theme: text().default('light'),
  default_view: text().default('calendar'),
  created_at: text().default(sql`CURRENT_TIMESTAMP`),
})

import { relations, sql } from 'drizzle-orm'
import { index, integer, real, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'

// Habits table for habit definitions
export const habits = sqliteTable(
  'habits',
  {
    id: text().primaryKey(),
    name: text().notNull().unique(),
    description: text(),
    color: text().default('blue'),
    priority: text().$type<'high' | 'middle' | 'low' | null>(),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (habit) => [index('habits_userId').on(habit.userId)],
)

// Records table for daily habit execution tracking
export const records = sqliteTable(
  'records',
  {
    id: text().primaryKey(),
    habitId: text('habit_id')
      .notNull()
      .references(() => habits.id, { onDelete: 'cascade' }),
    date: text().notNull(), // ISO date string (YYYY-MM-DD)
    status: text().$type<'active' | 'completed' | 'skipped'>().notNull().default('active'),
    duration_minutes: integer().default(0),
    notes: text(),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [
    // Unique constraint to prevent duplicate records for the same habit on the same date
    unique().on(table.habitId, table.date),
    index('records_userId').on(table.userId),
  ],
)

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).default(false).notNull(),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
})

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', {
    mode: 'timestamp_ms',
  }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', {
    mode: 'timestamp_ms',
  }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const verifications = sqliteTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const passkeys = sqliteTable('passkeys', {
  id: text('id').primaryKey(),
  name: text('name'),
  publicKey: text('public_key').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  credentialID: text('credential_id').notNull(),
  counter: integer('counter').notNull(),
  deviceType: text('device_type').notNull(),
  backedUp: integer('backed_up', { mode: 'boolean' }).notNull(),
  transports: text('transports'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }),
  aaguid: text('aaguid'),
})

// Settings table for user preferences
export const settings = sqliteTable('settings', {
  id: text().primaryKey(),
  theme: text().default('auto'), // 'light' | 'dark' | 'auto'
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
})

// Habit Levels table for tracking habit progression
export const habitLevels = sqliteTable(
  'habit_levels',
  {
    id: text().primaryKey(),
    habitId: text('habit_id')
      .notNull()
      .unique() // 1 habit = 1 level record
      .references(() => habits.id, { onDelete: 'cascade' }),

    // Continuation level stats
    uniqueCompletionDays: integer('unique_completion_days').default(0).notNull(),
    completionLevel: integer('completion_level').default(1).notNull(),

    // Total hours level stats
    totalHoursDecimal: real('total_hours_decimal').default(0.0).notNull(),
    hoursLevel: integer('hours_level').default(1).notNull(),

    // Streak stats
    currentStreak: integer('current_streak').default(0).notNull(),
    longestStreak: integer('longest_streak').default(0).notNull(),
    lastActivityDate: text('last_activity_date'),

    // Metadata
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [
    index('habit_levels_habitId').on(table.habitId),
    index('habit_levels_userId').on(table.userId),
  ],
)

export const usersRelations = relations(users, ({ many }) => ({
  habits: many(habits),
  records: many(records),
  settings: many(settings),
  habitLevels: many(habitLevels),
}))

export const habitsRelations = relations(habits, ({ one, many }) => ({
  user: one(users, {
    fields: [habits.userId],
    references: [users.id],
  }),
  records: many(records),
  level: one(habitLevels, {
    fields: [habits.id],
    references: [habitLevels.habitId],
  }),
}))

export const recordsRelations = relations(records, ({ one }) => ({
  habit: one(habits, {
    fields: [records.habitId],
    references: [habits.id],
  }),
  user: one(users, {
    fields: [records.userId],
    references: [users.id],
  }),
}))

export const settingsRelations = relations(settings, ({ one }) => ({
  user: one(users, {
    fields: [settings.userId],
    references: [users.id],
  }),
}))

export const habitLevelsRelations = relations(habitLevels, ({ one }) => ({
  habit: one(habits, {
    fields: [habitLevels.habitId],
    references: [habits.id],
  }),
  user: one(users, {
    fields: [habitLevels.userId],
    references: [users.id],
  }),
}))

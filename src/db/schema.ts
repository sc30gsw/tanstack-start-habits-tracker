import { relations, sql } from 'drizzle-orm'
import { index, integer, real, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'

export const habits = sqliteTable(
  'habits',
  {
    id: text().primaryKey(),
    name: text().notNull().unique(),
    description: text(),
    color: text().default('blue'),
    priority: text().$type<'high' | 'middle' | 'low' | null>(),
    notificationsEnabled: integer('notifications_enabled', { mode: 'boolean' })
      .default(true)
      .notNull(),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (habit) => [index('habits_userId').on(habit.userId)],
)

export const records = sqliteTable(
  'records',
  {
    id: text().primaryKey(),
    habitId: text('habit_id')
      .notNull()
      .references(() => habits.id, { onDelete: 'cascade' }),
    date: text().notNull(),
    status: text().$type<'active' | 'completed' | 'skipped'>().notNull().default('active'),
    duration_minutes: integer().default(0),
    notes: text(),
    recoveryDate: text('recovery_date'),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [unique().on(table.habitId, table.date), index('records_userId').on(table.userId)],
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
    .$onUpdate(() => new Date())
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
    .$onUpdate(() => new Date())
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
    .$onUpdate(() => new Date())
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
    .$onUpdate(() => new Date())
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

export const settings = sqliteTable('settings', {
  id: text().primaryKey(),
  theme: text().default('auto'),
  notificationsEnabled: integer('notifications_enabled', { mode: 'boolean' }).default(false),
  customReminderEnabled: integer('custom_reminder_enabled', { mode: 'boolean' }).default(false),
  dailyReminderTime: text('daily_reminder_time').default('09:00'), // HH:mm format
  incompleteReminderEnabled: integer('incomplete_reminder_enabled', { mode: 'boolean' }).default(
    true,
  ),
  skippedReminderEnabled: integer('skipped_reminder_enabled', { mode: 'boolean' }).default(true),
  scheduledReminderEnabled: integer('scheduled_reminder_enabled', { mode: 'boolean' }).default(
    true,
  ),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
})

export const notifications = sqliteTable('notifications', {
  id: text().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text().notNull(),
  message: text().notNull(),
  type: text()
    .$type<
      | 'reminder'
      | 'habit_scheduled'
      | 'habit_active'
      | 'habit_skipped'
      | 'habit_incomplete'
      | 'achievement'
    >()
    .default('reminder'),
  habitId: text('habit_id').references(() => habits.id, { onDelete: 'cascade' }),
  recordId: text('record_id').references(() => records.id, { onDelete: 'cascade' }),
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  readAt: text('read_at'),
})

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  habit: one(habits, {
    fields: [notifications.habitId],
    references: [habits.id],
  }),
  record: one(records, {
    fields: [notifications.recordId],
    references: [records.id],
  }),
}))

export const habitLevels = sqliteTable(
  'habit_levels',
  {
    id: text().primaryKey(),
    habitId: text('habit_id')
      .notNull()
      .unique() // 1 habit = 1 level record
      .references(() => habits.id, { onDelete: 'cascade' }),
    uniqueCompletionDays: integer('unique_completion_days').default(0).notNull(),
    completionLevel: integer('completion_level').default(1).notNull(),
    totalHoursDecimal: real('total_hours_decimal').default(0.0).notNull(),
    hoursLevel: integer('hours_level').default(1).notNull(),
    currentStreak: integer('current_streak').default(0).notNull(),
    longestStreak: integer('longest_streak').default(0).notNull(),
    lastActivityDate: text('last_activity_date'),
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
  notifications: many(notifications),
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

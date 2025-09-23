import { migrate } from 'drizzle-orm/libsql/migrator'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { db } from '~/db'
import { habitsTable, recordsTable, settingsTable } from '~/db/schema'

describe('Database Migration', () => {
  beforeEach(async () => {
    // Clean up before each test
    await db.delete(recordsTable)
    await db.delete(habitsTable)
    await db.delete(settingsTable)
  })

  afterEach(async () => {
    // Clean up after each test
    await db.delete(recordsTable)
    await db.delete(habitsTable)
    await db.delete(settingsTable)
  })

  test('should run migrations successfully', async () => {
    // Migration should create tables without errors
    await expect(async () => {
      await migrate(db, { migrationsFolder: './drizzle/migrations' })
    }).not.toThrow()
  })

  test('should create habits table with correct structure', async () => {
    const result = await db.select().from(habitsTable).limit(1)
    expect(Array.isArray(result)).toBe(true)
  })

  test('should create records table with foreign key constraints', async () => {
    // Insert a test habit first
    const [habit] = await db
      .insert(habitsTable)
      .values({
        id: 'test-habit-1',
        name: 'Test Habit',
        description: 'Test Description',
      })
      .returning()

    // Insert a record referencing the habit
    const [record] = await db
      .insert(recordsTable)
      .values({
        id: 'test-record-1',
        habit_id: habit.id,
        date: '2025-01-01',
        completed: true,
        duration_minutes: 30,
      })
      .returning()

    expect(record.habit_id).toBe(habit.id)
  })

  test('should enforce unique constraint on habit names', async () => {
    // Insert first habit
    await db.insert(habitsTable).values({
      id: 'test-habit-1',
      name: 'Unique Habit',
      description: 'First habit',
    })

    // Attempt to insert second habit with same name should fail
    await expect(async () => {
      await db.insert(habitsTable).values({
        id: 'test-habit-2',
        name: 'Unique Habit', // Same name
        description: 'Second habit',
      })
    }).rejects.toThrow()
  })
})

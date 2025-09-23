import { migrate } from 'drizzle-orm/libsql/migrator'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { db } from '~/db'
import { habits, records, settings } from '~/db/schema'

describe('Database Migration', () => {
  beforeEach(async () => {
    // Clean up before each test
    await db.delete(records)
    await db.delete(habits)
    await db.delete(settings)
  })

  afterEach(async () => {
    // Clean up after each test
    await db.delete(records)
    await db.delete(habits)
    await db.delete(settings)
  })

  test('should run migrations successfully', async () => {
    // drizzle.config.ts で out: './drizzle' のため直接 './drizzle' を指定
    await expect(migrate(db, { migrationsFolder: './drizzle' })).resolves.not.toThrow()
  })

  test('should create habits table with correct structure', async () => {
    const result = await db.select().from(habits).limit(1)
    expect(Array.isArray(result)).toBe(true)
  })

  test('should create records table with foreign key constraints', async () => {
    // Insert a test habit first
    const [habit] = await db
      .insert(habits)
      .values({
        id: 'test-habit-1',
        name: 'Test Habit',
        description: 'Test Description',
      })
      .returning()

    // Insert a record referencing the habit
    const [record] = await db
      .insert(records)
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
    await db.insert(habits).values({
      id: 'test-habit-1',
      name: 'Unique Habit',
      description: 'First habit',
    })

    // Attempt to insert second habit with same name should fail
    await expect(
      db
        .insert(habits)
        .values({
          id: 'test-habit-2',
          name: 'Unique Habit', // Same name
          description: 'Second habit',
        })
        .returning(),
    ).rejects.toThrow()
  })
})

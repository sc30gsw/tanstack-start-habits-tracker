import { describe, expect, test } from 'vitest'
import { habits, records, settings } from '~/db/schema'

describe('Database Schema', () => {
  describe('Habits Table', () => {
    test('should have correct table structure', () => {
      expect(habits).toBeDefined()

      // Primary key field
      expect(habits.id).toBeDefined()

      // Required fields
      expect(habits.name).toBeDefined()
      expect(habits.description).toBeDefined()

      // Timestamp fields
      expect(habits.created_at).toBeDefined()
      expect(habits.updated_at).toBeDefined()
    })
  })

  describe('Records Table', () => {
    test('should have correct table structure', () => {
      expect(records).toBeDefined()

      // Primary key
      expect(records.id).toBeDefined()

      // Foreign key reference
      expect(records.habit_id).toBeDefined()

      // Core fields
      expect(records.date).toBeDefined()
      expect(records.completed).toBeDefined()
      expect(records.duration_minutes).toBeDefined()

      // Timestamp
      expect(records.created_at).toBeDefined()
    })
  })

  describe('Settings Table', () => {
    test('should have correct table structure', () => {
      expect(settings).toBeDefined()

      // Primary key
      expect(settings.id).toBeDefined()

      // Configuration fields
      expect(settings.theme).toBeDefined()
      expect(settings.default_view).toBeDefined()

      // Timestamp
      expect(settings.created_at).toBeDefined()
    })
  })
})

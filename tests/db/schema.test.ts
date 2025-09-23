import { describe, expect, test } from 'vitest'
import { habitsTable, recordsTable, settingsTable } from '~/db/schema'

describe('Database Schema', () => {
  describe('Habits Table', () => {
    test('should have correct table structure', () => {
      expect(habitsTable).toBeDefined()

      // Primary key field
      expect(habitsTable.id).toBeDefined()

      // Required fields
      expect(habitsTable.name).toBeDefined()
      expect(habitsTable.description).toBeDefined()

      // Timestamp fields
      expect(habitsTable.created_at).toBeDefined()
      expect(habitsTable.updated_at).toBeDefined()
    })
  })

  describe('Records Table', () => {
    test('should have correct table structure', () => {
      expect(recordsTable).toBeDefined()

      // Primary key
      expect(recordsTable.id).toBeDefined()

      // Foreign key reference
      expect(recordsTable.habit_id).toBeDefined()

      // Core fields
      expect(recordsTable.date).toBeDefined()
      expect(recordsTable.completed).toBeDefined()
      expect(recordsTable.duration_minutes).toBeDefined()

      // Timestamp
      expect(recordsTable.created_at).toBeDefined()
    })
  })

  describe('Settings Table', () => {
    test('should have correct table structure', () => {
      expect(settingsTable).toBeDefined()

      // Primary key
      expect(settingsTable.id).toBeDefined()

      // Configuration fields
      expect(settingsTable.theme).toBeDefined()
      expect(settingsTable.default_view).toBeDefined()

      // Timestamp
      expect(settingsTable.created_at).toBeDefined()
    })
  })
})

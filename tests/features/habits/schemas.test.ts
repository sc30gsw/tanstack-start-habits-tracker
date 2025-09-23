import { describe, expect, test } from 'vitest'
import {
  createHabitSchema,
  updateHabitSchema,
} from '../../../src/features/habits/types/schemas/habit-schemas'
import {
  createRecordSchema,
  updateRecordSchema,
} from '../../../src/features/habits/types/schemas/record-schemas'
import { settingsSchema } from '../../../src/features/habits/types/schemas/settings-schemas'

describe('Habit Schema Validation', () => {
  test('should validate valid habit creation data', () => {
    const validHabitData = {
      name: '朝の瞑想',
      description: '毎朝10分間の瞑想を行う',
    }

    const result = createHabitSchema.safeParse(validHabitData)
    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data.name).toBe('朝の瞑想')
      expect(result.data.description).toBe('毎朝10分間の瞑想を行う')
    }
  })

  test('should reject invalid habit data - empty name', () => {
    const invalidHabitData = {
      name: '',
      description: '説明',
    }

    const result = createHabitSchema.safeParse(invalidHabitData)
    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.error.issues).toHaveLength(1)
      expect(result.error.issues[0].path).toEqual(['name'])
    }
  })

  test('should reject invalid habit data - name too long', () => {
    const invalidHabitData = {
      name: 'a'.repeat(101), // 100文字を超える名前
      description: '説明',
    }

    const result = createHabitSchema.safeParse(invalidHabitData)
    expect(result.success).toBe(false)
  })

  test('should validate habit update data', () => {
    const updateData = {
      id: 'habit-123',
      name: '更新された習慣名',
      description: '更新された説明',
    }

    const result = updateHabitSchema.safeParse(updateData)
    expect(result.success).toBe(true)
  })

  test('should allow partial update for habit', () => {
    const partialUpdateData = {
      id: 'habit-123',
      name: '新しい名前のみ更新',
    }

    const result = updateHabitSchema.safeParse(partialUpdateData)
    expect(result.success).toBe(true)
  })
})

describe('Record Schema Validation', () => {
  test('should validate valid record creation', () => {
    const validRecordData = {
      habit_id: 'habit-123',
      date: '2025-09-23',
      completed: true,
      duration_minutes: 25,
    }

    const result = createRecordSchema.safeParse(validRecordData)
    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data.habit_id).toBe('habit-123')
      expect(result.data.date).toBe('2025-09-23')
      expect(result.data.completed).toBe(true)
      expect(result.data.duration_minutes).toBe(25)
    }
  })

  test('should reject invalid date format', () => {
    const invalidRecordData = {
      habit_id: 'habit-123',
      date: '2025/09/23', // 無効な日付フォーマット
      completed: true,
      duration_minutes: 25,
    }

    const result = createRecordSchema.safeParse(invalidRecordData)
    expect(result.success).toBe(false)
  })

  test('should reject negative duration', () => {
    const invalidRecordData = {
      habit_id: 'habit-123',
      date: '2025-09-23',
      completed: true,
      duration_minutes: -5, // 負の値
    }

    const result = createRecordSchema.safeParse(invalidRecordData)
    expect(result.success).toBe(false)
  })

  test('should allow zero duration', () => {
    const validRecordData = {
      habit_id: 'habit-123',
      date: '2025-09-23',
      completed: false,
      duration_minutes: 0,
    }

    const result = createRecordSchema.safeParse(validRecordData)
    expect(result.success).toBe(true)
  })

  test('should validate record update data', () => {
    const updateData = {
      id: 'record-123',
      completed: true,
      duration_minutes: 30,
    }

    const result = updateRecordSchema.safeParse(updateData)
    expect(result.success).toBe(true)
  })

  test('should reject missing required fields for creation', () => {
    const incompleteData = {
      habit_id: 'habit-123',
      // date, completed, duration_minutes が欠落
    }

    const result = createRecordSchema.safeParse(incompleteData)
    expect(result.success).toBe(false)
  })
})

describe('Settings Schema Validation', () => {
  test('should validate valid settings data', () => {
    const validSettingsData = {
      theme: 'light',
      default_view: 'calendar',
    }

    const result = settingsSchema.safeParse(validSettingsData)
    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data.theme).toBe('light')
      expect(result.data.default_view).toBe('calendar')
    }
  })

  test('should validate dark theme', () => {
    const darkThemeData = {
      theme: 'dark',
      default_view: 'list',
    }

    const result = settingsSchema.safeParse(darkThemeData)
    expect(result.success).toBe(true)
  })

  test('should reject invalid theme value', () => {
    const invalidSettingsData = {
      theme: 'invalid-theme',
      default_view: 'calendar',
    }

    const result = settingsSchema.safeParse(invalidSettingsData)
    expect(result.success).toBe(false)
  })

  test('should reject invalid default_view value', () => {
    const invalidSettingsData = {
      theme: 'light',
      default_view: 'invalid-view',
    }

    const result = settingsSchema.safeParse(invalidSettingsData)
    expect(result.success).toBe(false)
  })

  test('should use default values when fields are optional', () => {
    const minimalData = {}

    const result = settingsSchema.safeParse(minimalData)
    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data.theme).toBe('light')
      expect(result.data.default_view).toBe('calendar')
    }
  })
})

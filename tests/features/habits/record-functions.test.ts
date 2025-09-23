import { describe, expect, test } from 'vitest'
import {
  createRecord,
  updateRecord,
  deleteRecord,
  getRecords,
  getRecordById,
} from '../../../src/features/habits/server/record-functions'
import { createHabit } from '../../../src/features/habits/server/habit-functions'

describe('Record Server Functions', () => {
  describe('createRecord', () => {
    test('should create record with valid data', async () => {
      // まず習慣を作成
      const habitResult = await createHabit({
        name: 'テスト習慣',
        description: 'テスト用の習慣',
      })

      expect(habitResult.success).toBe(true)
      const habitId = habitResult.data!.id

      const recordData = {
        habit_id: habitId,
        date: '2025-09-23',
        completed: true,
        duration_minutes: 30,
      }

      const result = await createRecord(recordData)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.habit_id).toBe(habitId)
      expect(result.data?.date).toBe('2025-09-23')
      expect(result.data?.completed).toBe(true)
      expect(result.data?.duration_minutes).toBe(30)
      expect(result.data?.id).toBeDefined()
      expect(result.data?.created_at).toBeDefined()
    })

    test('should reject invalid record data', async () => {
      const invalidData = {
        habit_id: '', // 空のhabit_id
        date: '2025/09/23', // 無効な日付形式
        completed: 'invalid', // 無効なboolean値
        duration_minutes: -5, // 負の値
      }

      const result = await createRecord(invalidData as any)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.data).toBeUndefined()
    })

    test('should prevent future date records', async () => {
      // 習慣を作成
      const habitResult = await createHabit({
        name: '未来日付テスト習慣',
        description: 'テスト用',
      })

      const habitId = habitResult.data!.id

      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)

      const recordData = {
        habit_id: habitId,
        date: futureDate.toISOString().slice(0, 10),
        completed: true,
        duration_minutes: 15,
      }

      const result = await createRecord(recordData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('未来の日付')
    })

    test('should prevent duplicate records for same habit and date', async () => {
      // 習慣を作成
      const habitResult = await createHabit({
        name: '重複テスト習慣',
        description: 'テスト用',
      })

      const habitId = habitResult.data!.id

      const recordData = {
        habit_id: habitId,
        date: '2025-09-22',
        completed: true,
        duration_minutes: 20,
      }

      // 最初の記録を作成
      await createRecord(recordData)

      // 同じ習慣・同じ日付で再度作成を試行
      const result = await createRecord(recordData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('already exists')
    })
  })

  describe('updateRecord', () => {
    test('should update existing record', async () => {
      // 習慣と記録を作成
      const habitResult = await createHabit({
        name: '更新テスト習慣',
        description: 'テスト用',
      })

      const habitId = habitResult.data!.id

      const createResult = await createRecord({
        habit_id: habitId,
        date: '2025-09-21',
        completed: false,
        duration_minutes: 10,
      })

      expect(createResult.success).toBe(true)
      const recordId = createResult.data!.id

      // 記録を更新
      const updateData = {
        id: recordId,
        completed: true,
        duration_minutes: 25,
      }

      const result = await updateRecord(updateData)

      expect(result.success).toBe(true)
      expect(result.data?.completed).toBe(true)
      expect(result.data?.duration_minutes).toBe(25)
      expect(result.data?.habit_id).toBe(habitId)
      expect(result.data?.date).toBe('2025-09-21')
    })

    test('should handle partial updates', async () => {
      // 習慣と記録を作成
      const habitResult = await createHabit({
        name: '部分更新テスト習慣',
        description: 'テスト用',
      })

      const habitId = habitResult.data!.id

      const createResult = await createRecord({
        habit_id: habitId,
        date: '2025-09-20',
        completed: false,
        duration_minutes: 15,
      })

      const recordId = createResult.data!.id

      // 完了状態のみ更新
      const result = await updateRecord({
        id: recordId,
        completed: true,
      })

      expect(result.success).toBe(true)
      expect(result.data?.completed).toBe(true)
      expect(result.data?.duration_minutes).toBe(15) // 変更されない
    })

    test('should fail for non-existent record', async () => {
      const result = await updateRecord({
        id: 'non-existent-id',
        completed: true,
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })
  })

  describe('deleteRecord', () => {
    test('should delete existing record', async () => {
      // 習慣と記録を作成
      const habitResult = await createHabit({
        name: '削除テスト習慣',
        description: 'テスト用',
      })

      const habitId = habitResult.data!.id

      const createResult = await createRecord({
        habit_id: habitId,
        date: '2025-09-19',
        completed: true,
        duration_minutes: 35,
      })

      const recordId = createResult.data!.id

      // 削除実行
      const result = await deleteRecord(recordId)

      expect(result.success).toBe(true)

      // 削除後に取得を試行
      const getResult = await getRecordById(recordId)
      expect(getResult.success).toBe(false)
      expect(getResult.error).toContain('not found')
    })

    test('should fail for non-existent record', async () => {
      const result = await deleteRecord('non-existent-id')

      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })
  })

  describe('getRecords', () => {
    test('should return all records', async () => {
      // 習慣を作成
      const habitResult = await createHabit({
        name: '一覧テスト習慣',
        description: 'テスト用',
      })

      const habitId = habitResult.data!.id

      // 複数の記録を作成
      await createRecord({
        habit_id: habitId,
        date: '2025-09-18',
        completed: true,
        duration_minutes: 20,
      })

      await createRecord({
        habit_id: habitId,
        date: '2025-09-17',
        completed: false,
        duration_minutes: 0,
      })

      const result = await getRecords()

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data!.length).toBeGreaterThanOrEqual(2)
      expect(result.total).toBeGreaterThanOrEqual(2)
    })

    test('should filter records by habit_id', async () => {
      // 複数の習慣を作成
      const habit1Result = await createHabit({
        name: 'フィルターテスト習慣1',
        description: 'テスト用',
      })

      const habit2Result = await createHabit({
        name: 'フィルターテスト習慣2',
        description: 'テスト用',
      })

      const habit1Id = habit1Result.data!.id
      const habit2Id = habit2Result.data!.id

      // 各習慣に記録を作成
      await createRecord({
        habit_id: habit1Id,
        date: '2025-09-16',
        completed: true,
        duration_minutes: 30,
      })

      await createRecord({
        habit_id: habit2Id,
        date: '2025-09-16',
        completed: false,
        duration_minutes: 0,
      })

      // habit1のみの記録を取得
      const result = await getRecords({ habit_id: habit1Id })

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data!.every((record) => record.habit_id === habit1Id)).toBe(true)
    })
  })

  describe('getRecordById', () => {
    test('should return specific record', async () => {
      // 習慣と記録を作成
      const habitResult = await createHabit({
        name: '特定記録テスト習慣',
        description: 'テスト用',
      })

      const habitId = habitResult.data!.id

      const createResult = await createRecord({
        habit_id: habitId,
        date: '2025-09-15',
        completed: true,
        duration_minutes: 40,
      })

      const recordId = createResult.data!.id

      // IDで取得
      const result = await getRecordById(recordId)

      expect(result.success).toBe(true)
      expect(result.data?.id).toBe(recordId)
      expect(result.data?.habit_id).toBe(habitId)
      expect(result.data?.date).toBe('2025-09-15')
      expect(result.data?.completed).toBe(true)
      expect(result.data?.duration_minutes).toBe(40)
    })

    test('should fail for non-existent record', async () => {
      const result = await getRecordById('non-existent-id')

      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })
  })
})

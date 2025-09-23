import { describe, expect, test } from 'vitest'
import {
  createHabit,
  updateHabit,
  deleteHabit,
  getHabits,
  getHabitById,
} from '../../../src/features/habits/server/habit-functions'

describe('Habit Server Functions', () => {
  describe('createHabit', () => {
    test('should create habit with valid data', async () => {
      const habitData = {
        name: '朝の瞑想',
        description: '毎朝10分間の瞑想を行う',
      }

      const result = await createHabit(habitData)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.name).toBe('朝の瞑想')
      expect(result.data?.description).toBe('毎朝10分間の瞑想を行う')
      expect(result.data?.id).toBeDefined()
      expect(result.data?.created_at).toBeDefined()
      expect(result.data?.updated_at).toBeDefined()
    })

    test('should reject invalid habit data', async () => {
      const invalidData = {
        name: '', // 空の名前
        description: 'a'.repeat(501), // 長すぎる説明
      }

      const result = await createHabit(invalidData)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.data).toBeUndefined()
    })

    test('should handle unique constraint violation', async () => {
      const habitData = {
        name: 'ユニークな習慣',
        description: '一意性テスト',
      }

      // 最初の習慣を作成
      await createHabit(habitData)

      // 同じ名前で再度作成を試行
      const result = await createHabit(habitData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('already exists')
    })
  })

  describe('updateHabit', () => {
    test('should update existing habit', async () => {
      // まず習慣を作成
      const createResult = await createHabit({
        name: '更新前の習慣',
        description: '更新前の説明',
      })

      expect(createResult.success).toBe(true)
      const habitId = createResult.data!.id

      // 習慣を更新
      const updateData = {
        id: habitId,
        name: '更新後の習慣',
        description: '更新後の説明',
      }

      const result = await updateHabit(updateData)

      expect(result.success).toBe(true)
      expect(result.data?.name).toBe('更新後の習慣')
      expect(result.data?.description).toBe('更新後の説明')
    })

    test('should handle partial updates', async () => {
      // 習慣を作成
      const createResult = await createHabit({
        name: '部分更新テスト',
        description: '元の説明',
      })

      const habitId = createResult.data!.id

      // 名前のみ更新
      const result = await updateHabit({
        id: habitId,
        name: '新しい名前',
      })

      expect(result.success).toBe(true)
      expect(result.data?.name).toBe('新しい名前')
      expect(result.data?.description).toBe('元の説明') // 説明は変更されない
    })

    test('should fail for non-existent habit', async () => {
      const result = await updateHabit({
        id: 'non-existent-id',
        name: '存在しない習慣',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })
  })

  describe('deleteHabit', () => {
    test('should delete existing habit', async () => {
      // 習慣を作成
      const createResult = await createHabit({
        name: '削除テスト習慣',
        description: '削除される習慣',
      })

      const habitId = createResult.data!.id

      // 削除実行
      const result = await deleteHabit(habitId)

      expect(result.success).toBe(true)

      // 削除後に取得を試行
      const getResult = await getHabitById(habitId)
      expect(getResult.success).toBe(false)
      expect(getResult.error).toContain('not found')
    })

    test('should fail for non-existent habit', async () => {
      const result = await deleteHabit('non-existent-id')

      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })
  })

  describe('getHabits', () => {
    test('should return all habits', async () => {
      // テスト用習慣を作成
      await createHabit({ name: '習慣1', description: '説明1' })
      await createHabit({ name: '習慣2', description: '説明2' })

      const result = await getHabits()

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data!.length).toBeGreaterThanOrEqual(2)
      expect(result.total).toBeGreaterThanOrEqual(2)
    })

    test('should handle empty habits list', async () => {
      // すべての習慣を削除（セットアップでクリアされることを前提）
      const result = await getHabits()

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
    })
  })

  describe('getHabitById', () => {
    test('should return specific habit', async () => {
      // 習慣を作成
      const createResult = await createHabit({
        name: '特定の習慣',
        description: '特定の説明',
      })

      const habitId = createResult.data!.id

      // IDで取得
      const result = await getHabitById(habitId)

      expect(result.success).toBe(true)
      expect(result.data?.id).toBe(habitId)
      expect(result.data?.name).toBe('特定の習慣')
      expect(result.data?.description).toBe('特定の説明')
    })

    test('should fail for non-existent habit', async () => {
      const result = await getHabitById('non-existent-id')

      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })
  })
})

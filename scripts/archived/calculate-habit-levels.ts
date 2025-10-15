/**
 * レベル＆ストリーク計算スクリプト
 *
 * マイグレーション後に実行し、既存の habit_levels レコードの
 * completionLevel, hoursLevel, currentStreak, longestStreak を計算します
 *
 * 実行方法:
 *   bun run scripts/calculate-habit-levels.ts
 */

import { db } from '~/db'
import { habitLevels, records } from '~/db/schema'
import { eq } from 'drizzle-orm'
import {
  calculateCompletionLevel,
  calculateHoursLevel,
  calculateStreak,
} from '~/features/habits/utils/habit-level-utils'

async function calculateHabitLevels() {
  console.log('🔄 レベル＆ストリーク計算開始...')

  const allLevels = await db.query.habitLevels.findMany()
  console.log(`📊 ${allLevels.length}件の習慣レベルレコードを処理します`)

  let successCount = 0
  let errorCount = 0

  for (const levelRecord of allLevels) {
    try {
      // 既存の統計値からレベルを計算
      const completionLevel = calculateCompletionLevel(levelRecord.uniqueCompletionDays)
      const hoursLevel = calculateHoursLevel(levelRecord.totalHoursDecimal)

      // その習慣の全レコードを取得してストリークを計算
      const habitRecords = await db.query.records.findMany({
        where: eq(records.habitId, levelRecord.habitId),
      })

      const completedRecords = habitRecords.filter((r) => r.status === 'completed')
      const completedDates = completedRecords.map((r) => r.date)
      const { currentStreak, longestStreak } = calculateStreak(completedDates)

      // habit_levels テーブルを更新
      await db
        .update(habitLevels)
        .set({
          completionLevel,
          hoursLevel,
          currentStreak,
          longestStreak,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(habitLevels.id, levelRecord.id))

      console.log(
        `✅ Habit ${levelRecord.habitId}: Level ${completionLevel}/${hoursLevel}, Streak ${currentStreak}/${longestStreak}`,
      )
      successCount++
    } catch (error) {
      console.error(`❌ Habit ${levelRecord.habitId} の処理に失敗:`, error)
      errorCount++
    }
  }

  console.log('\n📈 処理結果:')
  console.log(`  成功: ${successCount}件`)
  console.log(`  失敗: ${errorCount}件`)
  console.log('🎉 完了！')
}

calculateHabitLevels()
  .catch((error) => {
    console.error('💥 スクリプト実行エラー:', error)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })

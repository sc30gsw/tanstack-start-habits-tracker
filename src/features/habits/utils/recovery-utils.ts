import type { RecordEntity } from '~/features/habits/types/habit'

export function isRecordRecovered(record: RecordEntity, allRecords: RecordEntity[]) {
  if (record.status !== 'skipped' || !record.recoveryDate) {
    return false
  }

  const recoveryRecord = allRecords.find(
    (r) => r.date === record.recoveryDate && r.status === 'completed',
  )

  return !!recoveryRecord
}

export function getRecoveredDatesSet(records: RecordEntity[]) {
  const completedDates = new Set(records.filter((r) => r.status === 'completed').map((r) => r.date))

  const skippedWithRecovery = records.filter(
    (r) => r.status === 'skipped' && r.recoveryDate !== null && r.recoveryDate !== undefined,
  )

  const recoveredDates = skippedWithRecovery
    .filter((skip) => completedDates.has(skip.recoveryDate!))
    .map((skip) => skip.date)

  return new Set(recoveredDates)
}

import type { RecordEntity } from '~/features/habits/types/habit'

export function isRecordRecovered(record: RecordEntity, allRecords: RecordEntity[]) {
  if (record.status !== 'skipped' || !record.recoveryDate) {
    return false
  }

  const recoveryRecord = allRecords.find(
    (r) =>
      r.date === record.recoveryDate && r.isRecoveryAttempt === true && r.recoverySuccess === true,
  )

  return !!recoveryRecord
}

export function getRecoveredDatesSet(records: RecordEntity[]) {
  const skippedWithRecovery = records.filter(
    (r) => r.status === 'skipped' && r.recoveryDate !== null && r.recoveryDate !== undefined,
  )

  const recoveredDates = skippedWithRecovery
    .filter((skip) => {
      const hasSuccessfulRecovery = records.some(
        (r) =>
          r.date === skip.recoveryDate &&
          r.isRecoveryAttempt === true &&
          r.recoverySuccess === true,
      )

      return hasSuccessfulRecovery
    })
    .map((skip) => skip.date)

  return new Set(recoveredDates)
}

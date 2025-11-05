import { Card, type CSSProperties, Stack, Text, Tooltip } from '@mantine/core'
import { IconArrowBackUp } from '@tabler/icons-react'
import type { NavigateOptions } from '@tanstack/react-router'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { CALENDAR_VIEW_HASH_TARGET } from '~/features/habits/constants/hash-target-ids'
import type { RecordEntity } from '~/features/habits/types/habit'
import type { SearchParams } from '~/features/habits/types/schemas/search-params'
import { getDateColor, getDateTextColor, getDateType } from '~/features/habits/utils/calendar-utils'
import { isRecordRecovered } from '~/features/habits/utils/recovery-utils'
import { formatDuration } from '~/features/habits/utils/time-utils'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

const CELL_COLORS = {
  completed: {
    normal: 'var(--mantine-color-green-6)',
    selected: 'var(--mantine-color-green-7)',
  },
  recoveryCompleted: {
    normal: 'var(--mantine-color-cyan-6)',
    selected: 'var(--mantine-color-cyan-7)',
  },
  recoveryFailed: {
    normal: 'var(--mantine-color-red-5)',
    selected: 'var(--mantine-color-red-6)',
  },
  recoveryScheduled: {
    normal: 'var(--mantine-color-orange-5)',
    selected: 'var(--mantine-color-orange-6)',
  },
  incomplete: {
    normal: 'var(--mantine-color-yellow-5)',
    selected: 'var(--mantine-color-yellow-6)',
  },
  skipped: {
    normal: 'var(--mantine-color-gray-5)',
    selected: 'var(--mantine-color-gray-6)',
  },
  noRecord: {
    normal: 'transparent',
    selected: 'var(--mantine-color-blue-6)',
  },
  border: {
    normal: 'transparent',
    selected: 'var(--mantine-color-blue-6)',
    selectedNoRecord: 'var(--mantine-color-blue-8)',
  },
} as const satisfies Record<string, Record<string, CSSProperties['color']>>

type CellStyleState = {
  hasRecord: boolean
  isCompleted: boolean
  isSkipped: boolean
  isRecoveryCompleted: boolean
  isRecoveryFailed: boolean
  isRecoveryScheduled: boolean
  isSelected: boolean
  dateType: ReturnType<typeof getDateType>
}

function getCellBackgroundStyle(state: CellStyleState) {
  const {
    hasRecord,
    isCompleted,
    isSkipped,
    isRecoveryCompleted,
    isRecoveryFailed,
    isRecoveryScheduled,
    isSelected,
    dateType,
  } = state

  if (hasRecord) {
    let colorSet:
      | typeof CELL_COLORS.incomplete
      | typeof CELL_COLORS.completed
      | typeof CELL_COLORS.recoveryCompleted
      | typeof CELL_COLORS.recoveryFailed
      | typeof CELL_COLORS.recoveryScheduled
      | typeof CELL_COLORS.skipped = CELL_COLORS.incomplete

    switch (true) {
      case isRecoveryCompleted:
        colorSet = CELL_COLORS.recoveryCompleted
        break

      case isRecoveryFailed:
        colorSet = CELL_COLORS.recoveryFailed
        break

      case isCompleted:
        colorSet = CELL_COLORS.completed
        break

      case isRecoveryScheduled:
        colorSet = CELL_COLORS.recoveryScheduled
        break

      case isSkipped:
        colorSet = CELL_COLORS.skipped
        break
    }

    return {
      backgroundColor: isSelected ? colorSet.selected : colorSet.normal,
      borderColor: isSelected ? CELL_COLORS.border.selected : CELL_COLORS.border.normal,
    }
  }

  if (isSelected) {
    return {
      backgroundColor: CELL_COLORS.noRecord.selected,
      borderColor: CELL_COLORS.border.selectedNoRecord,
    }
  }

  return {
    backgroundColor: getDateColor(dateType, false, hasRecord),
    borderColor: CELL_COLORS.border.normal,
  }
}

type CalendarDateCellProps = {
  date: dayjs.Dayjs
  record?: RecordEntity | null
  allRecords: RecordEntity[]
  isCurrentMonth?: boolean
  variant: 'month' | 'week'
  selectedDate: SearchParams['selectedDate']
  navigate: (options: NavigateOptions) => void
}

export function CalendarDateCell({
  date,
  record,
  allRecords,
  isCurrentMonth = true,
  variant,
  selectedDate,
  navigate,
}: CalendarDateCellProps) {
  const isSelected = !!(selectedDate && dayjs(selectedDate).isSame(date, 'day'))
  const dateType = getDateType(date)
  const hasRecord = !!record

  const isRecoveryCompleted = !!(record && isRecordRecovered(record, allRecords))

  // Check if this is a failed recovery attempt
  const isRecoveryFailed = !!(
    record?.isRecoveryAttempt === true && record?.recoverySuccess === false
  )

  const recoveryDate =
    isRecoveryCompleted && record?.recoveryDate ? dayjs(record.recoveryDate) : null

  const recoverySourceRecord = allRecords.find(
    (r) => r.status === 'skipped' && r.recoveryDate === date.format('YYYY-MM-DD'),
  )
  const isRecoveryScheduled = !!(
    record?.status === 'active' &&
    recoverySourceRecord &&
    !isRecoveryCompleted &&
    !isRecoveryFailed
  )

  const borderWidth: CSSProperties['borderWidth'] = '2px'
  const { backgroundColor, borderColor } = getCellBackgroundStyle({
    hasRecord,
    isCompleted: record?.status === 'completed',
    isSkipped: record?.status === 'skipped',
    isRecoveryCompleted,
    isRecoveryFailed,
    isRecoveryScheduled,
    isSelected,
    dateType,
  })

  const textColor = getDateTextColor(dateType, isSelected, hasRecord)

  if (variant === 'month') {
    return (
      <Tooltip
        withinPortal
        label={
          record ? (
            <Stack gap={4} px="xs">
              <Text size="sm" fw={700}>
                {isRecoveryCompleted
                  ? 'リカバリー完了'
                  : isRecoveryFailed
                    ? 'リカバリー失敗'
                    : isRecoveryScheduled
                      ? 'リカバリー予定'
                      : record.status === 'completed'
                        ? '完了'
                        : record.status === 'skipped'
                          ? 'スキップ'
                          : '予定中'}
              </Text>
              <Text
                size="xs"
                c="dimmed"
                style={{
                  visibility:
                    record.status === 'skipped' ||
                    isRecoveryScheduled ||
                    isRecoveryFailed
                      ? 'hidden'
                      : 'visible',
                  height:
                    record.status === 'skipped' ||
                    isRecoveryScheduled ||
                    isRecoveryFailed
                      ? '0'
                      : '1em',
                }}
              >
                {formatDuration(record.duration_minutes || 0)}
              </Text>
              {isRecoveryCompleted && recoveryDate && (
                <Text size="xs" c="cyan.6" fw={700}>
                  {recoveryDate.format('M月D日')}に実施済み
                </Text>
              )}
              {isRecoveryFailed && (
                <Text size="xs" c="red.6" fw={700}>
                  リカバリー失敗として記録
                </Text>
              )}
              {isRecoveryScheduled && recoverySourceRecord && (
                <Text size="xs" c="orange.6" fw={700}>
                  {dayjs(recoverySourceRecord.date).format('M月D日')}のリカバリー予定
                </Text>
              )}
            </Stack>
          ) : (
            '記録なし'
          )
        }
      >
        <Card
          onClick={() =>
            navigate({
              hash: CALENDAR_VIEW_HASH_TARGET,
              search: (prev) => ({
                ...prev,
                selectedDate: date.format('YYYY-MM-DD'),
                showRecordForm: false,
              }),
            })
          }
          padding="xs"
          withBorder
          style={{
            flex: 1,
            textAlign: 'center',
            cursor: 'pointer',
            opacity: isCurrentMonth ? 1 : 0.35,
            backgroundColor,
            color: textColor,
            minWidth: 34,
            border: `${borderWidth} solid ${borderColor}`,
            boxShadow: isSelected ? '0 0 0 1px var(--mantine-color-blue-6)' : undefined,
            position: 'relative',
          }}
        >
          {isRecoveryCompleted && (
            <div
              style={{
                position: 'absolute',
                top: 2,
                right: 2,
                opacity: 0.8,
              }}
            >
              <IconArrowBackUp size={12} stroke={2} color="var(--mantine-color-orange-9)" />
            </div>
          )}
          <Text size="sm" fw={500}>
            {date.date()}
          </Text>
        </Card>
      </Tooltip>
    )
  }

  return (
    <Card
      withBorder
      padding="xs"
      style={{
        flex: 1,
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor,
        color: textColor,
        border: `${borderWidth} solid ${borderColor}`,
        boxShadow: isSelected ? '0 0 0 1px var(--mantine-color-blue-6)' : undefined,
      }}
      onClick={() =>
        navigate({
          search: (prev) => ({
            ...prev,
            selectedDate: date.format('YYYY-MM-DD'),
            showRecordForm: false,
          }),
          hash: CALENDAR_VIEW_HASH_TARGET,
        })
      }
    >
      <Text
        size="xs"
        c={
          isSelected || hasRecord
            ? 'white'
            : dateType === 'sunday'
              ? 'red.7'
              : dateType === 'saturday'
                ? 'blue.7'
                : 'dimmed'
        }
      >
        {date.format('dd')}
      </Text>
      <Text fw={500}>{date.date()}</Text>
    </Card>
  )
}

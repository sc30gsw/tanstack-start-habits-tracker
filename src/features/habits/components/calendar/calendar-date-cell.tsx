import { Card, type CSSProperties, Text, Tooltip } from '@mantine/core'
import type { NavigateOptions } from '@tanstack/react-router'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { CALENDAR_VIEW_HASH_TARGET } from '~/features/habits/constants/hash-target-ids'
import type { RecordEntity } from '~/features/habits/types/habit'
import type { SearchParams } from '~/features/habits/types/schemas/search-params'
import { getDateColor, getDateTextColor, getDateType } from '~/features/habits/utils/calendar-utils'
import { formatDuration } from '~/features/habits/utils/time-utils'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

const CELL_COLORS = {
  completed: {
    normal: 'var(--mantine-color-green-6)',
    selected: 'var(--mantine-color-green-7)',
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
  isSelected: boolean
  dateType: ReturnType<typeof getDateType>
}

function getCellBackgroundStyle(state: CellStyleState) {
  const { hasRecord, isCompleted, isSkipped, isSelected, dateType } = state

  if (hasRecord) {
    let colorSet:
      | typeof CELL_COLORS.incomplete
      | typeof CELL_COLORS.completed
      | typeof CELL_COLORS.skipped = CELL_COLORS.incomplete

    switch (true) {
      case isCompleted:
        colorSet = CELL_COLORS.completed
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
  isCurrentMonth?: boolean
  variant: 'month' | 'week'
  selectedDate: SearchParams['selectedDate']
  navigate: (options: NavigateOptions) => void
}

export function CalendarDateCell({
  date,
  record,
  isCurrentMonth = true,
  variant,
  selectedDate,
  navigate,
}: CalendarDateCellProps) {
  const isSelected = !!(selectedDate && dayjs(selectedDate).isSame(date, 'day'))
  const dateType = getDateType(date)
  const hasRecord = !!record

  const borderWidth: CSSProperties['borderWidth'] = '2px'
  const { backgroundColor, borderColor } = getCellBackgroundStyle({
    hasRecord,
    isCompleted: record?.status === 'completed',
    isSkipped: record?.status === 'skipped',
    isSelected,
    dateType,
  })

  const textColor = getDateTextColor(dateType, isSelected, hasRecord)

  if (variant === 'month') {
    return (
      <Tooltip
        withinPortal
        label={
          record
            ? `${record.status === 'completed' ? '完了' : record.status === 'skipped' ? 'スキップ' : '予定中'} / ${formatDuration(record.duration_minutes || 0)}`
            : '記録なし'
        }
      >
        <Card
          onClick={() =>
            navigate({
              hash: CALENDAR_VIEW_HASH_TARGET,
              search: (prev) => ({ ...prev, selectedDate: date.format('YYYY-MM-DD') }),
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
          }}
        >
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

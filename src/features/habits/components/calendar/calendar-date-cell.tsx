import { Card, type CSSProperties, Text, Tooltip } from '@mantine/core'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { CALENDAR_VIEW_HASH_TARGET } from '~/features/habits/constants/hash-target-ids'
import type { RecordEntity } from '~/features/habits/types/habit'
import { getValidatedDate } from '~/features/habits/types/schemas/search-params'
import { getDateColor, getDateTextColor, getDateType } from '~/features/habits/utils/calendar-utils'
import { formatDuration } from '~/features/habits/utils/time-utils'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

// カレンダーセルの色定数
const CELL_COLORS = {
  // 完了状態の色
  completed: {
    normal: 'var(--mantine-color-green-6)',
    selected: 'var(--mantine-color-green-7)',
  },
  // 未完了状態の色
  incomplete: {
    normal: 'var(--mantine-color-yellow-5)',
    selected: 'var(--mantine-color-yellow-6)',
  },
  // スキップ状態の色
  skipped: {
    normal: 'var(--mantine-color-gray-5)',
    selected: 'var(--mantine-color-gray-6)',
  },
  // 記録なし状態の色
  noRecord: {
    normal: 'transparent', // getDateColorで決定
    selected: 'var(--mantine-color-blue-6)',
  },
  // ボーダー色
  border: {
    normal: 'transparent',
    selected: 'var(--mantine-color-blue-6)',
    selectedNoRecord: 'var(--mantine-color-blue-8)',
  },
} as const satisfies Record<string, Record<string, CSSProperties['color']>>

// セルスタイルの型定義
type CellStyleState = {
  hasRecord: boolean
  isCompleted: boolean
  isSkipped: boolean
  isSelected: boolean
  dateType: ReturnType<typeof getDateType>
}

// 背景色とボーダー色を決定する純粋関数
function getCellBackgroundStyle(state: CellStyleState) {
  const { hasRecord, isCompleted, isSkipped, isSelected, dateType } = state

  // 記録がある場合
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

  // 記録がない場合
  if (isSelected) {
    return {
      backgroundColor: CELL_COLORS.noRecord.selected,
      borderColor: CELL_COLORS.border.selectedNoRecord,
    }
  }

  // デフォルト（記録なし・非選択）
  return {
    backgroundColor: getDateColor(dateType, false, hasRecord),
    borderColor: CELL_COLORS.border.normal,
  }
}

// カレンダー日付セルコンポーネントのProps型定義
type CalendarDateCellProps = {
  date: dayjs.Dayjs
  record?: RecordEntity | null
  isCurrentMonth?: boolean
  variant: 'month' | 'week'
}

// 共通の日付セルコンポーネント
export function CalendarDateCell({
  date,
  record,
  isCurrentMonth = true,
  variant,
}: CalendarDateCellProps) {
  const apiRoute = getRouteApi('/habits/$habitId')
  const searchParams = apiRoute.useSearch()
  const selectedDate = getValidatedDate(searchParams?.selectedDate)

  const navigate = apiRoute.useNavigate()

  const isSelected = !!(selectedDate && date.isSame(selectedDate, 'day'))
  const dateType = getDateType(date)
  const hasRecord = !!record

  // 背景色とボーダーの設定
  const borderWidth: CSSProperties['borderWidth'] = '2px'
  const { backgroundColor, borderColor } = getCellBackgroundStyle({
    hasRecord,
    isCompleted: record?.status === 'completed',
    isSkipped: record?.status === 'skipped',
    isSelected,
    dateType,
  })

  const textColor = getDateTextColor(dateType, isSelected, hasRecord)

  // 月表示用のコンテンツ
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

  // 週表示用のコンテンツ
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
        })
      }
    >
      <Text
        size="xs"
        c={
          isSelected || hasRecord
            ? 'white' // 選択時や記録がある時は白文字で視認性を確保
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

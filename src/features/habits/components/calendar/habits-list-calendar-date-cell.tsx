import { Box, Card, type CSSProperties, Flex, Stack, Text, Tooltip } from '@mantine/core'
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
  selected: {
    backgroundColor: 'var(--mantine-color-blue-6)',
    borderColor: 'var(--mantine-color-blue-8)',
  },
  normal: {
    borderColor: 'transparent',
  },
} as const satisfies Record<
  string,
  { backgroundColor?: CSSProperties['backgroundColor']; borderColor: CSSProperties['borderColor'] }
>

type CellStyleState = {
  isSelected: boolean
  dateType: ReturnType<typeof getDateType>
}

function getCellBackgroundStyle(state: CellStyleState) {
  const { isSelected, dateType } = state

  if (isSelected) {
    return {
      backgroundColor: CELL_COLORS.selected.backgroundColor,
      borderColor: CELL_COLORS.selected.borderColor,
    }
  }

  return {
    backgroundColor: getDateColor(dateType, false, false), // 記録なしとして扱う
    borderColor: CELL_COLORS.normal.borderColor,
  }
}

type HabitsListCalendarDateCellProps = {
  date: dayjs.Dayjs
  records: RecordEntity[]
  isCurrentMonth?: boolean
  variant: 'month' | 'week'
  showWeekday?: boolean
  selectedDate: SearchParams['selectedDate']
  navigate: (options: NavigateOptions) => void
}

export function HabitsListCalendarDateCell({
  date,
  records,
  isCurrentMonth = true,
  variant,
  showWeekday = false,
  selectedDate,
  navigate,
}: HabitsListCalendarDateCellProps) {
  const dateString = date.format('YYYY-MM-DD')
  const completedRecords =
    records.filter((r) => r.date === dateString && r.status === 'completed') ?? []

  const isSelected = !!(selectedDate && date.isSame(selectedDate, 'day'))
  const dateType = getDateType(date)

  const borderWidth: CSSProperties['borderWidth'] = '2px'
  const { backgroundColor, borderColor } = getCellBackgroundStyle({
    isSelected,
    dateType,
  })

  const textColor = getDateTextColor(dateType, isSelected, false) // 記録なしとして扱う

  const getTooltipContent = () => {
    // 完了した習慣のみを表示
    const completedDayRecords = records.filter(
      (r) => r.date === dateString && r.status === 'completed',
    )

    if (completedDayRecords.length === 0) {
      return '完了した習慣はありません'
    }

    return (
      <Stack gap={4} px="xs">
        <Text size="sm" fw={700}>
          {date.format('M月D日 (ddd)')}
        </Text>
        <Text size="xs" c="green.6" fw={500}>
          完了した習慣: {completedDayRecords.length}件
        </Text>
        {completedDayRecords.map((record) => (
          <Stack key={record.id} gap={2}>
            <Text size="xs" fw={600}>
              {record.habit?.name}
            </Text>
            <Text size="xs" c="dimmed">
              時間: {formatDuration(record.duration_minutes || 0)}
            </Text>
          </Stack>
        ))}
      </Stack>
    )
  }

  if (variant === 'month') {
    return (
      <Tooltip withinPortal label={getTooltipContent()}>
        <Card
          onClick={() => {
            navigate({
              search: (prev) => ({ ...prev, selectedDate: date.format('YYYY-MM-DD') }),
              hash: CALENDAR_VIEW_HASH_TARGET,
            })
          }}
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
            minHeight: '80px',
          }}
        >
          <Stack gap={2} align="stretch">
            <Text size="sm" fw={500}>
              {date.date()}
            </Text>
            {completedRecords.length > 0 && (
              <Stack gap={1} mt={4}>
                {completedRecords.slice(0, 3).map((record) => (
                  <Flex
                    key={record.id}
                    gap={4}
                    align="center"
                    style={{
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      w={3}
                      h={14}
                      style={{
                        backgroundColor: `var(--mantine-color-${record.habit?.color ?? 'blue'}-6)`,
                        borderRadius: '2px',
                        flexShrink: 0,
                      }}
                    />
                    <Text
                      size="9px"
                      ta="left"
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                      }}
                      title={record.habit?.name}
                    >
                      {record.habit?.name}
                    </Text>
                  </Flex>
                ))}
                {completedRecords.length > 3 && (
                  <Text size="8px" c={isSelected ? 'white' : 'dimmed'} ta="center">
                    +{completedRecords.length - 3}件
                  </Text>
                )}
              </Stack>
            )}
          </Stack>
        </Card>
      </Tooltip>
    )
  }

  return (
    <Tooltip withinPortal label={getTooltipContent()}>
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
          minHeight: '80px',
        }}
        onClick={() => {
          navigate({
            search: (prev) => ({
              ...prev,
              selectedDate: date.format('YYYY-MM-DD'),
            }),
            hash: CALENDAR_VIEW_HASH_TARGET,
          })
        }}
      >
        <Stack gap={2} align="stretch">
          {showWeekday && (
            <Text
              size="xs"
              c={
                isSelected
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
          )}
          <Text fw={500}>{date.date()}</Text>
          {completedRecords.length > 0 && (
            <Stack gap={1} mt={4}>
              {completedRecords.slice(0, 3).map((record) => (
                <Flex
                  key={record.id}
                  gap={4}
                  align="center"
                  style={{
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    w={3}
                    h={14}
                    style={{
                      backgroundColor: `var(--mantine-color-${record.habit?.color ?? 'blue'}-6)`,
                      borderRadius: '2px',
                      flexShrink: 0,
                    }}
                  />
                  <Text
                    size="9px"
                    ta="left"
                    c={isSelected ? 'white' : undefined}
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                    }}
                    title={record.habit?.name}
                  >
                    {record.habit?.name}
                  </Text>
                </Flex>
              ))}
              {completedRecords.length > 3 && (
                <Text size="8px" c={isSelected ? 'white' : 'dimmed'} ta="center">
                  +{completedRecords.length - 3}件
                </Text>
              )}
            </Stack>
          )}
        </Stack>
      </Card>
    </Tooltip>
  )
}

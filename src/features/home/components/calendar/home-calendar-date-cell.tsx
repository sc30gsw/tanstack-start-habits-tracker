import { Box, Card, type CSSProperties, Flex, Stack, Text } from '@mantine/core'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { getValidatedDate } from '~/features/habits/types/schemas/search-params'
import { getDateColor, getDateTextColor, getDateType } from '~/features/habits/utils/calendar-utils'
import { CALENDAR_ID } from '~/features/home/components/home-calendar-view'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

// シンプルなカレンダーセルの色定数
const CELL_COLORS = {
  // 選択時の色
  selected: {
    backgroundColor: 'var(--mantine-color-blue-6)',
    borderColor: 'var(--mantine-color-blue-8)',
  },
  // 通常時の色
  normal: {
    borderColor: 'transparent',
  },
} as const

// シンプルなセルスタイルの型定義
type CellStyleState = {
  isSelected: boolean
  dateType: ReturnType<typeof getDateType>
}

// 背景色とボーダー色を決定する純粋関数（簡素化版）
function getCellBackgroundStyle(state: CellStyleState) {
  const { isSelected, dateType } = state

  if (isSelected) {
    return {
      backgroundColor: CELL_COLORS.selected.backgroundColor,
      borderColor: CELL_COLORS.selected.borderColor,
    }
  }

  // 通常時は土日・祝日の色分けのみ
  return {
    backgroundColor: getDateColor(dateType, false, false), // 記録なしとして扱う
    borderColor: CELL_COLORS.normal.borderColor,
  }
}

// カレンダー日付セルコンポーネントのProps型定義（簡素化）
type HomeCalendarDateCellProps = {
  date: dayjs.Dayjs
  isCurrentMonth?: boolean
  variant: 'month' | 'week'
  showWeekday?: boolean
}

// Home専用の日付セルコンポーネント（簡素化版）
export function HomeCalendarDateCell({
  date,
  isCurrentMonth = true,
  variant,
  showWeekday = false,
}: HomeCalendarDateCellProps) {
  const apiRoute = getRouteApi('/')
  const searchParams = apiRoute.useSearch()
  const selectedDate = getValidatedDate(searchParams?.selectedDate)

  const navigate = apiRoute.useNavigate()

  const { records } = apiRoute.useLoaderData()

  const dateString = date.format('YYYY-MM-DD')
  const completedRecords =
    records.data?.filter((r) => r.date === dateString && r.status === 'completed') ?? []

  const isSelected = !!(selectedDate && date.isSame(selectedDate, 'day'))
  const dateType = getDateType(date)

  const borderWidth: CSSProperties['borderWidth'] = '2px'
  const { backgroundColor, borderColor } = getCellBackgroundStyle({
    isSelected,
    dateType,
  })

  const textColor = getDateTextColor(dateType, isSelected, false) // 記録なしとして扱う

  // 月表示用のコンテンツ
  if (variant === 'month') {
    return (
      <Card
        onClick={() => {
          navigate({
            search: (prev) => ({ ...prev, selectedDate: date.format('YYYY-MM-DD') }),
            hash: CALENDAR_ID,
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
                <Text size="8px" c="dimmed" ta="center">
                  +{completedRecords.length - 3}件
                </Text>
              )}
            </Stack>
          )}
        </Stack>
      </Card>
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
        minHeight: '80px',
      }}
      onClick={() => {
        navigate({
          search: (prev) => ({
            ...prev,
            selectedDate: date.format('YYYY-MM-DD'),
          }),
          hash: CALENDAR_ID,
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
              <Text size="8px" c="dimmed" ta="center">
                +{completedRecords.length - 3}件
              </Text>
            )}
          </Stack>
        )}
      </Stack>
    </Card>
  )
}

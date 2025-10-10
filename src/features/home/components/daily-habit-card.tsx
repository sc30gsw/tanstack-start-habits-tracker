import { Badge, Group, Paper, Text, Tooltip, useComputedColorScheme } from '@mantine/core'
import { IconClock } from '@tabler/icons-react'
import { getRouteApi, Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useHabitColor } from '~/features/habits/hooks/use-habit-color'
import type { HabitEntity, RecordEntity } from '~/features/habits/types/habit'
import type { HabitColor } from '~/features/habits/types/schemas/habit-schemas'
import { getValidatedDate } from '~/features/habits/types/schemas/search-params'
import { formatDuration } from '~/features/habits/utils/time-utils'

type DailyHabitCardProps = {
  habit: HabitEntity
  record?: RecordEntity
  isCompleted: boolean
}

export function DailyHabitCard({ habit, record, isCompleted }: DailyHabitCardProps) {
  const computedColorScheme = useComputedColorScheme('light')
  const { getHabitColor } = useHabitColor()

  // ホームページのsearchParamsから選択日を取得
  const apiRoute = getRouteApi('/')
  const searchParams = apiRoute.useSearch()
  const selectedDate = getValidatedDate(searchParams.selectedDate)

  return (
    <Tooltip
      label={
        isCompleted ? (
          <>
            <Text size="xs">✅ {habit.name}を完了しました！お疲れ様でした。</Text>
            <br />
            {record?.duration_minutes && record.duration_minutes > 0 ? (
              <Text size="xs">実行時間: {formatDuration(record.duration_minutes)}</Text>
            ) : (
              ''
            )}
          </>
        ) : (
          <Text size="xs">
            💪 {habit.name}
            に取り組んでみませんか？今日はまだ時間があります！
            <br />
            クリックして詳細を確認できます。
          </Text>
        )
      }
      position="top"
      withArrow
      color={isCompleted ? undefined : 'blue'}
    >
      <Paper
        withBorder
        radius="sm"
        p="sm"
        bg={
          isCompleted
            ? computedColorScheme === 'dark'
              ? 'green.9'
              : 'green.0'
            : computedColorScheme === 'dark'
              ? 'dark.6'
              : 'gray.0'
        }
      >
        <Group justify="space-between" align="center">
          <Group gap="sm" align="center">
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: getHabitColor(habit.color as HabitColor),
                opacity: isCompleted ? 1 : 0.5,
              }}
            />
            <Link
              to="/habits/$habitId"
              params={() => ({ habitId: habit.id })}
              search={() => ({ selectedDate: dayjs(selectedDate).format('YYYY-MM-DD') })}
            >
              <Text
                size="sm"
                fw={isCompleted ? 600 : 500}
                c={
                  isCompleted
                    ? computedColorScheme === 'dark'
                      ? 'green.2'
                      : 'green.8'
                    : computedColorScheme === 'dark'
                      ? 'gray.3'
                      : 'gray.7'
                }
                style={{ cursor: 'pointer' }}
              >
                {habit.name}
              </Text>
            </Link>
          </Group>
          <Group gap="xs" align="center">
            {record?.duration_minutes && record.duration_minutes > 0 && (
              <Badge
                variant="light"
                color={isCompleted ? 'blue' : 'gray'}
                size="sm"
                leftSection={<IconClock size={12} />}
              >
                {formatDuration(record.duration_minutes)}
              </Badge>
            )}
            <Badge
              variant={isCompleted ? 'filled' : 'outline'}
              color={isCompleted ? 'green' : 'gray'}
              size="sm"
            >
              {isCompleted ? '完了' : '未完了'}
            </Badge>
          </Group>
        </Group>
        {!isCompleted && record?.notes && (
          <Text size="xs" c="dimmed" mt="xs">
            {record.notes}
          </Text>
        )}
      </Paper>
    </Tooltip>
  )
}

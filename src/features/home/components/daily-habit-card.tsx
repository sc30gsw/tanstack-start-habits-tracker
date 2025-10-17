import { Badge, Box, Group, Paper, Text, Tooltip, useComputedColorScheme } from '@mantine/core'
import {
  IconCheck,
  IconCircleDashed,
  IconClock,
  IconExternalLink,
  IconPlayerSkipForward,
  IconX,
} from '@tabler/icons-react'
import { getRouteApi, Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useHabitColor } from '~/features/habits/hooks/use-habit-color'
import type { HabitEntity, RecordEntity } from '~/features/habits/types/habit'
import type { HabitColor } from '~/features/habits/types/schemas/habit-schemas'
import type { RecordStatus } from '~/features/habits/types/schemas/record-schemas'
import { getValidatedDate } from '~/features/habits/types/schemas/search-params'
import { formatDuration } from '~/features/habits/utils/time-utils'

function getStatusConfig(status: RecordStatus | 'unscheduled') {
  switch (status) {
    case 'completed':
      return {
        color: 'green',
        label: '完了',
        icon: IconCheck,
        variant: 'filled' as const,
      }

    case 'skipped':
      return {
        color: 'orange',
        label: 'スキップ',
        icon: IconPlayerSkipForward,
        variant: 'light' as const,
      }

    case 'unscheduled':
      return {
        color: 'gray',
        label: '未完了',
        icon: IconX,
        variant: 'outline' as const,
      }

    default:
      return {
        color: 'blue',
        label: '進行中',
        icon: IconCircleDashed,
        variant: 'light' as const,
      }
  }
}

type DailyHabitCardProps = {
  habit: HabitEntity
  record?: RecordEntity
  isCompleted: boolean
}

export function DailyHabitCard({ habit, record }: DailyHabitCardProps) {
  const computedColorScheme = useComputedColorScheme('light')
  const { getHabitColor } = useHabitColor()
  const [isDetailHovered, setIsDetailHovered] = useState(false)

  const status = record ? record.status : 'unscheduled'
  const statusConfig = getStatusConfig(status as RecordStatus | 'unscheduled')
  const StatusIcon = statusConfig.icon

  const apiRoute = getRouteApi('/')
  const searchParams = apiRoute.useSearch()
  const selectedDate = getValidatedDate(searchParams.selectedDate)

  const getBgColor = () => {
    switch (status) {
      case 'completed':
      case 'skipped':
        return computedColorScheme === 'dark' ? 'dark.8' : 'gray.1'

      case 'unscheduled':
        return computedColorScheme === 'dark' ? 'dark.7' : 'gray.1'

      default:
        return computedColorScheme === 'dark' ? 'dark.6' : 'gray.0'
    }
  }

  const getMotivationMessage = () => {
    switch (status) {
      case 'completed':
        return (
          <Group gap="xs">
            <StatusIcon size={14} />
            <Text size="xs">素晴らしい！完了しました。継続が力になります！</Text>
          </Group>
        )

      case 'skipped':
        return (
          <Group gap="xs">
            <StatusIcon size={14} />
            <Text size="xs">大丈夫です。明日また挑戦しましょう！</Text>
          </Group>
        )

      case 'unscheduled':
        return (
          <Group gap="xs">
            <StatusIcon size={14} />
            <Text size="xs">今日はまだ取り組んでいません。さあ、始めましょう！</Text>
          </Group>
        )

      default:
        return (
          <Group gap="xs">
            <StatusIcon size={14} />
            <Text size="xs">今日も頑張りましょう！小さな一歩が大きな変化を生みます。</Text>
          </Group>
        )
    }
  }

  return (
    <Tooltip
      label={getMotivationMessage()}
      position="top"
      withArrow
      color={statusConfig.color}
      disabled={isDetailHovered}
    >
      <Paper withBorder radius="sm" p="sm" bg={getBgColor()}>
        <Group justify="space-between" align="center">
          <Group gap="sm" align="center">
            <Box
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: getHabitColor(habit.color as HabitColor),
                opacity: status === 'completed' ? 1 : 0.5,
                cursor: 'grab',
                flexShrink: 0,
              }}
            />
            <Text
              size="sm"
              fw={status === 'completed' ? 600 : 500}
              c={
                status === 'completed'
                  ? computedColorScheme === 'dark'
                    ? 'green.2'
                    : 'green.8'
                  : status === 'skipped'
                    ? computedColorScheme === 'dark'
                      ? 'orange.3'
                      : 'orange.7'
                    : status === 'unscheduled'
                      ? computedColorScheme === 'dark'
                        ? 'gray.5'
                        : 'gray.6'
                      : computedColorScheme === 'dark'
                        ? 'gray.3'
                        : 'gray.7'
              }
            >
              {habit.name}
            </Text>
          </Group>
          <Group gap="xs" align="center">
            {record?.duration_minutes && record.duration_minutes > 0 && (
              <Badge variant="light" color="blue" size="sm" leftSection={<IconClock size={12} />}>
                {formatDuration(record.duration_minutes)}
              </Badge>
            )}
            <Badge
              variant={statusConfig.variant}
              color={statusConfig.color}
              size="sm"
              leftSection={<StatusIcon size={12} />}
            >
              {statusConfig.label}
            </Badge>
            <Tooltip label="詳細を表示" position="top" withArrow>
              <Link
                to="/habits/$habitId"
                params={() => ({ habitId: habit.id })}
                search={() => ({ selectedDate: dayjs(selectedDate).format('YYYY-MM-DD') })}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color:
                    computedColorScheme === 'dark'
                      ? 'var(--mantine-color-gray-5)'
                      : 'var(--mantine-color-gray-6)',
                  textDecoration: 'none',
                }}
                onMouseEnter={() => setIsDetailHovered(true)}
                onMouseLeave={() => setIsDetailHovered(false)}
              >
                <IconExternalLink size={16} />
              </Link>
            </Tooltip>
          </Group>
        </Group>
      </Paper>
    </Tooltip>
  )
}

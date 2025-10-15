import { Button, Group, Stack, Text, Title } from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { IconPlayerPause, IconPlayerPlay, IconPlayerStop, IconRefresh } from '@tabler/icons-react'
import { getRouteApi, useLocation } from '@tanstack/react-router'
import type { InferSelectModel } from 'drizzle-orm'
import { useEffect, useState } from 'react'
import type { habits } from '~/db/schema'

const MILLISECONDS_PER_SECOND = 1000
const SECONDS_PER_HOUR = 3600
const SECONDS_PER_MINUTE = 60
const STOPWATCH_UPDATE_INTERVAL_MS = 100
const TIME_DISPLAY_PADDING = 2

type StopwatchTimerProps = {
  habitId: InferSelectModel<typeof habits>['id'] | null
  isRunning: boolean
  startTime: number | null
  pausedElapsed: number
  onFinish: () => void
}

export function StopwatchTimer({
  habitId,
  isRunning,
  startTime,
  pausedElapsed,
  onFinish,
}: StopwatchTimerProps) {
  const routeApi = getRouteApi('__root__')
  const navigate = routeApi.useNavigate()
  const location = useLocation()

  const [displayTime, setDisplayTime] = useState(pausedElapsed)

  useEffect(() => {
    if (!isRunning || !startTime) {
      setDisplayTime(pausedElapsed)
      return
    }

    const interval = setInterval(() => {
      const now = Date.now()
      const elapsed = Math.floor((now - startTime) / MILLISECONDS_PER_SECOND) + pausedElapsed
      setDisplayTime(elapsed)
    }, STOPWATCH_UPDATE_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [isRunning, startTime, pausedElapsed])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / SECONDS_PER_HOUR)
    const minutes = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE)
    const secs = seconds % SECONDS_PER_MINUTE

    return `${String(hours).padStart(TIME_DISPLAY_PADDING, '0')}:${String(minutes).padStart(TIME_DISPLAY_PADDING, '0')}:${String(secs).padStart(TIME_DISPLAY_PADDING, '0')}`
  }

  const handleStart = () => {
    if (!habitId) {
      notifications.show({
        title: 'エラー',
        message: '習慣を選択してください',
        color: 'red',
      })
      return
    }

    navigate({
      to: location.pathname,
      search: (prev) => ({
        ...prev,
        stopwatchRunning: true,
        stopwatchStartTime: Date.now(),
      }),
    })
  }

  const handlePause = () => {
    navigate({
      to: location.pathname,
      search: (prev) => ({
        ...prev,
        stopwatchRunning: false,
        stopwatchStartTime: null,
        stopwatchElapsed: displayTime,
      }),
    })
  }

  const handleResume = () => {
    navigate({
      to: location.pathname,
      search: (prev) => ({
        ...prev,
        stopwatchRunning: true,
        stopwatchStartTime: Date.now(),
      }),
    })
  }

  const handleReset = () => {
    const wasRunning = isRunning

    modals.openConfirmModal({
      title: (
        <Group gap="xs">
          <IconRefresh size={20} />
          <Text>タイマーをリセット</Text>
        </Group>
      ),
      children: (
        <Stack gap="sm">
          <Text size="sm">
            計測中の時間は
            <Text component="span" fw={700} c="red">
              記録されません
            </Text>
            。
          </Text>
          <Text size="sm" c="dimmed">
            タイマーを0:00:00に戻してやり直しますか？
          </Text>
        </Stack>
      ),
      labels: { confirm: 'リセット', cancel: 'キャンセル' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        navigate({
          to: location.pathname,
          search: (prev) => ({
            ...prev,
            stopwatchRunning: false,
            stopwatchStartTime: null,
            stopwatchElapsed: 0,
          }),
        })
        setDisplayTime(0)
      },
      onCancel: () => {
        // キャンセル時に元の状態を復元
        if (wasRunning) {
          navigate({
            to: location.pathname,
            search: (prev) => ({
              ...prev,
              stopwatchRunning: true,
              stopwatchStartTime: Date.now(),
            }),
          })
        }
      },
    })
  }

  return (
    <Stack gap="lg">
      {/* タイマー表示 */}
      <Stack align="center" gap="xs">
        <Title order={1} style={{ fontSize: '3rem', fontWeight: 700, fontFamily: 'monospace' }}>
          {formatTime(displayTime)}
        </Title>
        <Text size="sm" c="dimmed">
          {isRunning ? '計測中...' : pausedElapsed > 0 ? '一時停止中' : '開始してください'}
        </Text>
      </Stack>

      {/* コントロールボタン */}
      {!isRunning && pausedElapsed === 0 && (
        <Group grow>
          <Button
            leftSection={<IconPlayerPlay size={16} />}
            onClick={handleStart}
            disabled={!habitId}
          >
            開始する
          </Button>
        </Group>
      )}

      {isRunning && (
        <Group grow>
          <Button leftSection={<IconPlayerPause size={16} />} onClick={handlePause} color="orange">
            一時停止
          </Button>
          <Button leftSection={<IconRefresh size={16} />} onClick={handleReset} color="red">
            リセット
          </Button>
          <Button leftSection={<IconPlayerStop size={16} />} onClick={onFinish} color="green">
            終了する
          </Button>
        </Group>
      )}

      {!isRunning && pausedElapsed > 0 && (
        <Group grow>
          <Button leftSection={<IconPlayerPlay size={16} />} onClick={handleResume}>
            再開する
          </Button>
          <Button leftSection={<IconRefresh size={16} />} onClick={handleReset} color="red">
            リセット
          </Button>
          <Button leftSection={<IconPlayerStop size={16} />} onClick={onFinish} color="green">
            終了する
          </Button>
        </Group>
      )}
    </Stack>
  )
}

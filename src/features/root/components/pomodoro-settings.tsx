import { NumberInput, Stack, Text } from '@mantine/core'
import { getRouteApi, useLocation } from '@tanstack/react-router'
import type { PomodoroSettings } from '~/features/root/types/stopwatch'

type PomodoroSettingsFormProps = {
  settings: PomodoroSettings
  disabled?: boolean
}

export function PomodoroSettingsForm({ settings, disabled = false }: PomodoroSettingsFormProps) {
  const routeApi = getRouteApi('__root__')
  const navigate = routeApi.useNavigate()
  const location = useLocation()

  const handleSettingChange = (field: keyof PomodoroSettings, value: number | string) => {
    navigate({
      to: location.pathname,
      search: (prev) => ({
        ...prev,
        [`pomodoro${field.charAt(0).toUpperCase()}${field.slice(1)}`]: value,
      }),
    })
  }

  return (
    <Stack gap="sm">
      <Text size="sm" fw={500}>
        ポモドーロ設定
      </Text>
      <NumberInput
        label="集中時間"
        value={settings.focusDuration}
        onChange={(val) => handleSettingChange('focusDuration', val || 25)}
        min={1}
        max={60}
        suffix=" 分"
        disabled={disabled}
      />
      <NumberInput
        label="休憩時間"
        value={settings.breakDuration}
        onChange={(val) => handleSettingChange('breakDuration', val || 5)}
        min={1}
        max={30}
        suffix=" 分"
        disabled={disabled}
      />
      <NumberInput
        label="長い休憩"
        value={settings.longBreakDuration}
        onChange={(val) => handleSettingChange('longBreakDuration', val || 15)}
        min={1}
        max={60}
        suffix=" 分"
        disabled={disabled}
      />
      <NumberInput
        label="長い休憩の間隔"
        value={settings.longBreakInterval}
        onChange={(val) => handleSettingChange('longBreakInterval', val || 3)}
        min={2}
        max={10}
        suffix=" セット毎"
        disabled={disabled}
      />
    </Stack>
  )
}

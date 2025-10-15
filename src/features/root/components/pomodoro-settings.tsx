import { NumberInput, Stack, Text } from '@mantine/core'
import { useEffect } from 'react'
import type { PomodoroSettings } from '~/features/root/types/stopwatch'

type PomodoroSettingsFormProps = {
  settings: PomodoroSettings
  onSettingsChange: (settings: PomodoroSettings) => void
  onValidationChange?: (isValid: boolean) => void
  disabled?: boolean
}

export function PomodoroSettingsForm({
  settings,
  onSettingsChange,
  onValidationChange,
  disabled = false,
}: PomodoroSettingsFormProps) {
  // バリデーションチェック
  const isValid =
    settings.focusDuration >= 1 &&
    settings.focusDuration <= 60 &&
    settings.breakDuration >= 1 &&
    settings.breakDuration <= 30 &&
    settings.longBreakDuration >= 1 &&
    settings.longBreakDuration <= 60 &&
    settings.longBreakInterval >= 2 &&
    settings.longBreakInterval <= 10

  // バリデーション状態を親に通知
  useEffect(() => {
    onValidationChange?.(isValid)
  }, [isValid, onValidationChange])

  const handleSettingChange = (field: keyof PomodoroSettings, value: number | string) => {
    // undefined, null, 空文字列の場合は何もしない
    if (value === undefined || value === null || value === '') {
      return
    }

    // 数値に変換
    const numValue = typeof value === 'number' ? value : Number(value)

    // 数値として有効で、かつNaNでない場合のみ更新
    if (!Number.isNaN(numValue) && numValue > 0) {
      onSettingsChange({
        ...settings,
        [field]: numValue,
      })
    }
  }

  return (
    <Stack gap="sm">
      <Text size="sm" fw={500}>
        ポモドーロ設定
      </Text>
      <NumberInput
        label="集中時間"
        value={settings.focusDuration}
        onChange={(val) => handleSettingChange('focusDuration', val)}
        suffix=" 分"
        disabled={disabled}
        allowDecimal={false}
        allowNegative={false}
        clampBehavior="strict"
        error={
          settings.focusDuration < 1 || settings.focusDuration > 60
            ? '1〜60分の範囲で入力してください'
            : undefined
        }
      />
      <NumberInput
        label="休憩時間"
        value={settings.breakDuration}
        onChange={(val) => handleSettingChange('breakDuration', val)}
        suffix=" 分"
        disabled={disabled}
        allowDecimal={false}
        allowNegative={false}
        clampBehavior="strict"
        error={
          settings.breakDuration < 1 || settings.breakDuration > 30
            ? '1〜30分の範囲で入力してください'
            : undefined
        }
      />
      <NumberInput
        label="長い休憩"
        value={settings.longBreakDuration}
        onChange={(val) => handleSettingChange('longBreakDuration', val)}
        suffix=" 分"
        disabled={disabled}
        allowDecimal={false}
        allowNegative={false}
        clampBehavior="strict"
        error={
          settings.longBreakDuration < 1 || settings.longBreakDuration > 60
            ? '1〜60分の範囲で入力してください'
            : undefined
        }
      />
      <NumberInput
        label="長い休憩の間隔"
        value={settings.longBreakInterval}
        onChange={(val) => handleSettingChange('longBreakInterval', val)}
        suffix=" セット毎"
        disabled={disabled}
        allowDecimal={false}
        allowNegative={false}
        clampBehavior="strict"
        error={
          settings.longBreakInterval < 2 || settings.longBreakInterval > 10
            ? '2〜10セットの範囲で入力してください'
            : undefined
        }
      />
    </Stack>
  )
}

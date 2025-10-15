import { Group, Select, Slider, Stack, Text } from '@mantine/core'
import { IconMusic, IconVolume } from '@tabler/icons-react'
import { getRouteApi, useLocation } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import type { SearchParams } from '~/features/habits/types/schemas/search-params'
import {
  AMBIENT_SOUNDS,
  type AmbientSoundId,
  AmbientSoundManager,
} from '~/features/root/utils/ambient-sound'

type AmbientSoundPlayerProps = {
  shouldStop?: boolean
  onStopped?: () => void
}

export function AmbientSoundPlayer({ shouldStop = false, onStopped }: AmbientSoundPlayerProps) {
  const routeApi = getRouteApi('__root__')
  const navigate = routeApi.useNavigate()
  const location = useLocation()
  const searchParams = routeApi.useSearch()

  const selectedSoundId = searchParams.ambientSound ?? 'none'
  const volume = searchParams.ambientVolume ?? 50

  const managerRef = useRef<AmbientSoundManager | null>(null)

  // 初期化
  useEffect(() => {
    managerRef.current = new AmbientSoundManager()

    return () => {
      // クリーンアップ
      managerRef.current?.dispose()
      managerRef.current = null
    }
  }, [])

  // selectedSoundIdが変更されたら自動的に再生
  useEffect(() => {
    if (!managerRef.current) {
      return
    }

    if (selectedSoundId === 'none') {
      managerRef.current.stop()
    } else {
      managerRef.current.play(selectedSoundId)
    }
  }, [selectedSoundId])

  // volumeが変更されたら音量を更新
  useEffect(() => {
    if (!managerRef.current) {
      return
    }

    managerRef.current.setVolume(volume / 100)
  }, [volume])

  // 外部からの停止トリガー
  useEffect(() => {
    if (shouldStop && managerRef.current) {
      managerRef.current.stop()

      // search paramsも更新
      navigate({
        to: location.pathname,
        search: (prev) => ({
          ...prev,
          ambientSound: 'none',
        }),
      })

      onStopped?.()
    }
  }, [shouldStop, onStopped, navigate, location.pathname])

  // 環境音の変更
  const handleSoundChange = (value: string | null) => {
    if (!value) return

    const soundId = value as AmbientSoundId

    navigate({
      to: location.pathname,
      search: (prev) => ({
        ...prev,
        ambientSound: soundId as SearchParams['ambientSound'],
      }),
    })
  }

  // 音量の変更
  const handleVolumeChange = (value: number) => {
    navigate({
      to: location.pathname,
      search: (prev) => ({
        ...prev,
        ambientVolume: value,
      }),
    })
  }

  return (
    <Stack gap="md">
      <Group gap="xs">
        <IconMusic size={18} />
        <Text size="sm" fw={500}>
          環境音
        </Text>
      </Group>

      <Select
        placeholder="環境音を選択"
        data={AMBIENT_SOUNDS.map((sound) => ({
          value: sound.id,
          label: sound.name,
        }))}
        value={selectedSoundId}
        onChange={handleSoundChange}
        size="sm"
      />

      {selectedSoundId !== 'none' && (
        <Stack gap="xs">
          <Group gap="xs">
            <IconVolume size={16} />
            <Text size="xs" c="dimmed">
              音量: {volume}%
            </Text>
          </Group>
          <Slider
            value={volume}
            onChange={handleVolumeChange}
            min={0}
            max={100}
            step={5}
            size="sm"
            marks={[
              { value: 0, label: '0%' },
              { value: 50, label: '50%' },
              { value: 100, label: '100%' },
            ]}
          />
        </Stack>
      )}
    </Stack>
  )
}

import { ActionIcon, Menu, Slider, Stack, Text } from '@mantine/core'
import { IconMusic, IconMusicOff } from '@tabler/icons-react'
import { getRouteApi, useLocation } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import type { SearchParams } from '~/features/habits/types/schemas/search-params'
import {
  AMBIENT_SOUNDS,
  type AmbientSoundId,
  AmbientSoundManager,
} from '~/features/root/utils/ambient-sound'

/**
 * グローバル環境音プレイヤー
 * ヘッダーに配置し、どのページからでも環境音を再生できるようにする
 */
export function GlobalAmbientPlayer() {
  const routeApi = getRouteApi('__root__')
  const navigate = routeApi.useNavigate()
  const location = useLocation()
  const searchParams = routeApi.useSearch()

  const selectedSoundId = (searchParams.ambientSound ?? 'none') as AmbientSoundId
  const volume = searchParams.ambientVolume ?? 50

  const managerRef = useRef<AmbientSoundManager | null>(null)

  // 初期化
  useEffect(() => {
    managerRef.current = new AmbientSoundManager()

    return () => {
      managerRef.current?.dispose()
      managerRef.current = null
    }
  }, [])

  // selectedSoundIdが変更されたら自動的に再生
  useEffect(() => {
    if (!managerRef.current) return

    if (selectedSoundId === 'none') {
      managerRef.current.stop()
    } else {
      managerRef.current.play(selectedSoundId)
    }
  }, [selectedSoundId])

  // volumeが変更されたら音量を更新
  useEffect(() => {
    if (!managerRef.current) return
    managerRef.current.setVolume(volume / 100)
  }, [volume])

  const handleSoundChange = (soundId: AmbientSoundId) => {
    navigate({
      to: location.pathname,
      search: (prev) => ({
        ...prev,
        ambientSound: soundId as SearchParams['ambientSound'],
      }),
    })
  }

  const handleVolumeChange = (value: number) => {
    navigate({
      to: location.pathname,
      search: (prev) => ({
        ...prev,
        ambientVolume: value,
      }),
    })
  }

  const isPlaying = selectedSoundId !== 'none'

  return (
    <Menu shadow="md" width={280} position="bottom-end" closeOnItemClick={false}>
      <Menu.Target>
        <ActionIcon
          variant={isPlaying ? 'filled' : 'subtle'}
          color={isPlaying ? 'blue' : 'gray'}
          size="lg"
          aria-label="環境音"
        >
          {isPlaying ? <IconMusic size={20} /> : <IconMusicOff size={20} />}
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>環境音を選択</Menu.Label>

        {AMBIENT_SOUNDS.map((sound) => (
          <Menu.Item
            key={sound.id}
            onClick={() => handleSoundChange(sound.id)}
            color={selectedSoundId === sound.id ? 'blue' : undefined}
            bg={selectedSoundId === sound.id ? 'var(--mantine-color-blue-light)' : undefined}
          >
            {sound.name}
          </Menu.Item>
        ))}

        <Menu.Divider />
        <Stack gap="xs" p="xs">
          <Text size="xs" fw={500}>
            音量調整
          </Text>
          <Text size="xs" c="dimmed">
            {volume}%
          </Text>
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
            disabled={selectedSoundId === 'none'}
          />
        </Stack>
      </Menu.Dropdown>
    </Menu>
  )
}

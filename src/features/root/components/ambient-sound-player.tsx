import { Group, Select, Slider, Stack, Text } from '@mantine/core'
import { IconMusic, IconVolume } from '@tabler/icons-react'
import { useEffect, useRef, useState } from 'react'
import {
  AMBIENT_SOUNDS,
  type AmbientSound,
  AmbientSoundManager,
} from '~/features/root/utils/ambient-sound'

type AmbientSoundPlayerProps = {
  shouldStop?: boolean
  onStopped?: () => void
}

export function AmbientSoundPlayer({ shouldStop = false, onStopped }: AmbientSoundPlayerProps) {
  const [selectedSoundId, setSelectedSoundId] = useState<AmbientSound['id']>('none')
  const [volume, setVolume] = useState(50)

  const managerRef = useRef<AmbientSoundManager | null>(null)

  useEffect(() => {
    managerRef.current = new AmbientSoundManager()

    return () => {
      managerRef.current?.dispose()
      managerRef.current = null
    }
  }, [])

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

  useEffect(() => {
    if (!managerRef.current) {
      return
    }

    managerRef.current.setVolume(volume / 100)
  }, [volume])

  useEffect(() => {
    if (shouldStop && managerRef.current) {
      managerRef.current.stop()

      setSelectedSoundId('none')
      onStopped?.()
    }
  }, [shouldStop, onStopped])

  const handleSoundChange = (value: AmbientSound['id'] | null) => {
    if (!value) {
      return
    }

    setSelectedSoundId(value)
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
        onChange={(value) => handleSoundChange(value as AmbientSound['id'] | null)}
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
            onChange={(value) => setVolume(value)}
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

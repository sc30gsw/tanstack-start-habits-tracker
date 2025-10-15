import { Group, Select, Slider, Stack, Text } from '@mantine/core'
import { IconMusic, IconVolume } from '@tabler/icons-react'
import { AMBIENT_SOUNDS } from '~/features/root/utils/ambient-sound'
import { AmbientSoundController } from './ambient-sound-controller'

export function AmbientSoundPlayer() {
  return (
    <AmbientSoundController>
      {({ selectedSoundId, volume, handleSoundChange, handleVolumeChange }) => {
        const selectedSound = AMBIENT_SOUNDS.find((s) => s.id === selectedSoundId)
        const SelectedIcon = selectedSound?.icon

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
              onChange={(value) => value && handleSoundChange(value as any)}
              size="sm"
              leftSection={
                SelectedIcon && (
                  <SelectedIcon
                    size={18}
                    color={`var(--mantine-color-${selectedSound?.color}-6)`}
                  />
                )
              }
              renderOption={({ option }) => {
                const sound = AMBIENT_SOUNDS.find((s) => s.id === option.value)

                if (!sound) {
                  return option.label
                }

                const Icon = sound.icon
                return (
                  <Group gap="xs">
                    <Icon size={18} color={`var(--mantine-color-${sound.color}-6)`} />
                    <Text>{sound.name}</Text>
                  </Group>
                )
              }}
            />

            <Stack
              gap="xs"
              style={{
                visibility: selectedSoundId !== 'none' ? 'visible' : 'hidden',
                height: selectedSoundId !== 'none' ? 'auto' : 0,
                overflow: 'hidden',
              }}
            >
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
          </Stack>
        )
      }}
    </AmbientSoundController>
  )
}

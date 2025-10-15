import { ActionIcon, Menu, Slider, Stack, Text } from '@mantine/core'
import { IconMusic, IconMusicOff } from '@tabler/icons-react'
import { AMBIENT_SOUNDS } from '~/features/root/utils/ambient-sound'
import { AmbientSoundController } from './ambient-sound-controller'

/**
 * グローバル環境音プレイヤー
 * ヘッダーに配置し、どのページからでも環境音を再生できるようにする
 */
export function GlobalAmbientPlayer() {
  return (
    <AmbientSoundController>
      {({ selectedSoundId, volume, handleSoundChange, handleVolumeChange }) => {
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
      }}
    </AmbientSoundController>
  )
}

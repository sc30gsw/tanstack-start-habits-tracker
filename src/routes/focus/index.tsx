import {
  ActionIcon,
  Card,
  Container,
  Grid,
  Group,
  Paper,
  Slider,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { IconPlayerPause, IconPlayerPlay, IconVolume, IconVolumeOff } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import {
  AMBIENT_SOUNDS,
  AmbientSoundManager,
  type AmbientSound,
} from '~/features/root/utils/ambient-sound'

export const Route = createFileRoute('/focus/')({
  component: RouteComponent,
})

function RouteComponent() {
  const managerRef = useRef<AmbientSoundManager | null>(null)
  const [selectedSoundId, setSelectedSoundId] = useState<AmbientSound['id']>('none')
  const [volume, setVolume] = useState(50)

  // マネージャーの初期化
  useEffect(() => {
    managerRef.current = new AmbientSoundManager()

    return () => {
      managerRef.current?.dispose()
    }
  }, [])

  const handleSoundSelect = (soundId: AmbientSound['id']) => {
    setSelectedSoundId(soundId)

    if (soundId === 'none') {
      managerRef.current?.stop()
    } else {
      managerRef.current?.play(soundId)
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    managerRef.current?.setVolume(newVolume / 100)
  }

  const isPlaying = selectedSoundId !== 'none'

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="xs">
            Focus Zone
          </Title>
          <Text c="dimmed" size="lg">
            集中力を高める環境音で、作業効率をアップ
          </Text>
        </div>

        {/* 環境音カード */}
        <div>
          <Text size="lg" fw={500} mb="md">
            環境音を選択
          </Text>
          <Grid>
            {AMBIENT_SOUNDS.filter((sound) => sound.id !== 'none').map((sound) => {
              const Icon = sound.icon
              const isSelected = selectedSoundId === sound.id
              const isCurrentlyPlaying = isSelected && isPlaying

              return (
                <Grid.Col key={sound.id} span={{ base: 12, xs: 6, sm: 4, md: 3 }}>
                  <Card
                    padding="lg"
                    radius="md"
                    withBorder
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      borderColor: isSelected ? `var(--mantine-color-${sound.color}-6)` : undefined,
                      borderWidth: isSelected ? 2 : 1,
                      backgroundColor: isSelected
                        ? `var(--mantine-color-${sound.color}-light)`
                        : undefined,
                    }}
                    onClick={() => handleSoundSelect(isSelected ? 'none' : sound.id)}
                  >
                    <Stack gap="md" align="center">
                      <div
                        style={{
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <div
                          style={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            backgroundColor: `var(--mantine-color-${sound.color}-1)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: isSelected
                              ? `2px solid var(--mantine-color-${sound.color}-6)`
                              : '2px solid transparent',
                          }}
                        >
                          <Icon size={32} color={`var(--mantine-color-${sound.color}-6)`} />
                        </div>

                        {/* 再生インジケーター */}
                        {isCurrentlyPlaying && (
                          <ActionIcon
                            size="sm"
                            radius="xl"
                            color={sound.color}
                            variant="filled"
                            style={{
                              position: 'absolute',
                              bottom: -4,
                              right: -4,
                            }}
                          >
                            <IconPlayerPlay size={12} />
                          </ActionIcon>
                        )}
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <Text fw={500} size="sm">
                          {sound.name}
                        </Text>
                        {isCurrentlyPlaying && (
                          <Text size="xs" c={sound.color} fw={500}>
                            再生中
                          </Text>
                        )}
                      </div>
                    </Stack>
                  </Card>
                </Grid.Col>
              )
            })}
          </Grid>
        </div>

        {/* 音量コントロール */}
        <Paper p="xl" radius="md" withBorder>
          <Stack gap="lg">
            <Group justify="space-between">
              <Group gap="xs">
                {volume === 0 ? (
                  <IconVolumeOff size={24} color="var(--mantine-color-gray-6)" />
                ) : (
                  <IconVolume size={24} color="var(--mantine-color-blue-6)" />
                )}
                <Text fw={500} size="lg">
                  音量
                </Text>
              </Group>
              <Text size="xl" fw={700} c="blue">
                {volume}%
              </Text>
            </Group>

            <Slider
              value={volume}
              onChange={handleVolumeChange}
              min={0}
              max={100}
              step={5}
              size="lg"
              color="blue"
              marks={[
                { value: 0, label: '0%' },
                { value: 25, label: '25%' },
                { value: 50, label: '50%' },
                { value: 75, label: '75%' },
                { value: 100, label: '100%' },
              ]}
              disabled={!isPlaying}
            />
          </Stack>
        </Paper>

        {/* 停止ボタン */}
        {isPlaying && (
          <Paper p="md" radius="md" withBorder bg="blue.0">
            <Group justify="space-between">
              <Group gap="xs">
                <IconPlayerPlay size={20} color="var(--mantine-color-blue-6)" />
                <Text fw={500}>
                  {AMBIENT_SOUNDS.find((s) => s.id === selectedSoundId)?.name} を再生中
                </Text>
              </Group>
              <ActionIcon
                size="lg"
                variant="filled"
                color="red"
                onClick={() => handleSoundSelect('none')}
              >
                <IconPlayerPause size={20} />
              </ActionIcon>
            </Group>
          </Paper>
        )}

        {!isPlaying && (
          <Paper p="xl" radius="md" bg="gray.0" style={{ textAlign: 'center' }}>
            <Text c="dimmed" size="sm">
              環境音を選択して再生を開始してください
            </Text>
          </Paper>
        )}
      </Stack>
    </Container>
  )
}

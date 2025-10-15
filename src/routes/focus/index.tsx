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
  Tooltip,
} from '@mantine/core'
import {
  IconCircleX,
  IconPlayerPause,
  IconPlayerPlay,
  IconVolume,
  IconVolumeOff,
} from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useId, useRef, useState } from 'react'
import { filter, map, pipe } from 'remeda'
import { z } from 'zod/v4'
import {
  AMBIENT_SOUNDS,
  type AmbientSound,
  AmbientSoundManager,
} from '~/features/root/utils/ambient-sound'

export const Route = createFileRoute('/focus/')({
  validateSearch: z.object({
    soundId: z
      .enum([
        'none',
        'rain',
        'thunder-rain',
        'wave',
        'river',
        'waterfall',
        'bonfire',
        'morning-bird',
        'cafe',
        'countryside',
        'harbor',
      ])
      .optional()
      .catch('none'),
    volume: z.number().min(0).max(100).optional().catch(50),
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const managerRef = useRef<AmbientSoundManager | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioControlPaperId = useId()

  const navigate = Route.useNavigate()
  const { soundId, volume } = Route.useSearch()

  useEffect(() => {
    managerRef.current = new AmbientSoundManager()

    return () => {
      managerRef.current?.dispose()
    }
  }, [])

  const handleSoundSelect = (soundId: AmbientSound['id']) => {
    navigate({
      search: (prev) => ({
        ...prev,
        soundId,
      }),
      hash: soundId,
    })

    if (soundId === 'none') {
      managerRef.current?.stop()
      setIsPlaying(false)
    } else {
      managerRef.current?.play(soundId)
      setIsPlaying(true)
    }
  }

  const handlePlayPause = () => {
    if (!soundId || soundId === 'none') {
      return
    }

    if (isPlaying) {
      managerRef.current?.stop()
      setIsPlaying(false)
    } else {
      managerRef.current?.play(soundId)
      setIsPlaying(true)
    }
  }

  const handleClearSelection = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        soundId: 'none',
      }),
      hash: 'none',
    })

    managerRef.current?.stop()
    setIsPlaying(false)
  }

  const handleVolumeChange = (newVolume: number) => {
    navigate({
      search: (prev) => ({
        ...prev,
        volume: newVolume,
      }),
      hash: audioControlPaperId,
    })

    managerRef.current?.setVolume(newVolume / 100)
  }

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

        <div>
          <Text size="lg" fw={500} mb="md">
            環境音を選択
          </Text>
          <Grid>
            {pipe(
              AMBIENT_SOUNDS,
              filter((sound) => sound.id !== 'none'),
              map((sound) => {
                const Icon = sound.icon
                const isSelected = soundId === sound.id
                const isCurrentlyPlaying = isSelected && isPlaying

                return (
                  <Grid.Col key={sound.id} span={{ base: 12, xs: 6, sm: 4, md: 3 }}>
                    <Card
                      id={sound.id}
                      padding="lg"
                      radius="md"
                      withBorder
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        borderColor: isSelected
                          ? `var(--mantine-color-${sound.color}-6)`
                          : undefined,
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
                          <ActionIcon
                            size="sm"
                            radius="xl"
                            color={sound.color}
                            variant="filled"
                            style={{
                              position: 'absolute',
                              bottom: -4,
                              right: -4,
                              visibility: isCurrentlyPlaying ? 'visible' : 'hidden',
                            }}
                          >
                            <IconPlayerPlay size={12} />
                          </ActionIcon>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                          <Text fw={500} size="sm">
                            {sound.name}
                          </Text>
                          <Text
                            size="xs"
                            c={sound.color}
                            fw={500}
                            style={{
                              visibility: isCurrentlyPlaying ? 'visible' : 'hidden',
                              height: isCurrentlyPlaying ? 'auto' : 0,
                            }}
                          >
                            再生中
                          </Text>
                        </div>
                      </Stack>
                    </Card>
                  </Grid.Col>
                )
              }),
            )}
          </Grid>
        </div>

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

        <Paper
          id={audioControlPaperId}
          p="md"
          radius="md"
          withBorder
          bg={isPlaying ? 'blue.0' : 'gray.0'}
        >
          <Group justify="space-between">
            <Group gap="xs">
              {isPlaying ? (
                <IconVolume size={20} color="var(--mantine-color-blue-6)" />
              ) : (
                <IconVolumeOff size={20} color="var(--mantine-color-gray-6)" />
              )}
              <Text fw={500}>
                {soundId && soundId !== 'none'
                  ? `${AMBIENT_SOUNDS.find((sound) => sound.id === soundId)?.name}${isPlaying ? ' を再生中' : ''}`
                  : '環境音を選択して再生を開始してください'}
              </Text>
            </Group>
            <Group gap="xs">
              {soundId && soundId !== 'none' && (
                <>
                  <Tooltip label={isPlaying ? '停止' : '再生'}>
                    <ActionIcon
                      size="lg"
                      variant="filled"
                      color={isPlaying ? 'red' : 'blue'}
                      onClick={handlePlayPause}
                    >
                      {isPlaying ? <IconPlayerPause size={20} /> : <IconPlayerPlay size={20} />}
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="選択を解除">
                    <ActionIcon
                      size="lg"
                      variant="light"
                      color="red"
                      onClick={handleClearSelection}
                    >
                      <IconCircleX size={20} />
                    </ActionIcon>
                  </Tooltip>
                </>
              )}
            </Group>
          </Group>
        </Paper>
      </Stack>
    </Container>
  )
}

import {
  ActionIcon,
  Button,
  CopyButton,
  Group,
  Modal,
  Stack,
  Text,
  Tooltip,
  useComputedColorScheme,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconCopy, IconShare } from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { filter, join, map, pipe } from 'remeda'
import type { ShareDataResponse } from '~/features/home/types/share'

export function ShareHabitsModal({
  shareDataResponse,
}: Record<'shareDataResponse', ShareDataResponse>) {
  const routeApi = getRouteApi('/')
  const navigate = routeApi.useNavigate()
  const searchParams = routeApi.useSearch()
  const open = searchParams.open

  const computedColorScheme = useComputedColorScheme('light')
  const titleColor = computedColorScheme === 'dark' ? 'gray.1' : 'dark.8'
  const textColor = 'gray.6'

  if (shareDataResponse.error || !shareDataResponse.data) {
    return (
      <Modal
        opened={open ?? false}
        onClose={() => {
          navigate({
            search: (prev) => ({
              ...prev,
              open: false,
            }),
          })
        }}
        title={
          <Text size="lg" fw={600} c={titleColor}>
            <IconShare size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            習慣を共有
          </Text>
        }
        size="lg"
      >
        <Text c="red">データの取得中にエラーが発生しました: {shareDataResponse.error}</Text>
      </Modal>
    )
  }

  const today = dayjs().format('YYYY-MM-DD')
  const shareData = shareDataResponse.data

  // 共有テキストの生成
  const shareText = (() => {
    if (shareData.length === 0) {
      return '今日は完了した習慣がありませんでした :sweat_smile:'
    }

    const habitTexts = pipe(
      shareData,
      map((habit) => {
        // 習慣名を親アイテムとして設定
        const habitLine = `• ${habit.habitName}`

        if (!habit.notes || habit.notes.length === 0) {
          return habitLine
        }

        // ノートを習慣の子要素としてインデントしてネスト
        const noteLines = pipe(
          habit.notes,
          filter((note): note is string => note !== null && note !== ''),
          map((note) =>
            pipe(
              note.split('\n'),
              map((line) => `    ◦ ${line.replace(/^[・\-\s]+/, '')}`), // インデントでネスト表現
              join('\n'),
            ),
          ),
          join('\n'),
        )

        return `${habitLine}\n${noteLines}`
      }),
      join('\n'),
    )

    return habitTexts.trim()
  })()

  const handleCopySuccess = () => {
    notifications.show({
      title: '✅ コピー成功',
      message: 'クリップボードにコピーしました',
      color: 'green',
    })
  }

  // 個別習慣のテキスト生成
  const generateHabitText = (habit: (typeof shareData)[number]) => {
    const habitLine = `• ${habit.habitName}`

    if (!habit.notes || habit.notes.length === 0) {
      return habitLine
    }

    const noteLines = pipe(
      habit.notes,
      filter((note): note is string => note !== null && note !== ''),
      map((note) =>
        pipe(
          note.split('\n'),
          map((line) => `    ◦ ${line.replace(/^[・\-\s]+/, '')}`),
          join('\n'),
        ),
      ),
      join('\n'),
    )

    return `${habitLine}\n${noteLines}`
  }

  return (
    <>
      <style>
        {`
          .habit-card-group:hover .habit-copy-button {
            opacity: 1 !important;
          }
        `}
      </style>
      <Modal
        opened={open ?? false}
        onClose={() => {
          navigate({
            search: (prev) => ({
              ...prev,
              open: false,
            }),
          })
        }}
        title={
          <Group gap="xs" align="center">
            <IconShare size={20} color="var(--mantine-color-blue-6)" />
            <Text size="xl" fw={600} c={titleColor}>
              習慣を共有
            </Text>
          </Group>
        }
        size="lg"
      >
        <Stack gap="lg">
          <Text size="lg" c={titleColor} fw={600}>
            {dayjs(today).format('YYYY年MM月DD日')}の完了した習慣
          </Text>

          {shareData.length === 0 ? (
            <Text c="dimmed" fs="italic">
              完了した習慣はありません
            </Text>
          ) : (
            <Stack gap="md">
              {shareData.map((habit, index) => {
                const habitText = generateHabitText(habit)
                return (
                  <div
                    key={index}
                    className="habit-card-group"
                    style={{
                      position: 'relative',
                      background:
                        computedColorScheme === 'dark'
                          ? 'linear-gradient(135deg, rgba(34, 139, 230, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)'
                          : 'linear-gradient(135deg, rgba(34, 139, 230, 0.05) 0%, rgba(20, 184, 166, 0.05) 100%)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      border:
                        computedColorScheme === 'dark'
                          ? '1px solid var(--mantine-color-dark-4)'
                          : '1px solid var(--mantine-color-gray-2)',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    <CopyButton value={habitText} timeout={2000}>
                      {({ copied, copy }) => (
                        <Tooltip
                          label={copied ? 'コピーしました' : 'コピー'}
                          withArrow
                          position="left"
                        >
                          <ActionIcon
                            variant="subtle"
                            color={copied ? 'teal' : 'gray'}
                            onClick={copy}
                            className="habit-copy-button"
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              opacity: 0,
                              transition: 'opacity 0.2s ease',
                            }}
                          >
                            {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>

                    <Text fw={600} c={titleColor} size="md">
                      • {habit.habitName}
                    </Text>
                    {habit.notes && habit.notes.length > 0 && (
                      <Stack gap={2} mt={8} ml={16}>
                        {habit.notes
                          .filter((note): note is string => note !== null && note !== '')
                          .map((note, noteIndex) =>
                            note.split('\n').map((line, lineIndex) => (
                              <Text key={`${noteIndex}-${lineIndex}`} size="sm" c={textColor}>
                                ◦ {line.replace(/^[・\-\s]+/, '')}
                              </Text>
                            )),
                          )}
                      </Stack>
                    )}
                  </div>
                )
              })}
            </Stack>
          )}

          <Stack gap="md" mt="lg">
            <Text size="md" c={titleColor} fw={600}>
              共有テキストプレビュー
            </Text>
            <Text
              size="sm"
              c={titleColor}
              style={{
                whiteSpace: 'pre-wrap',
                backgroundColor:
                  computedColorScheme === 'dark'
                    ? 'var(--mantine-color-dark-6)'
                    : 'var(--mantine-color-gray-0)',
                padding: '16px',
                borderRadius: '8px',
                border:
                  computedColorScheme === 'dark'
                    ? '1px solid var(--mantine-color-dark-4)'
                    : '1px solid var(--mantine-color-gray-3)',
                maxHeight: '200px',
                overflowY: 'auto',
                boxShadow:
                  computedColorScheme === 'dark'
                    ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                    : '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              {shareText}
            </Text>
          </Stack>

          <CopyButton value={shareText} timeout={2000}>
            {({ copied, copy }) => (
              <Tooltip
                label={copied ? 'コピー済み' : 'クリップボードにコピー'}
                withArrow
                position="right"
              >
                <Button
                  variant={copied ? 'filled' : 'gradient'}
                  gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                  color={copied ? 'teal' : undefined}
                  onClick={() => {
                    copy()
                    handleCopySuccess()
                  }}
                  leftSection={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                  fullWidth
                  styles={{
                    root: {
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      },
                    },
                  }}
                >
                  {copied ? 'コピー済み' : 'クリップボードにコピー'}
                </Button>
              </Tooltip>
            )}
          </CopyButton>
        </Stack>
      </Modal>
    </>
  )
}

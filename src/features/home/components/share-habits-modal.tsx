import {
  ActionIcon,
  Box,
  Button,
  Checkbox,
  CopyButton,
  Group,
  Modal,
  Stack,
  Text,
  Tooltip,
  useComputedColorScheme,
} from '@mantine/core'
import { useListState } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconCopy, IconShare } from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { filter, join, map, pipe } from 'remeda'
import { RichTextDisplay } from '~/components/ui/rich-text-editor/rich-text-display'
import { htmlToShareText } from '~/utils/html-helpers'

export function ShareHabitsModal({ copyId }: Record<'copyId', string>) {
  const routeApi = getRouteApi('/')
  const navigate = routeApi.useNavigate()
  const searchParams = routeApi.useSearch()
  const open = searchParams.open

  const computedColorScheme = useComputedColorScheme('light')
  const titleColor = computedColorScheme === 'dark' ? 'gray.1' : 'dark.8'

  const { shareData: shareDataResponse } = routeApi.useLoaderData()

  const initialHabitSelection = (shareDataResponse.data || []).map((habit) => ({
    ...habit,
    selected: true,
  }))

  const [habitSelection, habitSelectionHandlers] = useListState(initialHabitSelection)

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
            hash: copyId,
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

  const selectedHabits = habitSelection.filter((h) => h.selected)

  const totalDuration = selectedHabits.reduce((sum, habit) => sum + (habit.duration ?? 0), 0)

  const formatDuration = (minutes: number) => {
    if (minutes === 0) {
      return '0分'
    }

    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours === 0) {
      return `${mins}分`
    }

    if (mins === 0) {
      return `${hours}時間（${minutes}分）`
    }

    return `${hours}時間${mins}分（${minutes}分）`
  }

  const totalDurationText = formatDuration(totalDuration)

  const shareText = (() => {
    if (selectedHabits.length === 0) {
      return '今日は完了した習慣がありませんでした :sweat_smile:'
    }

    const habitTexts = pipe(
      selectedHabits,
      map((habit) => {
        const notHaveNotes =
          !habit.notes || habit.notes.length === 0 || habit.notes.every((note) => !note)

        if (notHaveNotes) {
          return `• ${habit.habitName} ${habit.duration}分`
        }

        const habitLine = `• ${habit.habitName} ${habit.duration}分`
        const noteLines = pipe(
          habit.notes,
          filter((note): note is string => note !== null && note !== ''),
          map((note) => {
            const plainText = htmlToShareText(note)

            return plainText
              .split('\n')
              .filter((line) => line.trim())
              .map((line) => `　${line}`)
              .join('\n')
          }),
          join('\n'),
        )

        return noteLines ? `${habitLine}\n${noteLines}` : habitLine
      }),
      join('\n'),
    )

    return `${habitTexts.trim()}\n\n合計: ${totalDurationText}`
  })()

  const shareHtml = (() => {
    if (selectedHabits.length === 0) {
      return '<p style="color: var(--mantine-color-dimmed);">共有する習慣を選択してください</p>'
    }

    const habitHtmls = pipe(
      selectedHabits,
      map((habit) => {
        const notHaveNotes =
          !habit.notes || habit.notes.length === 0 || habit.notes.every((note) => !note)

        if (notHaveNotes) {
          return `<li><strong>${habit.habitName} ${habit.duration}分</strong></li>`
        }

        const noteHtmls = pipe(
          habit.notes,
          filter((note): note is string => note !== null && note !== ''),
          map((note) => note),
          join(''),
        )

        const wrappedNotes =
          noteHtmls.trim().startsWith('<ul>') || noteHtmls.trim().startsWith('<ol>')
            ? noteHtmls
            : `<div>${noteHtmls}</div>`

        return `<li><strong>${habit.habitName} ${habit.duration}分</strong>${wrappedNotes}</li>`
      }),
      join(''),
    )

    return `<ul>${habitHtmls}</ul><p><strong>合計: ${totalDurationText}</strong></p>`
  })()

  const handleCopySuccess = () => {
    notifications.show({
      title: '✅ コピー成功',
      message: 'クリップボードにコピーしました',
      color: 'green',
    })
  }

  const generateHabitText = (habit: (typeof shareData)[number]) => {
    const notHaveNotes =
      !habit.notes || habit.notes.length === 0 || habit.notes.every((note) => !note)

    if (notHaveNotes) {
      return `• ${habit.habitName} ${habit.duration}分`
    }

    const habitLine = `• ${habit.habitName} ${habit.duration}分`

    const noteLines = pipe(
      habit.notes,
      filter((note): note is string => note !== null && note !== ''),
      map((note) => {
        const plainText = htmlToShareText(note)

        return plainText
          .split('\n')
          .filter((line) => line.trim())
          .map((line) => `　${line}`)
          .join('\n')
      }),
      join('\n'),
    )

    return noteLines ? `${habitLine}\n${noteLines}` : habitLine
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
          <Group justify="space-between" align="center">
            <Text size="lg" c={titleColor} fw={600}>
              {dayjs(today).format('YYYY年MM月DD日')}の完了した習慣
            </Text>
            {shareData.length > 0 && (
              <Text size="md" c="blue.6" fw={600}>
                合計: {totalDurationText}
              </Text>
            )}
          </Group>

          {shareData.length === 0 ? (
            <Text c="dimmed" fs="italic">
              完了した習慣はありません
            </Text>
          ) : (
            <Stack gap="md">
              {habitSelection.map((habit, index) => {
                const habitText = generateHabitText(habit)
                return (
                  <Tooltip
                    key={habit.habitId}
                    label={habit.selected ? 'クリックで共有から除外' : 'クリックで共有に含める'}
                    withArrow
                    position="top"
                  >
                    <Box
                      className="habit-card-group"
                      component="button"
                      type="button"
                      style={{
                        all: 'unset',
                        display: 'block',
                        position: 'relative',
                        background: habit.selected
                          ? computedColorScheme === 'dark'
                            ? 'linear-gradient(135deg, rgba(34, 139, 230, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)'
                            : 'linear-gradient(135deg, rgba(34, 139, 230, 0.05) 0%, rgba(20, 184, 166, 0.05) 100%)'
                          : computedColorScheme === 'dark'
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.02)',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        border: habit.selected
                          ? computedColorScheme === 'dark'
                            ? '2px solid var(--mantine-color-blue-6)'
                            : '2px solid var(--mantine-color-blue-5)'
                          : computedColorScheme === 'dark'
                            ? '1px solid var(--mantine-color-dark-4)'
                            : '1px solid var(--mantine-color-gray-2)',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                        opacity: habit.selected ? 1 : 0.6,
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        overflow: 'hidden',
                      }}
                      onClick={() => {
                        habitSelectionHandlers.setItemProp(index, 'selected', !habit.selected)
                      }}
                    >
                      <Group wrap="nowrap" align="center" gap="sm" style={{ maxWidth: '100%' }}>
                        <Checkbox
                          checked={habit.selected}
                          onChange={() => {
                            habitSelectionHandlers.setItemProp(index, 'selected', !habit.selected)
                          }}
                          size="md"
                          style={{
                            cursor: 'pointer',
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />

                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Group justify="space-between" align="flex-start" wrap="nowrap">
                            <Stack gap={0} style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                              <div
                                style={{
                                  fontWeight: 600,
                                  fontSize: '14px',
                                  wordBreak: 'break-word',
                                  overflowWrap: 'break-word',
                                }}
                              >
                                <RichTextDisplay
                                  html={`<ul><li>${habit.habitName} ${habit.duration}分</li></ul>`}
                                />
                              </div>
                              {habit.notes && habit.notes.length > 0 && (
                                <Box
                                  ml={16}
                                  style={{
                                    wordBreak: 'break-word',
                                    overflowWrap: 'break-word',
                                    maxWidth: '100%',
                                  }}
                                >
                                  {habit.notes
                                    .filter((note): note is string => note !== null && note !== '')
                                    .map((note, noteIndex) => (
                                      <RichTextDisplay key={noteIndex} html={note} />
                                    ))}
                                </Box>
                              )}
                            </Stack>

                            <CopyButton value={habitText} timeout={2000}>
                              {({ copied, copy }) => (
                                <Tooltip
                                  label={copied ? 'コピーしました' : 'この習慣をコピー'}
                                  withArrow
                                  position="left"
                                >
                                  <ActionIcon
                                    variant="subtle"
                                    color={copied ? 'teal' : 'gray'}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      copy()
                                    }}
                                    className="habit-copy-button"
                                    style={{
                                      opacity: 0,
                                      transition: 'opacity 0.2s ease',
                                    }}
                                  >
                                    {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                                  </ActionIcon>
                                </Tooltip>
                              )}
                            </CopyButton>
                          </Group>
                        </Box>
                      </Group>
                    </Box>
                  </Tooltip>
                )
              })}
            </Stack>
          )}

          <Stack gap="md" mt="lg">
            <Text size="md" c={titleColor} fw={600}>
              共有テキストプレビュー
            </Text>
            <Box
              style={{
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
              <RichTextDisplay html={shareHtml} />
            </Box>
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

import {
  ActionIcon,
  Box,
  CopyButton,
  FloatingIndicator,
  Group,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
  useComputedColorScheme,
} from '@mantine/core'
import { useListState } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import type { InferSelectModel } from 'drizzle-orm'
import { useState } from 'react'
import { filter, join, map, pipe } from 'remeda'
import { RichTextDisplay } from '~/components/ui/rich-text-editor/rich-text-display'
import type { habits } from '~/db/schema'
import { formatDuration } from '~/features/habits/utils/time-utils'
import type { shareDto } from '~/features/home/server/share-functions'
import { htmlToShareText } from '~/utils/html-helpers'

type ShareHabitData = NonNullable<
  Awaited<ReturnType<typeof shareDto.getCompletedHabitsForShare>>['data']
>

type ShareHabitsModalContentsProps = {
  shareHabits: ShareHabitData
}

export function ShareHabitsModalContents({ shareHabits }: ShareHabitsModalContentsProps) {
  return <ModalMainStack shareHabits={shareHabits} />
}

function ModalMainStack({ shareHabits }: ShareHabitsModalContentsProps) {
  const routeApi = getRouteApi('/')
  const search = routeApi.useSearch()
  const selectedDate = search.selectedDate ?? dayjs().format('YYYY-MM-DD')

  const totalDuration = shareHabits.reduce((sum, habit) => sum + (habit.duration ?? 0), 0)
  const totalDurationText = formatDuration(totalDuration)

  const computedColorScheme = useComputedColorScheme('light')
  const titleColor = computedColorScheme === 'dark' ? 'gray.1' : 'dark.8'

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Text size="lg" c={titleColor} fw={600}>
          {dayjs(selectedDate).format('YYYY年MM月DD日')}の完了した習慣
        </Text>
        {shareHabits.length > 0 && (
          <Text size="md" c="blue.6" fw={600}>
            合計: {totalDurationText}
          </Text>
        )}
      </Group>

      <TabContainer shareHabits={shareHabits} />
    </Stack>
  )
}

function TabContainer({ shareHabits }: ShareHabitsModalContentsProps) {
  const [activeTab, setActiveTab] = useState<'cards' | 'preview'>('cards')

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab)
  }

  return (
    <>
      <TabNavigation activeTab={activeTab} onChange={handleTabChange} />
      <HabitSelectionStack activeTab={activeTab} shareData={shareHabits} />
    </>
  )
}

type HabitSelectionStackProps = {
  activeTab: 'cards' | 'preview'
  shareData: ShareHabitData
}

function HabitSelectionStack({ activeTab, shareData }: HabitSelectionStackProps) {
  const computedColorScheme = useComputedColorScheme('light')
  const initialHabitSelection = shareData.map((habit) => ({
    ...habit,
    selected: true,
  }))

  const [habitSelection, habitSelectionHandlers] = useListState(initialHabitSelection)

  const [hoveredCopyButton, setHoveredCopyButton] = useState<
    InferSelectModel<typeof habits>['id'] | null
  >(null)

  const generateHabitText = (habit: (typeof shareData)[number]) => {
    const notHaveNotes =
      !habit.notes || habit.notes.length === 0 || habit.notes.every((note) => !note)

    const durationText = formatDuration(habit.duration ?? 0)

    if (notHaveNotes) {
      return `• ${habit.habitName} ${durationText}`
    }

    const habitLine = `• ${habit.habitName} ${durationText}`

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

  return activeTab === 'cards' ? (
    shareData.length === 0 ? (
      <Text c="dimmed" fs="italic">
        完了した習慣はありません
      </Text>
    ) : (
      <Stack gap="md">
        {habitSelection.map((habit, index) => {
          const habitText = generateHabitText(habit)
          const isHoveringCopyButton = hoveredCopyButton === habit.habitId

          return (
            <Tooltip
              key={habit.habitId}
              label={
                habit.selected
                  ? 'クリックで共有プレビューから除外'
                  : 'クリックで共有プレビューに含める'
              }
              withArrow
              position="top"
              className="habit-card-tooltip"
              disabled={isHoveringCopyButton}
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
                  maxHeight: '200px',
                  overflow: 'auto',
                }}
                onClick={() => {
                  habitSelectionHandlers.setItemProp(index, 'selected', !habit.selected)
                }}
              >
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Stack
                    gap={0}
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '14px',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                      }}
                    >
                      <RichTextDisplay
                        html={`<ul><li>${habit.habitName} ${formatDuration(habit.duration ?? 0)}</li></ul>`}
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
                          onMouseEnter={() => setHoveredCopyButton(habit.habitId)}
                          onMouseLeave={() => setHoveredCopyButton(null)}
                          className="habit-copy-button"
                          style={{
                            opacity: 0,
                            transition: 'opacity 0.2s ease',
                            flexShrink: 0,
                          }}
                        >
                          {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Group>
              </Box>
            </Tooltip>
          )
        })}
      </Stack>
    )
  ) : (
    <PreviewBox habitSelection={habitSelection} />
  )
}

type TabNavigationProps = {
  activeTab: 'cards' | 'preview'
  onChange: (tab: 'cards' | 'preview') => void
}

function TabNavigation({ activeTab, onChange }: TabNavigationProps) {
  const computedColorScheme = useComputedColorScheme('light')

  const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null)
  const [controlsRefs, setControlsRefs] = useState<Record<string, HTMLButtonElement | null>>({})

  const setControlRef = (name: string) => (node: HTMLButtonElement) => {
    controlsRefs[name] = node
    setControlsRefs(controlsRefs)
  }

  return (
    <Box ref={setRootRef} pos="relative">
      <Group
        gap="xs"
        style={{
          backgroundColor:
            computedColorScheme === 'dark'
              ? 'var(--mantine-color-dark-6)'
              : 'var(--mantine-color-gray-0)',
          padding: '4px',
          borderRadius: '8px',
        }}
      >
        <UnstyledButton
          ref={setControlRef('cards')}
          onClick={() => onChange('cards')}
          style={{
            flex: 1,
            padding: '8px 16px',
            borderRadius: '6px',
            color:
              activeTab === 'cards'
                ? computedColorScheme === 'dark'
                  ? 'var(--mantine-color-blue-4)'
                  : 'var(--mantine-color-blue-6)'
                : computedColorScheme === 'dark'
                  ? 'var(--mantine-color-gray-5)'
                  : 'var(--mantine-color-gray-6)',
            fontWeight: activeTab === 'cards' ? 600 : 500,
            transition: 'color 0.2s ease',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          個別習慣
        </UnstyledButton>
        <UnstyledButton
          ref={setControlRef('preview')}
          onClick={() => onChange('preview')}
          style={{
            flex: 1,
            padding: '8px 16px',
            borderRadius: '6px',
            color:
              activeTab === 'preview'
                ? computedColorScheme === 'dark'
                  ? 'var(--mantine-color-blue-4)'
                  : 'var(--mantine-color-blue-6)'
                : computedColorScheme === 'dark'
                  ? 'var(--mantine-color-gray-5)'
                  : 'var(--mantine-color-gray-6)',
            fontWeight: activeTab === 'preview' ? 600 : 500,
            transition: 'color 0.2s ease',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          共有プレビュー
        </UnstyledButton>
        <FloatingIndicator
          target={controlsRefs[activeTab]}
          parent={rootRef}
          style={{
            backgroundColor:
              computedColorScheme === 'dark'
                ? 'rgba(34, 139, 230, 0.15)'
                : 'rgba(34, 139, 230, 0.1)',
            border:
              computedColorScheme === 'dark'
                ? '1px solid var(--mantine-color-blue-6)'
                : '1px solid var(--mantine-color-blue-5)',
            borderRadius: '6px',
          }}
        />
      </Group>
    </Box>
  )
}

type PreviewBoxProps = {
  habitSelection: Array<ShareHabitData[number] & { selected: boolean }>
}

function PreviewBox({ habitSelection }: PreviewBoxProps) {
  const computedColorScheme = useComputedColorScheme('light')

  const selectedHabits = habitSelection.filter((h) => h.selected)
  const totalDuration = selectedHabits.reduce((sum, habit) => sum + (habit.duration ?? 0), 0)
  const totalDurationText = formatDuration(totalDuration)

  const shareText = (() => {
    if (selectedHabits.length === 0) {
      return '今日は完了した習慣がありませんでした。'
    }

    const habitTexts = pipe(
      selectedHabits,
      map((habit) => {
        const notHaveNotes =
          !habit.notes || habit.notes.length === 0 || habit.notes.every((note) => !note)

        const durationText = formatDuration(habit.duration ?? 0)

        if (notHaveNotes) {
          return `• ${habit.habitName} ${durationText}`
        }

        const habitLine = `• ${habit.habitName} ${durationText}`
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

        const durationText = formatDuration(habit.duration ?? 0)

        if (notHaveNotes) {
          return `<li><strong>${habit.habitName} ${durationText}</strong></li>`
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

        return `<li><strong>${habit.habitName} ${durationText}</strong>${wrappedNotes}</li>`
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

  return (
    <Box
      className="preview-box-group"
      style={{
        position: 'relative',
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
        maxHeight: '500px',
        overflowY: 'auto',
        boxShadow:
          computedColorScheme === 'dark'
            ? '0 2px 8px rgba(0, 0, 0, 0.3)'
            : '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <CopyButton value={shareText} timeout={2000}>
        {({ copied, copy }) => (
          <Tooltip
            label={copied ? 'コピーしました' : '共有プレビューをコピー'}
            withArrow
            position="left"
          >
            <ActionIcon
              variant="subtle"
              color={copied ? 'teal' : 'gray'}
              onClick={(e) => {
                e.stopPropagation()
                copy()
                handleCopySuccess()
              }}
              className="preview-copy-button"
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                zIndex: 1,
                opacity: 0,
                transition: 'opacity 0.2s ease',
              }}
            >
              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
            </ActionIcon>
          </Tooltip>
        )}
      </CopyButton>
      <RichTextDisplay html={shareHtml} />
    </Box>
  )
}

import { ActionIcon, Box, Card, Flex, Group, Stack, Text } from '@mantine/core'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'

const WEEK_DAYS = ['日', '月', '火', '水', '木', '金', '土'] as const satisfies readonly string[]

export function CalendarPreview() {
  // 31日分のカレンダーデータ生成
  const calendarDays = Array.from({ length: 31 }).map((_, i) => ({
    day: i + 1,
    records: Math.random() > 0.4 ? generateMockRecords() : [],
  }))

  // モック記録データ生成
  function generateMockRecords() {
    const recordCount = Math.floor(Math.random() * 4) + 1
    const habitNames = ['朝の瞑想', '読書30分', '運動1時間', '日記を書く', '英語学習']
    const colors = ['blue', 'green', 'grape', 'orange', 'pink'] as const

    return Array.from({ length: recordCount }).map((_, i) => ({
      id: `${i}`,
      name: habitNames[i % habitNames.length],
      color: colors[i % colors.length],
    }))
  }

  return (
    <Stack gap="md" style={{ width: '100%' }}>
      {/* ヘッダー */}
      <Group justify="space-between" align="center" mb={4}>
        <ActionIcon variant="subtle" aria-label="前月">
          <IconChevronLeft size={16} />
        </ActionIcon>
        <Text fw={500} c="dimmed">
          2025年01月
        </Text>
        <ActionIcon variant="subtle" aria-label="翌月">
          <IconChevronRight size={16} />
        </ActionIcon>
      </Group>

      {/* 曜日ヘッダー */}
      <Group gap={4} justify="space-between" wrap="nowrap">
        {WEEK_DAYS.map((d, index) => (
          <Text
            key={d}
            size="xs"
            c={index === 0 ? 'red.7' : index === 6 ? 'blue.7' : 'dimmed'}
            style={{
              flex: 1,
              textAlign: 'center',
              fontWeight: index === 0 || index === 6 ? 600 : 400,
            }}
          >
            {d}
          </Text>
        ))}
      </Group>

      {/* 日付グリッド（4週間+α） */}
      <Stack gap={4}>
        {Array.from({ length: 5 }).map((_, weekIndex) => (
          <Group key={weekIndex} gap={4} wrap="nowrap" justify="space-between">
            {Array.from({ length: 7 }).map((_, dayIndex) => {
              const dayNumber = weekIndex * 7 + dayIndex + 1
              const dayData = dayNumber <= 31 ? calendarDays[dayNumber - 1] : null
              const isCurrentMonth = dayNumber <= 31

              if (!dayData) {
                // 空セル（次月の日付）
                return (
                  <Card
                    key={dayIndex}
                    withBorder
                    padding="xs"
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      opacity: 0.35,
                      minWidth: 34,
                      minHeight: '80px',
                      backgroundColor: '#1a1a1a',
                      borderColor: '#2a2a2a',
                    }}
                  >
                    <Text size="sm" fw={500} c="gray.6">
                      {dayNumber - 31}
                    </Text>
                  </Card>
                )
              }

              const hasRecords = dayData.records.length > 0

              return (
                <Card
                  key={dayIndex}
                  withBorder
                  padding="xs"
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    cursor: 'pointer',
                    opacity: isCurrentMonth ? 1 : 0.35,
                    minWidth: 34,
                    minHeight: '80px',
                    backgroundColor: '#1a1a1a',
                    borderColor: hasRecords ? 'var(--mantine-color-blue-6)' : '#2a2a2a',
                    border: hasRecords ? '2px solid var(--mantine-color-blue-6)' : undefined,
                    boxShadow: hasRecords ? '0 0 0 1px var(--mantine-color-blue-6)' : undefined,
                    transition: 'all 0.2s ease',
                  }}
                  styles={{
                    root: {
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                      },
                    },
                  }}
                >
                  <Stack gap={2} align="stretch">
                    <Text size="sm" fw={500} c={hasRecords ? 'blue.6' : 'gray.4'}>
                      {dayData.day}
                    </Text>
                    {hasRecords && (
                      <Stack gap={1} mt={4}>
                        {dayData.records.slice(0, 3).map((record) => (
                          <Flex
                            key={record.id}
                            gap={4}
                            align="center"
                            style={{
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              w={3}
                              h={14}
                              style={{
                                backgroundColor: `var(--mantine-color-${record.color}-6)`,
                                borderRadius: '2px',
                                flexShrink: 0,
                              }}
                            />
                            <Text
                              size="9px"
                              ta="left"
                              c="dimmed"
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                flex: 1,
                              }}
                              title={record.name}
                            >
                              {record.name}
                            </Text>
                          </Flex>
                        ))}
                        {dayData.records.length > 3 && (
                          <Text size="8px" c="dimmed" ta="center">
                            +{dayData.records.length - 3}件
                          </Text>
                        )}
                      </Stack>
                    )}
                  </Stack>
                </Card>
              )
            })}
          </Group>
        ))}
      </Stack>
    </Stack>
  )
}

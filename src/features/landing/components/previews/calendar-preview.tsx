import { Badge, Box, Group, Stack, Text } from '@mantine/core'

const WEEK_DAYS = ['日', '月', '火', '水', '木', '金', '土'] as const satisfies readonly string[]

export function CalendarPreview() {
  const calendarDays = Array.from({ length: 31 }).map((_, i) => ({
    day: i + 1,
    hasRecord: Math.random() > 0.3,
    completionRate: Math.floor(Math.random() * 100),
  }))

  return (
    <Stack gap="lg" style={{ width: '100%' }}>
      {/* ヘッダー */}
      <Group justify="space-between" align="center">
        <Text style={{ color: 'white', fontSize: '1.3rem', fontWeight: 600 }}>2025年1月</Text>
        <Group gap="xs">
          <Badge variant="light" color="blue" size="sm">
            今月
          </Badge>
          <Badge variant="light" color="green" size="sm">
            23日完了
          </Badge>
        </Group>
      </Group>

      {/* カレンダーグリッド */}
      <Box>
        {/* 曜日ヘッダー */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px',
            marginBottom: '12px',
          }}
        >
          {WEEK_DAYS.map((day, index) => (
            <Text
              key={day}
              style={{
                textAlign: 'center',
                color: index === 0 ? '#f59e0b' : index === 6 ? '#4a90e2' : '#666',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            >
              {day}
            </Text>
          ))}
        </Box>

        {/* 日付グリッド */}
        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
          {calendarDays.map((dayData) => (
            <Box
              key={dayData.day}
              style={{
                aspectRatio: '1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: dayData.hasRecord ? '#4a90e2' : '#1a1a1a',
                borderRadius: '8px',
                border: `2px solid ${dayData.hasRecord ? '#4a90e2' : '#2a2a2a'}`,
                color: dayData.hasRecord ? 'white' : '#666',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
              className="calendar-cell"
            >
              <Text style={{ fontSize: '1.1rem', fontWeight: 700 }}>{dayData.day}</Text>
              {dayData.hasRecord && (
                <Box
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    width: '6px',
                    height: '6px',
                    backgroundColor: '#10b981',
                    borderRadius: '50%',
                  }}
                />
              )}
            </Box>
          ))}
        </Box>
      </Box>

      {/* 今日の詳細 */}
      <Box
        style={{
          padding: '1.5rem',
          backgroundColor: '#1a1a1a',
          borderRadius: '12px',
          border: '1px solid #2a2a2a',
        }}
      >
        <Group justify="space-between" mb="md">
          <Text style={{ color: 'white', fontSize: '1.1rem', fontWeight: 600 }}>1月15日の記録</Text>
          <Badge variant="gradient" gradient={{ from: 'blue', to: 'cyan' }} size="lg">
            5件完了
          </Badge>
        </Group>

        <Stack gap="xs">
          {['朝の瞑想', '読書30分', '運動1時間', '日記を書く', '英語学習'].map((habit, index) => (
            <Group
              key={habit}
              gap="sm"
              style={{
                padding: '0.75rem',
                backgroundColor: '#0f0f0f',
                borderRadius: '8px',
                border: '1px solid #2a2a2a',
              }}
            >
              <Box
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                }}
              />
              <Text style={{ color: '#ccc', fontSize: '0.9rem', flex: 1 }}>{habit}</Text>
              <Text style={{ color: '#888', fontSize: '0.85rem' }}>{30 + index * 10}分</Text>
            </Group>
          ))}
        </Stack>
      </Box>

      <style>
        {`
          .calendar-cell:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
            z-index: 10;
          }
        `}
      </style>
    </Stack>
  )
}

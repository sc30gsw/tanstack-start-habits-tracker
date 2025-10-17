import { Box, Button, Container, Group, Stack, Text, Title } from '@mantine/core'
import { useState } from 'react'

const TABS = [
  {
    id: 'dashboard',
    label: 'ダッシュボード',
    title: '一目で全体を把握',
    description: '習慣の進捗状況、統計データ、達成状況をリアルタイムで表示。',
  },
  {
    id: 'heatmap',
    label: 'ヒートマップ',
    title: '継続を視覚化',
    description: 'GitHubスタイルのヒートマップで年間の習慣継続状況を一目で確認。',
  },
  {
    id: 'calendar',
    label: 'カレンダー',
    title: '月次・週次で確認',
    description: 'カレンダービューで習慣の実行履歴を時系列で追跡。',
  },
  {
    id: 'stats',
    label: '統計',
    title: 'データ駆動の改善',
    description: '詳細な統計とグラフで習慣パフォーマンスを分析。',
  },
] as const satisfies readonly Record<string, string>[]

export function ProductShowcaseSection() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('dashboard')

  const currentTab = TABS.find((tab) => tab.id === activeTab) || TABS[0]

  return (
    <Container
      fluid
      style={{
        background: '#0a0a0a',
        padding: '120px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container size="xl">
        <Stack align="center" gap="xl">
          {/* Section Header */}
          <Stack align="center" gap="md" style={{ maxWidth: '800px' }}>
            <Text
              size="sm"
              style={{
                color: '#4a90e2',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                fontWeight: 600,
              }}
            >
              Track を体験
            </Text>
            <Title
              order={2}
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                fontWeight: 800,
                color: 'white',
                textAlign: 'center',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              Introducing Track
            </Title>
            <Text
              size="xl"
              style={{
                textAlign: 'center',
                color: '#888',
                fontSize: 'clamp(1rem, 2vw, 1.3rem)',
                maxWidth: '600px',
              }}
            >
              習慣追跡を自動化する、オールインワンツール
            </Text>
          </Stack>

          {/* Tab Navigation */}
          <Group gap="sm" mt="3rem" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            {TABS.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'filled' : 'subtle'}
                size="lg"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  backgroundColor: activeTab === tab.id ? '#4a90e2' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#999',
                  borderRadius: '12px',
                  padding: '1rem 2rem',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  border: activeTab === tab.id ? 'none' : '1px solid #333',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      backgroundColor: activeTab === tab.id ? '#3a7bc8' : 'rgba(74, 144, 226, 0.1)',
                      color: activeTab === tab.id ? 'white' : '#ccc',
                    },
                  },
                }}
              >
                {tab.label}
              </Button>
            ))}
          </Group>

          {/* Content Area */}
          <Box
            mt="3rem"
            style={{
              width: '100%',
              maxWidth: '1200px',
              minHeight: '500px',
              backgroundColor: '#1a1a1a',
              borderRadius: '24px',
              padding: '3rem',
              border: '1px solid #2a2a2a',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Background decoration */}
            <Box
              style={{
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(74, 144, 226, 0.15), transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(80px)',
              }}
            />

            <Stack gap="xl" style={{ position: 'relative', zIndex: 1 }}>
              {/* Content Title */}
              <Stack gap="md">
                <Title
                  order={3}
                  style={{
                    fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                    fontWeight: 700,
                    color: 'white',
                  }}
                >
                  {currentTab.title}
                </Title>
                <Text size="lg" style={{ color: '#aaa', maxWidth: '600px' }}>
                  {currentTab.description}
                </Text>
              </Stack>

              {/* Placeholder for Demo Content */}
              <Box
                style={{
                  width: '100%',
                  height: '350px',
                  backgroundColor: '#0f0f0f',
                  borderRadius: '16px',
                  border: '1px solid #2a2a2a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Stack align="center" gap="md">
                  <Box
                    style={{
                      width: '80px',
                      height: '80px',
                      background:
                        'linear-gradient(135deg, rgba(74, 144, 226, 0.2), rgba(56, 189, 248, 0.2))',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: '#4a90e2',
                      }}
                    >
                      {currentTab.id === 'dashboard' && '📊'}
                      {currentTab.id === 'heatmap' && '🔥'}
                      {currentTab.id === 'calendar' && '📅'}
                      {currentTab.id === 'stats' && '📈'}
                    </Text>
                  </Box>
                  <Text size="lg" style={{ color: '#666' }}>
                    {currentTab.label} プレビュー
                  </Text>
                </Stack>
              </Box>

              {/* Feature Tags */}
              <Group gap="md" style={{ flexWrap: 'wrap' }}>
                {['AI駆動', 'オールインワン', '自動整理'].map((tag) => (
                  <Box
                    key={tag}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: 'rgba(74, 144, 226, 0.1)',
                      border: '1px solid rgba(74, 144, 226, 0.3)',
                      borderRadius: '50px',
                      color: '#4a90e2',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                    }}
                  >
                    {tag}
                  </Box>
                ))}
              </Group>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Container>
  )
}

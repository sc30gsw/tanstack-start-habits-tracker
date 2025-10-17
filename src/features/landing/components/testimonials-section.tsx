import { ActionIcon, Box, Container, Group, Stack, Text, Title } from '@mantine/core'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { useState } from 'react'

const TESTIMONIALS = [
  {
    quote:
      'Trackを導入してから、習慣の継続率が80%向上しました。ヒートマップで視覚化されることで、モチベーションが維持しやすくなっています。',
    author: '田中 太郎',
    role: 'プロダクトマネージャー',
    company: 'TechCorp',
  },
  {
    quote:
      'シンプルで使いやすく、毎日の記録が苦になりません。カレンダービューで過去の実績を振り返ることができ、習慣形成に役立っています。',
    author: '佐藤 花子',
    role: 'デザイナー',
    company: 'CreativeStudio',
  },
  {
    quote:
      'チーム全体で習慣トラッキングを導入しました。個人の成長が可視化され、チームの生産性も向上しています。',
    author: '鈴木 一郎',
    role: 'エンジニアリングマネージャー',
    company: 'StartupHub',
  },
] as const satisfies readonly Record<string, string>[]

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0)

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1))
  }

  const currentTestimonial = TESTIMONIALS[activeIndex]

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
      {/* Background decoration */}
      <Box
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(74, 144, 226, 0.08), transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(120px)',
        }}
      />

      <Container size="lg" style={{ position: 'relative', zIndex: 1 }}>
        <Stack align="center" gap="xl">
          {/* Section Header */}
          <Stack align="center" gap="md" style={{ maxWidth: '800px', marginBottom: '2rem' }}>
            <Title
              order={2}
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 800,
                color: 'white',
                textAlign: 'center',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              ユーザーの声
            </Title>
            <Text
              size="xl"
              style={{
                textAlign: 'center',
                color: '#888',
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              }}
            >
              Trackで習慣形成に成功したユーザーの体験談
            </Text>
          </Stack>

          {/* Testimonial Card */}
          <Box
            style={{
              maxWidth: '900px',
              width: '100%',
              backgroundColor: '#1a1a1a',
              borderRadius: '24px',
              padding: 'clamp(2rem, 5vw, 4rem)',
              border: '1px solid #2a2a2a',
              minHeight: '300px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Stack gap="xl">
              {/* Quote */}
              <Text
                size="xl"
                style={{
                  color: '#e0e0e0',
                  fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
                  lineHeight: 1.7,
                  fontStyle: 'italic',
                  textAlign: 'center',
                }}
              >
                "{currentTestimonial.quote}"
              </Text>

              {/* Author Info */}
              <Stack gap="xs" align="center">
                {/* Avatar Placeholder */}
                <Box
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4a90e2 0%, #38bdf8 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: 'white',
                    }}
                  >
                    {currentTestimonial.author.charAt(0)}
                  </Text>
                </Box>

                <Box>
                  <Text
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: 'white',
                      textAlign: 'center',
                    }}
                  >
                    {currentTestimonial.author}
                  </Text>
                  <Text
                    size="sm"
                    style={{
                      color: '#888',
                      textAlign: 'center',
                    }}
                  >
                    {currentTestimonial.role} - {currentTestimonial.company}
                  </Text>
                </Box>
              </Stack>
            </Stack>
          </Box>

          {/* Navigation Controls */}
          <Group gap="md" mt="xl">
            <ActionIcon
              variant="outline"
              size="xl"
              radius="xl"
              onClick={handlePrevious}
              style={{
                borderColor: '#444',
                color: '#e0e0e0',
                transition: 'all 0.3s ease',
              }}
              styles={{
                root: {
                  '&:hover': {
                    borderColor: '#4a90e2',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                  },
                },
              }}
            >
              <IconChevronLeft size={24} />
            </ActionIcon>

            {/* Dots Indicator */}
            <Group gap="xs">
              {TESTIMONIALS.map((_, index) => (
                <Box
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  style={{
                    width: index === activeIndex ? '32px' : '12px',
                    height: '12px',
                    borderRadius: '6px',
                    backgroundColor: index === activeIndex ? '#4a90e2' : '#333',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Group>

            <ActionIcon
              variant="outline"
              size="xl"
              radius="xl"
              onClick={handleNext}
              style={{
                borderColor: '#444',
                color: '#e0e0e0',
                transition: 'all 0.3s ease',
              }}
              styles={{
                root: {
                  '&:hover': {
                    borderColor: '#4a90e2',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                  },
                },
              }}
            >
              <IconChevronRight size={24} />
            </ActionIcon>
          </Group>
        </Stack>
      </Container>
    </Container>
  )
}

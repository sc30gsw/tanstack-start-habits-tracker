import { Box, Container } from '@mantine/core'

export function MarqueeSection() {
  const text = 'Track is Built different.'

  return (
    <Container
      fluid
      style={{
        backgroundColor: '#0a0a0a',
        padding: '80px 0',
        overflow: 'hidden',
        borderTop: '1px solid #1a1a1a',
        borderBottom: '1px solid #1a1a1a',
      }}
    >
      <Box
        style={{
          display: 'flex',
          whiteSpace: 'nowrap',
          animation: 'marquee 30s linear infinite',
        }}
      >
        {[...Array(20)].map((_, index) => (
          <Box
            key={index}
            style={{
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              fontWeight: 800,
              color: 'transparent',
              WebkitTextStroke: '2px #2a2a2a',
              marginRight: '3rem',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              letterSpacing: '-0.02em',
            }}
          >
            {text}
          </Box>
        ))}
      </Box>

      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </Container>
  )
}

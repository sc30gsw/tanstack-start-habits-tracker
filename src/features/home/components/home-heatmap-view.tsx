import { Box, Card, Group, Stack, Text, useComputedColorScheme } from '@mantine/core'
import { IconChartBar } from '@tabler/icons-react'
import type { HabitEntity, RecordEntity } from '~/features/habits/types/habit'
import { HomeHeatmap } from '~/features/home/components/chart/home-heatmap'

export function HomeHeatmapView({
  records,
  habits,
}: Record<'records', RecordEntity[]> & Record<'habits', HabitEntity[]>) {
  const computedColorScheme = useComputedColorScheme('light')
  const titleColor = computedColorScheme === 'dark' ? 'gray.1' : 'dark.8'

  return (
    <Card withBorder padding="lg" radius="md" shadow="sm">
      <Stack gap="md">
        <Group gap="xs" align="center">
          <IconChartBar size={24} color="var(--mantine-color-blue-6)" />
          <Text size="lg" fw={600} c={titleColor}>
            全習慣の年間活動時間
          </Text>
        </Group>

        <Box
          p="xs"
          style={{
            borderRadius: '8px',
            backgroundColor: 'var(--mantine-color-gray-0)',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            overflow: 'auto',
          }}
        >
          <HomeHeatmap records={records} habits={habits} />
        </Box>
      </Stack>
    </Card>
  )
}

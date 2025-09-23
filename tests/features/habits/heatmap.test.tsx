import { MantineProvider } from '@mantine/core'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HabitHeatmap } from '../../../src/features/habits/components/habit-heatmap'

const wrap = (ui: React.ReactNode) => <MantineProvider>{ui}</MantineProvider>

describe('HabitHeatmap', () => {
  const records = [
    {
      id: 'r1',
      habit_id: 'h1',
      date: '2025-01-01',
      completed: true,
      duration_minutes: 30,
      created_at: '',
      updated_at: '',
    },
    {
      id: 'r2',
      habit_id: 'h1',
      date: '2025-01-02',
      completed: false,
      duration_minutes: 0,
      created_at: '',
      updated_at: '',
    },
  ] as any

  it('renders duration metric by default', () => {
    render(wrap(<HabitHeatmap records={records} />))
    // Tooltip not visible until hover, just ensure buttons (rects) rendered via role
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('fires onSelectDate when clicked', () => {
    const handler = vi.fn()
    render(wrap(<HabitHeatmap records={records} onSelectDate={handler} />))
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('renders completion metric', () => {
    render(wrap(<HabitHeatmap records={records} metric="completion" />))
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })
})

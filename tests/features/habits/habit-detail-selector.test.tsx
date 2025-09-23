import { MantineProvider } from '@mantine/core'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HabitDetail } from '../../../src/features/habits/components/habit-detail'

const wrap = (ui: React.ReactNode) => <MantineProvider>{ui}</MantineProvider>

describe('HabitDetail habit selector', () => {
  const habits = [
    { id: 'h1', name: 'A', description: 'desc', created_at: '', updated_at: '' },
    { id: 'h2', name: 'B', description: '', created_at: '', updated_at: '' },
  ] as any
  const records: any[] = []

  it('shows selector when multiple habits', () => {
    render(wrap(<HabitDetail habit={habits[0]} records={records} habitsList={habits} />))
    expect(screen.getByLabelText('習慣を切り替える')).toBeTruthy()
  })
})

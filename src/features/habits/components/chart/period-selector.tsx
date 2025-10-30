import { Group, Radio } from '@mantine/core'
import type { SearchParams } from '~/features/habits/types/schemas/search-params'

type PeriodSelectorProps = {
  value: SearchParams['calendarView']
  onChange: (value: SearchParams['calendarView']) => void
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <Radio.Group value={value || 'month'} onChange={(val) => onChange(val as SearchParams['calendarView'])}>
      <Group gap="sm">
        <Radio value="day" label="日" />
        <Radio value="week" label="週" />
        <Radio value="month" label="月" />
      </Group>
    </Radio.Group>
  )
}

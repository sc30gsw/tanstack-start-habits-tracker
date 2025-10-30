import {
  Badge,
  Combobox,
  Group,
  Input,
  InputBase,
  ScrollArea,
  Text,
  useCombobox,
} from '@mantine/core'
import {
  IconCalendar,
  IconCalendarMonth,
  IconCalendarWeek,
  IconCheck,
  IconClock,
} from '@tabler/icons-react'
import type { NavigateOptions } from '@tanstack/react-router'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { filter, map, pipe } from 'remeda'
import { CALENDAR_VIEW_HASH_TARGET } from '~/features/habits/constants/hash-target-ids'
import type { SearchParams } from '~/features/habits/types/schemas/search-params'
import { getDateColor, getDatePresets } from '~/features/habits/utils/calendar-utils'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

const iconProps = { size: 16, stroke: 1.5 } as const satisfies Record<string, number>
const groupIcons = {
  basic: <IconCalendar {...iconProps} />,
  recent: <IconClock {...iconProps} />,
  week: <IconCalendarWeek {...iconProps} />,
  month: <IconCalendarMonth {...iconProps} />,
  year: <IconClock {...iconProps} />,
} as const satisfies Record<string, React.ReactNode>

type CalendarPresetsComboboxProps = {
  selectedDate: SearchParams['selectedDate']
  navigate: (options: NavigateOptions) => void
}

export function CalendarPresetsCombobox({ selectedDate, navigate }: CalendarPresetsComboboxProps) {
  const selectedDateString = selectedDate || dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD')

  const allPresets = Array.from(getDatePresets())

  const itemDataMap = new Map<
    string,
    {
      dateStr: string
      dayOfWeek: string
      dateType: 'sunday' | 'saturday' | 'holiday' | 'weekday'
      group: string
    }
  >()

  const seenValues = new Set<string>()

  const selectData = pipe(
    allPresets,
    map((preset) => {
      const items = pipe(
        preset.items,
        filter((item) => {
          if (seenValues.has(item.value)) {
            return false
          }

          seenValues.add(item.value)

          return true
        }),
        map((item) => {
          itemDataMap.set(item.value, {
            dateStr: item.dateStr,
            dayOfWeek: item.dayOfWeek,
            dateType: item.dateType,
            group: preset.group,
          })

          return {
            value: item.value,
            label: item.label,
          }
        }),
      )

      return {
        group: preset.groupLabel,
        items: items,
        groupIcon: preset.group,
      }
    }),
    filter((group) => group.items.length > 0),
  )

  const getSelectedIcon = () => {
    for (const preset of allPresets) {
      if (preset.items.some((item) => item.value === selectedDateString)) {
        return groupIcons[preset.group]
      }
    }
    return <IconCalendar size={18} stroke={1.5} />
  }

  const handlePresetChange = (value: string | null) => {
    if (value) {
      navigate({
        search: (prev) => ({
          ...prev,
          selectedDate: value,
          currentMonth: dayjs(value).format('YYYY-MM'),
          preset: value,
        }),
        hash: CALENDAR_VIEW_HASH_TARGET,
      })
    } else {
      navigate({
        search: (prev) => ({
          ...prev,
          preset: undefined,
        }),
        hash: CALENDAR_VIEW_HASH_TARGET,
      })
    }
  }

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })

  const getSelectedLabel = () => {
    for (const group of selectData) {
      const found = group.items.find((item) => item.value === selectedDateString)

      if (found) {
        const extraData = itemDataMap.get(found.value)

        return (
          <Group gap="xs">
            <Text size="sm">{found.label}</Text>
            {extraData?.dateStr && (
              <Text size="xs" c="dimmed">
                {extraData.dateStr}
              </Text>
            )}
            {extraData?.dayOfWeek && extraData?.dateType && (
              <Badge size="xs" color={getDateColor(extraData.dateType, undefined, undefined, 4)}>
                {extraData.dayOfWeek}
              </Badge>
            )}
          </Group>
        )
      }
    }
    return null
  }

  const options = pipe(
    selectData,
    map((group) => {
      const groupIcon = groupIcons[group.groupIcon as keyof typeof groupIcons]

      return (
        <Combobox.Group
          key={group.group}
          label={
            <Group gap="xs">
              {groupIcon}
              <Text size="xs">{group.group}</Text>
            </Group>
          }
        >
          {group.items.map((item) => {
            const extraData = itemDataMap.get(item.value)
            const isSelected = item.value === selectedDateString

            return (
              <Combobox.Option key={item.value} value={item.value}>
                <Group flex="1" gap="xs">
                  {item.label}
                  {extraData?.dateStr && <Text size="sm">{extraData.dateStr}</Text>}
                  {extraData?.dayOfWeek && extraData?.dateType && (
                    <Badge
                      size="sm"
                      color={getDateColor(extraData.dateType, undefined, undefined, 4)}
                    >
                      {extraData.dayOfWeek}
                    </Badge>
                  )}
                  {isSelected && (
                    <IconCheck style={{ marginInlineStart: 'auto' }} stroke={1.5} size={16} />
                  )}
                </Group>
              </Combobox.Option>
            )
          })}
        </Combobox.Group>
      )
    }),
  )

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(value) => {
        handlePresetChange(value)
        combobox.closeDropdown()
      }}
      transitionProps={{ transition: 'pop', duration: 200 }}
    >
      <Combobox.Target>
        <InputBase
          component="button"
          type="button"
          pointer
          rightSection={<Combobox.Chevron />}
          leftSection={getSelectedIcon()}
          onClick={() => combobox.toggleDropdown()}
          size="xs"
        >
          {getSelectedLabel() || (
            <Input.Placeholder>日付を選択 (昨日、今日、明日など)</Input.Placeholder>
          )}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          <ScrollArea.Autosize mah={300} type="scroll">
            {options}
          </ScrollArea.Autosize>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}

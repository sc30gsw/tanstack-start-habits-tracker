import type { Icon } from '@tabler/icons-react'
import * as TablerIcons from '@tabler/icons-react'

export function getIconComponent(iconName: string): Icon {
  const IconComponent = (TablerIcons as unknown as Record<string, Icon>)[iconName]

  return IconComponent || TablerIcons.IconQuestionMark
}

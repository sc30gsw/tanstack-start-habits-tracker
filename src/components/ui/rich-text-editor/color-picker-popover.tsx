import { Button, ColorInput, Popover, Stack, Tooltip } from '@mantine/core'
import { IconColorPicker } from '@tabler/icons-react'
import type { Editor } from '@tiptap/react'
import { COLOR_SWATCHES } from '~/constants/rich-text-editor'

type ColorPickerPopoverProps = {
  opened: boolean
  selectedColor: string
  disabled: boolean
  editor: Editor
  onOpenChange: (open: boolean) => void
  onColorChange: (color: string) => void
}

export function ColorPickerPopover({
  opened,
  selectedColor,
  disabled,
  editor,
  onOpenChange,
  onColorChange,
}: ColorPickerPopoverProps) {
  return (
    <Popover opened={opened} onChange={onOpenChange} position="bottom" withArrow>
      <Popover.Target>
        <Tooltip label="文字色">
          <button
            type="button"
            onClick={() => onOpenChange(!opened)}
            disabled={disabled}
            style={{
              padding: '4px 8px',
              border: 'none',
              borderRadius: '4px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              backgroundColor: 'transparent',
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <IconColorPicker size={18} />
          </button>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap="xs">
          <ColorInput
            value={selectedColor}
            onChange={(color) => {
              onColorChange(color)
              editor.chain().focus().setColor(color).run()
            }}
            format="hex"
            swatches={[...COLOR_SWATCHES]}
          />
          <Button
            size="xs"
            variant="light"
            onClick={() => {
              editor.chain().focus().unsetColor().run()
              onOpenChange(false)
            }}
          >
            色をリセット
          </Button>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  )
}

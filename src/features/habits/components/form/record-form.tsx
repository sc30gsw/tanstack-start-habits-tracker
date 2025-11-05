import {
  Alert,
  Button,
  Card,
  Drawer,
  Group,
  Kbd,
  NumberInput,
  Select,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { useMediaQuery } from '@mantine/hooks'
import 'dayjs/locale/ja'
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconClipboard,
  IconDeviceFloppy,
  IconEdit,
  IconMaximize,
  IconPlayerSkipForward,
} from '@tabler/icons-react'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { useEffect } from 'react'
import { RichTextEditor } from '~/components/ui/rich-text-editor/rich-text-editor'
import { RichTextPreview } from '~/components/ui/rich-text-editor/rich-text-preview'
import { RecoverySwitch } from '~/features/habits/components/form/recover-switch'
import { RecoverySwitchWrapper } from '~/features/habits/components/form/recovery-switch-wrapper'
import {
  type FormValues,
  isEmptyContent,
  useRecordForm,
} from '~/features/habits/hooks/use-record-form'
import type { HabitTable, RecordEntity, RecordTable } from '~/features/habits/types/habit'
import { getDateType } from '~/features/habits/utils/calendar-utils'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('ja')
dayjs.tz.setDefault('Asia/Tokyo')

type RecordFormProps = {
  habitId: HabitTable['id']
  date: RecordTable['date']
  onSuccess: () => void
  onCancel: () => void
  existingRecord?: RecordEntity
}

export function RecordForm({
  habitId,
  date,
  onSuccess,
  onCancel,
  existingRecord,
}: RecordFormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const {
    form,
    isPending,
    statusOptions,
    isFutureDate,
    editorContent,
    setEditorContent,
    isEditorModalOpen,
    setIsEditorModalOpen,
    editorKey,
    setEditorKey,
    handleSubmit,
    handleHoursChange,
    handleMinutesChange,
    notesConfig,
    triggerSubmit,
  } = useRecordForm(habitId, date, onSuccess, existingRecord)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (isEditorModalOpen) {
          return
        }

        e.preventDefault()
        triggerSubmit()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isEditorModalOpen, triggerSubmit])

  return (
    <form onSubmit={form.onSubmit((values: FormValues) => handleSubmit(values))} noValidate>
      <Stack gap="md">
        {isFutureDate && (
          <Alert color="blue" title="未来の日付" variant="light">
            <Text size="sm">
              未来の日付には「完了」ステータスは記録できません。
              <br />
              完了の記録は、その日が来てから行ってください。
            </Text>
          </Alert>
        )}
        {(form.errors.status ||
          form.errors.durationMinutes ||
          form.errors.notes ||
          form.errors.recoveryDate) && (
          <Alert color="red" title="エラー" icon={<IconAlertTriangle stroke={2} />}>
            <Text c="red">
              {form.errors.status ||
                form.errors.durationMinutes ||
                form.errors.notes ||
                form.errors.recoveryDate}
            </Text>
          </Alert>
        )}
        <Select
          label="ステータス"
          placeholder="ステータスを選択"
          key={form.key('status')}
          value={form.values.status}
          onChange={(value) =>
            form.setFieldValue('status', value as 'active' | 'completed' | 'skipped')
          }
          data={statusOptions}
          disabled={isPending}
          error={form.errors.status}
          description={isFutureDate ? '未来の日付は予定中とスキップのみ選択可能です' : undefined}
          leftSection={
            form.values.status === 'completed' ? (
              <IconCircleCheck size={16} color="var(--mantine-color-green-6)" />
            ) : form.values.status === 'skipped' ? (
              <IconPlayerSkipForward size={16} color="var(--mantine-color-orange-6)" />
            ) : (
              <IconClipboard size={16} color="var(--mantine-color-blue-6)" />
            )
          }
          renderOption={({ option }) => (
            <Group gap="xs">
              {option.value === 'completed' ? (
                <IconCircleCheck size={16} color="var(--mantine-color-green-6)" />
              ) : option.value === 'skipped' ? (
                <IconPlayerSkipForward size={16} color="var(--mantine-color-orange-6)" />
              ) : (
                <IconClipboard size={16} color="var(--mantine-color-blue-6)" />
              )}
              <Text>{option.label}</Text>
            </Group>
          )}
        />
        {existingRecord?.isRecoveryAttempt && (
          <RecoverySwitchWrapper>
            <RecoverySwitch
              value={form.values.recoverySuccess}
              onChange={(value) => form.setFieldValue('recoverySuccess', value)}
              disabled={isPending}
            />
          </RecoverySwitchWrapper>
        )}
        {form.values.status !== 'skipped' && (
          <Group gap="md">
            <NumberInput
              label="実行時間（時間）"
              placeholder="0"
              min={0}
              max={24}
              step={0.25}
              decimalScale={2}
              key={form.key('durationHours')}
              value={form.values.durationHours}
              onChange={handleHoursChange}
              error={!!form.errors.durationMinutes}
              disabled={isPending}
              style={{ flex: 1 }}
            />
            <NumberInput
              label="実行時間（分）"
              placeholder="0"
              min={0}
              max={1440}
              key={form.key('durationMinutes')}
              value={form.values.durationMinutes ?? 0}
              onChange={handleMinutesChange}
              error={!!form.errors.durationMinutes}
              disabled={isPending}
              style={{ flex: 1 }}
            />
          </Group>
        )}
        {form.values.status === 'skipped' && (
          <Stack gap="md" mt="xs">
            <DateInput
              label="リカバリー予定日"
              description={
                <Text size="sm" c="dimmed" style={{ lineHeight: 1.6, marginBottom: 8 }}>
                  スキップした習慣を後日実行する予定日を設定できます。
                  <br />
                  （スキップした日から
                  <Text component="span" fw={700} c="blue.6">
                    30日以内
                  </Text>
                  まで選択可能）
                  <br />
                  リカバリー日に完了すれば、習慣継続の記録として反映されます。
                </Text>
              }
              placeholder="リカバリー日を選択"
              key={form.key('recoveryDate')}
              value={form.values.recoveryDate ? new Date(form.values.recoveryDate) : null}
              onChange={(value) => {
                form.setFieldValue('recoveryDate', value ? dayjs(value).format('YYYY-MM-DD') : null)
              }}
              minDate={dayjs(date).add(1, 'day').toDate()}
              maxDate={dayjs(date).add(30, 'day').toDate()}
              valueFormat="YYYY-MM-DD"
              firstDayOfWeek={0}
              locale="ja"
              monthLabelFormat="YYYY年 M月"
              clearable
              disabled={isPending}
              error={form.errors.recoveryDate}
              getDayProps={(calendarDate) => {
                const dayjsDate = dayjs(calendarDate)
                const dateType = getDateType(dayjsDate)

                switch (dateType) {
                  case 'sunday':
                  case 'holiday':
                    return {
                      style: {
                        color: 'var(--mantine-color-red-7)',
                        fontWeight: 500,
                      },
                    }

                  case 'saturday':
                    return {
                      style: {
                        color: 'var(--mantine-color-blue-7)',
                        fontWeight: 500,
                      },
                    }

                  default:
                    return {}
                }
              }}
            />
          </Stack>
        )}
        <Stack gap="xs">
          <Group justify="space-between" align="center">
            <Text size="sm" fw={500}>
              {notesConfig.label}
            </Text>
          </Group>

          {editorContent && !isEmptyContent(editorContent) ? (
            <Card withBorder padding="md" radius="md">
              <Stack gap="sm">
                <RichTextPreview html={editorContent} minHeight="80px" maxHeight="200px" />
                <Button
                  variant="light"
                  size="sm"
                  leftSection={<IconEdit size={16} />}
                  onClick={() => {
                    setEditorKey(crypto.randomUUID())
                    setIsEditorModalOpen(true)
                  }}
                >
                  編集する
                </Button>
              </Stack>
            </Card>
          ) : (
            <Button
              variant="outline"
              size="md"
              leftSection={<IconMaximize size={16} />}
              onClick={() => {
                setEditorKey(crypto.randomUUID())
                setIsEditorModalOpen(true)
              }}
              fullWidth
            >
              {notesConfig.label}を記入する
            </Button>
          )}
        </Stack>

        <Drawer
          opened={isEditorModalOpen}
          onClose={() => setIsEditorModalOpen(false)}
          title={notesConfig.label}
          position={isDesktop ? 'right' : 'top'}
          size={isDesktop ? 'xl' : 'lg'}
        >
          <Stack gap="md" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <RichTextEditor
                key={editorKey}
                editorKey={editorKey}
                content={editorContent}
                onChange={setEditorContent}
                placeholder={notesConfig.placeholder}
                disabled={isPending}
                minHeight="calc(100vh - 600px)"
              />
            </div>
            <Group justify="flex-end" style={{ flexShrink: 0 }}>
              <Button variant="outline" onClick={() => setIsEditorModalOpen(false)}>
                閉じる
              </Button>
            </Group>
          </Stack>
        </Drawer>

        <Group gap="sm" align="center">
          <Tooltip
            label={
              <Stack gap={4} align="center">
                <Text size="sm">Record now</Text>
                <Group gap={4}>
                  <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                    ⌘
                  </Kbd>
                  <Kbd size="xs" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                    Return
                  </Kbd>
                </Group>
              </Stack>
            }
            position="top"
            withArrow
          >
            <Button
              type="submit"
              loading={isPending}
              disabled={isPending}
              leftSection={<IconDeviceFloppy size={18} />}
            >
              {existingRecord ? '記録を更新' : '記録を保存'}
            </Button>
          </Tooltip>
          <Button variant="outline" onClick={onCancel} disabled={isPending}>
            キャンセル
          </Button>
        </Group>
      </Stack>
    </form>
  )
}

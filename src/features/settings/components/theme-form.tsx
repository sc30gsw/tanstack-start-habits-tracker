import { Button, Group, Radio, Stack, Text, useMantineColorScheme } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconDeviceDesktop, IconDeviceFloppy, IconMoon, IconSun } from '@tabler/icons-react'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useEffect, useTransition } from 'react'
import { GET_USER_SETTINGS_CACHE_KEY } from '~/constants/cache-key'
import { settingsDto } from '~/features/settings/server/settings-functions'

type ThemeFormValues = Record<'theme', 'light' | 'dark' | 'auto'>

export function ThemeForm() {
  const [isPending, startTransition] = useTransition()
  const { setColorScheme } = useMantineColorScheme()

  const queryClient = useQueryClient()
  const { data: settings, refetch } = useSuspenseQuery({
    queryKey: [GET_USER_SETTINGS_CACHE_KEY],
    queryFn: () => settingsDto.getUserSettings(),
  })

  const form = useForm<ThemeFormValues>({
    initialValues: {
      theme: (settings?.theme as ThemeFormValues['theme']) ?? 'auto',
    },
  })

  useEffect(() => {
    setColorScheme(form.values.theme)
  }, [form.values.theme, setColorScheme])

  const handleSubmit = form.onSubmit(async (values) => {
    startTransition(async () => {
      try {
        await settingsDto.updateTheme({ data: { theme: values.theme } })

        notifications.show({
          title: '成功',
          message: 'テーマが更新されました',
          color: 'green',
        })

        await queryClient.invalidateQueries({ queryKey: [GET_USER_SETTINGS_CACHE_KEY] })
        form.resetDirty()
        await refetch()
      } catch (error) {
        notifications.show({
          title: 'エラー',
          message: error instanceof Error ? error.message : 'テーマの更新に失敗しました',
          color: 'red',
        })
      }
    })
  })

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <Radio.Group
          label="カラーテーマを選択"
          description="アプリケーションの外観テーマを変更できます"
          {...form.getInputProps('theme')}
        >
          <Stack mt="xs" gap="sm">
            <Radio
              value="light"
              label={
                <Group gap="xs">
                  <IconSun size={18} />
                  <Text>ライトモード</Text>
                </Group>
              }
              disabled={isPending}
            />
            <Radio
              value="dark"
              label={
                <Group gap="xs">
                  <IconMoon size={18} />
                  <Text>ダークモード</Text>
                </Group>
              }
              disabled={isPending}
            />
            <Radio
              value="auto"
              label={
                <Group gap="xs">
                  <IconDeviceDesktop size={18} />
                  <Text>システム設定に従う</Text>
                </Group>
              }
              disabled={isPending}
            />
          </Stack>
        </Radio.Group>

        <Button
          type="submit"
          loading={isPending}
          disabled={!form.isDirty()}
          fullWidth
          mt="md"
          leftSection={<IconDeviceFloppy size={18} />}
        >
          変更を保存
        </Button>
      </Stack>
    </form>
  )
}

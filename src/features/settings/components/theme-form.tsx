import { Button, Radio, Stack } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useTransition } from 'react'
import { GET_USER_SETTINGS_CACHE_KEY } from '~/constants/cache-key'
import { settingsDto } from '~/features/settings/server/settings-functions'

type ThemeFormValues = {
  theme: 'light' | 'dark' | 'auto'
}

export function ThemeForm() {
  const [isPending, startTransition] = useTransition()

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
            <Radio value="light" label="ライトモード" />
            <Radio value="dark" label="ダークモード" />
            <Radio value="auto" label="システム設定に従う" />
          </Stack>
        </Radio.Group>

        <Button type="submit" loading={isPending} disabled={!form.isDirty()} fullWidth mt="md">
          変更を保存
        </Button>
      </Stack>
    </form>
  )
}

import { Button, Radio, Stack } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { type ComponentProps, useTransition } from 'react'
import { GET_USER_SETTINGS_CACHE_KEY } from '~/constants/cache-key'
import { settingsDto } from '~/features/settings/server/settings-functions'
import type { ThemeRouteSearch } from '~/routes/settings/theme'

export function ThemeForm() {
  const routeApi = getRouteApi('/settings/theme')
  const { theme } = routeApi.useSearch()

  const navigate = routeApi.useNavigate()

  const [isPending, startTransition] = useTransition()

  const { data: settings, refetch } = useSuspenseQuery({
    queryKey: [GET_USER_SETTINGS_CACHE_KEY],
    queryFn: () => settingsDto.getUserSettings(),
  })

  const handleSubmit: ComponentProps<'form'>['onSubmit'] = (e) => {
    e.preventDefault()

    startTransition(async () => {
      try {
        await settingsDto.updateTheme({ data: { theme } })

        notifications.show({
          title: '成功',
          message: 'テーマが更新されました',
          color: 'green',
        })

        await refetch()
      } catch (error) {
        notifications.show({
          title: 'エラー',
          message: error instanceof Error ? error.message : 'テーマの更新に失敗しました',
          color: 'red',
        })
      }
    })
  }

  const isDirty = theme !== settings?.theme

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <Radio.Group
          label="カラーテーマを選択"
          description="アプリケーションの外観テーマを変更できます"
          value={theme}
          onChange={(value) => {
            navigate({
              search: (prev) => ({ ...prev, theme: value as ThemeRouteSearch['theme'] }),
            })
          }}
        >
          <Stack mt="xs" gap="sm">
            <Radio value="light" label="ライトモード" />
            <Radio value="dark" label="ダークモード" />
            <Radio value="auto" label="システム設定に従う" />
          </Stack>
        </Radio.Group>

        <Button type="submit" loading={isPending} disabled={!isDirty} fullWidth mt="md">
          変更を保存
        </Button>
      </Stack>
    </form>
  )
}

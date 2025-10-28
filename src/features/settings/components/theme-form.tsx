import {
  Button,
  Group,
  Radio,
  Stack,
  Text,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconDeviceDesktop, IconDeviceFloppy, IconMoon, IconSun } from '@tabler/icons-react'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useCallback, useRef, useTransition } from 'react'
import { flushSync } from 'react-dom'
import { GET_USER_SETTINGS_CACHE_KEY } from '~/constants/cache-key'
import { settingsDto } from '~/features/settings/server/settings-functions'

type ThemeFormValues = Record<'theme', 'light' | 'dark' | 'auto'>

export function ThemeForm() {
  const [isPending, startTransition] = useTransition()
  const [isThemePending, startThemeTransition] = useTransition()

  const { setColorScheme } = useMantineColorScheme()
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: false })

  const lightRef = useRef<HTMLInputElement>(null)
  const darkRef = useRef<HTMLInputElement>(null)
  const autoRef = useRef<HTMLInputElement>(null)
  const lastClickedRef = useRef<HTMLInputElement | null>(null)

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

  const handleThemeChange = useCallback(
    (theme: ThemeFormValues['theme']) => {
      startThemeTransition(async () => {
        let actualTheme: ThemeFormValues['theme'] = theme

        if (theme === 'auto') {
          const savedDisplay = localStorage.getItem('theme-display')

          if (savedDisplay === 'light' || savedDisplay === 'dark') {
            actualTheme = savedDisplay
          } else {
            const systemTheme = computedColorScheme === 'dark' ? 'dark' : 'light'
            localStorage.setItem('theme-display', systemTheme)
            actualTheme = systemTheme
          }

          setColorScheme(actualTheme)

          return
        }

        if (computedColorScheme === theme) {
          localStorage.setItem('theme-display', theme)

          return
        }

        localStorage.setItem('theme-display', theme)

        const origin = lastClickedRef.current

        if (!origin || !document.startViewTransition) {
          setColorScheme(theme)

          return
        }

        try {
          await document.startViewTransition(() => {
            flushSync(() => {
              setColorScheme(theme)
            })
          }).ready

          const rect = origin.getBoundingClientRect()
          const x = rect.left + rect.width / 2
          const y = rect.top + rect.height / 2
          const maxRadius = Math.hypot(
            Math.max(rect.left, window.innerWidth - rect.left),
            Math.max(rect.top, window.innerHeight - rect.top),
          )

          document.documentElement.animate(
            {
              clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`],
            },
            {
              duration: 400,
              easing: 'ease-in-out',
              pseudoElement: '::view-transition-new(root)',
            },
          )
        } catch (_) {
          // エラー時は何もしない
        }
      })
    },
    [computedColorScheme],
  )

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
          value={form.values.theme}
          onChange={(val) => {
            const map: Record<string, React.RefObject<HTMLInputElement | null>> = {
              light: lightRef,
              dark: darkRef,
              auto: autoRef,
            }

            lastClickedRef.current = map[val]?.current ?? null
            form.setFieldValue('theme', val as ThemeFormValues['theme'])
            handleThemeChange(val as ThemeFormValues['theme'])
          }}
        >
          <Stack mt="xs" gap="sm">
            <Radio
              ref={lightRef}
              value="light"
              label={
                <Group gap="xs">
                  <IconSun size={18} />
                  <Text>ライトモード</Text>
                </Group>
              }
              disabled={isPending || isThemePending}
            />
            <Radio
              ref={darkRef}
              value="dark"
              label={
                <Group gap="xs">
                  <IconMoon size={18} />
                  <Text>ダークモード</Text>
                </Group>
              }
              disabled={isPending || isThemePending}
            />
            <Radio
              ref={autoRef}
              value="auto"
              label={
                <Group gap="xs">
                  <IconDeviceDesktop size={18} />
                  <Text>システム設定に従う</Text>
                </Group>
              }
              disabled={isPending || isThemePending}
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

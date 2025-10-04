import { Button, Stack, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { getRouteApi } from '@tanstack/react-router'
import { useState, useTransition } from 'react'
import { authClient } from '~/lib/auth-client'

// WebAuthnサポートチェック（コンポーネント外で実行）
const isWebAuthnSupported = () => {
  if (typeof window === 'undefined') {
    return false
  }

  return !!(window.PublicKeyCredential && typeof window.PublicKeyCredential === 'function')
}

/**
 * ユーザー認証後に自動的にPasskeyを登録するコンポーネント
 * ブラウザがPasskeyをサポートしている場合のみ動作します
 */
export function PasskeyRegister() {
  const { data: session } = authClient.useSession()

  const routeApi = getRouteApi('/auth/passkey-setup')
  const navigate = routeApi.useNavigate()

  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const isSupported = isWebAuthnSupported()

  // Passkey登録処理
  const handleRegister = () => {
    if (!isSupported) {
      const error = new Error('このブラウザはPasskeyをサポートしていません')

      setError(error.message)

      notifications.show({
        title: 'エラー',
        message: `Passkey登録に失敗しました: ${error.message}`,
        color: 'red',
      })

      return
    }

    startTransition(async () => {
      try {
        setError(null)

        const passkeyName =
          session?.user.email || `Device-${new Date().toISOString().split('T')[0]}`

        // Passkey登録API呼び出し
        await authClient.passkey.addPasskey({
          name: passkeyName,
        })

        notifications.show({
          title: '成功',
          message: 'Passkeyが登録されました',
          color: 'green',
        })

        navigate({ to: '/' })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Passkey登録に失敗しました'
        setError(errorMessage)

        notifications.show({
          title: 'エラー',
          message: `Passkey登録に失敗しました: ${err instanceof Error ? err : new Error(errorMessage)}`,
          color: 'red',
        })
      }
    })
  }

  // Passkeyサポートされていない場合は何も表示しない
  if (!isSupported) {
    return null
  }

  // エラー時の表示と再試行ボタン
  if (error) {
    return (
      <Stack gap="md" align="center">
        <Text c="red" size="sm" ta="center">
          ❌ {error}
        </Text>
        <Button onClick={handleRegister} variant="outline" size="sm">
          再試行
        </Button>
      </Stack>
    )
  }

  // 登録処理中の表示
  if (isPending) {
    return (
      <Stack gap="md" align="center">
        <Text size="sm" ta="center" c="blue">
          🔐 Passkey登録中...
        </Text>
        <Text size="xs" ta="center" c="dimmed">
          ブラウザのPasskey登録ダイアログに従って進めてください。
        </Text>
      </Stack>
    )
  }

  // 手動登録ボタン（自動登録が無効の場合）
  return (
    <Stack gap="md" align="center">
      <Text size="sm" ta="center" c="dimmed">
        Passkeyを設定すると、次回からより安全で簡単にログインできます。
      </Text>
      <Button onClick={handleRegister} loading={isPending}>
        Passkeyを設定
      </Button>
    </Stack>
  )
}

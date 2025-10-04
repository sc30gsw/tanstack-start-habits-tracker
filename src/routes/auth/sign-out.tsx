import { createFileRoute, redirect } from '@tanstack/react-router'
import { authClient } from '~/lib/auth-client'

/**
 * ログアウト処理ルート
 * アクセスすると自動的にログアウトしてログインページへリダイレクト
 */
export const Route = createFileRoute('/auth/sign-out')({
  beforeLoad: async () => {
    // セッションをクリア
    await authClient.signOut()

    // ログインページへリダイレクト
    throw redirect({
      to: '/auth/sign-in',
    })
  },
})

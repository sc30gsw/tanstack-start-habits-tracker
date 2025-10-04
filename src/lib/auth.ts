import { checkout, polar, portal, webhooks } from '@polar-sh/better-auth'
import { Polar } from '@polar-sh/sdk'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { passkey } from 'better-auth/plugins/passkey'
import { reactStartCookies } from 'better-auth/react-start'
import { db } from '~/db'
import * as schema from '~/db/schema'

const polarClient = new Polar({
  accessToken: import.meta.env.VITE_POLAR_ACCESS_TOKEN,
  server: import.meta.env.VITE_POLAR_SERVER,
})

export const auth = betterAuth({
  baseURL: import.meta.env.DEV ? 'http://localhost:3000' : import.meta.env.VITE_BETTER_AUTH_URL,
  trustedOrigins: [import.meta.env.VITE_BETTER_AUTH_URL, 'http://localhost:3000'],
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: schema,
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    github: {
      clientId: import.meta.env.VITE_GITHUB_CLIENT_ID,
      clientSecret: import.meta.env.VITE_GITHUB_CLIENT_SECRET,
    },
  },
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: import.meta.env.VITE_POLAR_PRODUCT_ID,
              slug: 'pro',
            },
          ],
          successUrl: `${import.meta.env.VITE_BETTER_AUTH_URL}/checkout/success?checkout_id={CHECKOUT_ID}`,
          authenticatedUsersOnly: true,
        }),
        portal(),
        webhooks({
          secret: import.meta.env.VITE_POLAR_WEBHOOK_SECRET || '',

          // 重要なイベントハンドラー
          onOrderPaid: async (payload) => {
            console.log('💰 注文が支払われました:', payload)
            // TODO: ユーザーにProプランのアクセス権限を付与
          },

          onSubscriptionActive: async (payload) => {
            console.log('✅ サブスクリプションが有効化されました:', payload)
            // TODO: サブスクリプション特典を有効化
          },

          onSubscriptionCanceled: async (payload) => {
            console.log('❌ サブスクリプションがキャンセルされました:', payload)
            // TODO: キャンセル処理（期限まで有効）
          },

          onSubscriptionRevoked: async (payload) => {
            console.log('🚫 サブスクリプションが失効されました:', payload)
            // TODO: 即座にアクセス権限を取り消し
          },

          onCustomerStateChanged: async (payload) => {
            console.log('🔄 顧客状態が変更されました:', payload)
            // TODO: 顧客状態に基づいてアクセス制御を更新
          },

          // 全イベントをログ
          onPayload: async (payload) => {
            console.log('📥 Polar webhook received:', payload.type)
          },
        }),
      ],
    }),
    passkey({
      rpID: import.meta.env.DEV ? 'localhost' : import.meta.env.VITE_PASSKEY_RP_ID,
      rpName: import.meta.env.VITE_PASSKEY_RP_NAME,
      origin: import.meta.env.DEV ? 'http://localhost:3000' : import.meta.env.VITE_BETTER_AUTH_URL,
    }),
    reactStartCookies(), // make sure this is the last plugin in the array
  ],
})

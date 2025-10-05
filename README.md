# 🎯 Track - 習慣トラッキングアプリケーション

> TanStack Startで構築されたモダンなフルスタック習慣追跡アプリケーション。リアルタイムデータ可視化、認証、サブスクリプション管理を実装。

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TanStack Start](https://img.shields.io/badge/TanStack_Start-1.131-FF4154?logo=tanstack)](https://tanstack.com/start)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare)](https://workers.cloudflare.com/)

[🚀 ライブデモ](#) | [📖 ドキュメント](#主な機能) | [🐛 バグ報告](https://github.com/sc30gsw/tanstack-start-demo/issues)

---

## 📋 目次

- [プロジェクト概要](#プロジェクト概要)
- [主な機能](#主な機能)
- [技術スタック](#技術スタック)
- [システムアーキテクチャ](#システムアーキテクチャ)
- [データベース設計](#データベース設計)
- [セットアップ手順](#セットアップ手順)
- [開発ガイド](#開発ガイド)
- [デプロイメント](#デプロイメント)
- [技術的な学びと工夫](#技術的な学びと工夫)
- [ライセンス](#ライセンス)

---

## 🌟 プロジェクト概要

**Track**は、ユーザーが日々の習慣を構築・維持するための包括的な習慣追跡アプリケーションです。直感的な追跡、可視化、分析機能を通じて習慣形成をサポートします。モダンなWeb技術で構築され、SSR、リアルタイムデータ同期、認証、決済統合を含むフルスタック開発能力を実証しています。

### なぜこのプロジェクトを作ったのか？

このプロジェクトは以下を実証します：

- ✅ TanStack Start（SSRフレームワーク）を使用したモダンなReactパターン
- ✅ TypeScriptによる型安全なフルスタック開発
- ✅ Cloudflare Workers上のクラウドネイティブアーキテクチャ
- ✅ Better Auth（Passkeyサポート含む）による本番環境対応の認証
- ✅ Polar統合によるサブスクリプション管理
- ✅ Mantine Chartsによる高度なデータ可視化

---

## ✨ 主な機能

### 🎨 コア機能

#### **習慣管理**
- カスタムカラーで習慣を作成、編集、削除
- 認証によるユーザー固有の習慣分離
- Turso (libSQL)による永続的なストレージ

#### **日次トラッキング**
- 時間追跡付きの習慣完了記録
- 各記録へのオプションメモ追加
- カレンダーベースの日付選択

#### **データ可視化**
- 📊 **ヒートマップビュー**: GitHubスタイルの継続グラフで習慣の一貫性を表示
- 📅 **カレンダービュー**: 月/週/日表示で完了状況を確認
- 📈 **統計ダッシュボード**: 総習慣数、記録数、日次完了率を追跡
- 🎯 **トレンドチャート**: 習慣のパフォーマンスを時系列で可視化

### 🔐 認証とユーザー管理

#### **Better Auth統合**
- メール/パスワード認証
- GitHubでのOAuthサインイン
- パスワードレスログイン用のPasskey（WebAuthn）サポート
- セキュアなセッション管理

### 💳 サブスクリプションと決済

#### **Polar統合**
- Proプランのチェックアウトフロー
- サブスクリプション管理用カスタマーポータル
- 決済イベントのWebhook処理（支払い完了、有効化、キャンセル、失効）
- サインアップ時の自動顧客作成

### 🎨 UI/UX

- Mantine UIによるモダンでレスポンシブなデザイン
- 永続化されたダーク/ライトテーマ切り替え
- スムーズなアニメーションとトランジション
- モバイル最適化されたインターフェース

---

## 🛠 技術スタック

### フロントエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **TanStack Start** | ^1.131 | SSR対応Reactフレームワーク |
| **React** | ^19.0 | 最新のconcurrent機能を持つUIライブラリ |
| **TypeScript** | ^5.7 | 型安全な開発 |
| **Mantine UI** | ^8.3 | コンポーネントライブラリ |
| - Mantine Core | ^8.3 | コアコンポーネント＆テーマシステム |
| - Mantine Charts | ^8.3 | データ可視化（ヒートマップ、ラインチャート） |
| - Mantine Dates | ^8.3 | カレンダー＆日付ピッカー |
| - Mantine Forms | ^8.3 | フォーム状態管理 |
| - Mantine Modals | ^8.3 | モーダル管理 |
| - Mantine Notifications | ^8.3 | トースト通知 |
| **TailwindCSS** | ^4.0 | ユーティリティファーストCSS |
| **Tabler Icons** | ^3.35 | アイコンライブラリ |

### バックエンド＆データベース

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **TanStack Router** | ^1.130 | 型安全なファイルベースルーティング |
| **Drizzle ORM** | ^0.44 | 型安全なデータベース操作 |
| **Turso** (libSQL) | ^0.15 | SQLite互換クラウドデータベース |
| **Zod** | ^4.1 | ランタイムスキーマ検証 |

### 認証＆決済

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Better Auth** | ^1.3 | 認証ソリューション |
| **Polar** | ^1.1 | サブスクリプション＆決済管理 |
| **Polar SDK** | ^0.35 | Polar API統合 |

### 開発＆ビルドツール

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Vite** | ^6.3 | ビルドツール＆開発サーバー |
| **Bun** | Latest | パッケージマネージャー＆ランタイム |
| **Biome** | ^2.2 | リント＆フォーマット |
| **Vitest** | ^3.0 | ユニットテストフレームワーク |
| **PostCSS** | ^8.5 | CSS処理（Mantineプリセット） |

### デプロイメント

| 技術 | 用途 |
|------|------|
| **Cloudflare Workers** | サーバーレスデプロイプラットフォーム |
| **Wrangler** | Cloudflare CLIツール |

---

## 🏗 システムアーキテクチャ

### システム構成図

```mermaid
graph TB
    Client[クライアント<br/>React 19 + TanStack Start]
    Server[サーバー関数<br/>createServerFn]
    DB[(Turso Database<br/>libSQL/SQLite)]
    Auth[Better Auth<br/>認証システム]
    Polar[Polar<br/>決済システム]

    Client -->|SSR/API呼び出し| Server
    Server -->|Drizzle ORM| DB
    Server -->|認証処理| Auth
    Server -->|サブスク管理| Polar
    Auth -->|セッション保存| DB
    Polar -->|Webhook| Server

    style Client fill:#61DAFB,stroke:#333,stroke-width:2px
    style Server fill:#FF4154,stroke:#333,stroke-width:2px
    style DB fill:#003B57,stroke:#333,stroke-width:2px,color:#fff
    style Auth fill:#9333EA,stroke:#333,stroke-width:2px,color:#fff
    style Polar fill:#3B82F6,stroke:#333,stroke-width:2px,color:#fff
```

### 認証フロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant A as アプリ
    participant BA as Better Auth
    participant DB as Database

    U->>A: サインイン
    A->>BA: 認証リクエスト
    BA->>DB: ユーザー確認
    DB-->>BA: ユーザー情報
    BA-->>A: セッション発行
    A-->>U: 認証完了

    Note over U,DB: 3つの認証方式<br/>1. Email/Password<br/>2. GitHub OAuth<br/>3. Passkey (WebAuthn)
```

### サブスクリプションフロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant A as アプリ
    participant P as Polar
    participant W as Webhookハンドラー
    participant DB as Database

    U->>A: Proプラン選択
    A->>P: チェックアウト開始
    P-->>U: 決済ページ表示
    U->>P: 決済完了
    P->>W: order.paid イベント
    W->>DB: ユーザー権限更新
    P-->>A: 成功リダイレクト
    A-->>U: サブスク有効化

    Note over P,W: Webhookイベント<br/>- order.paid<br/>- subscription.active<br/>- subscription.canceled<br/>- subscription.revoked
```

### データフロー

```mermaid
graph LR
    User[ユーザー入力] --> Form[フォーム<br/>Mantine + Zod]
    Form --> Validate[バリデーション]
    Validate --> ServerFn[Server Function]
    ServerFn --> Drizzle[Drizzle ORM]
    Drizzle --> Turso[(Turso DB)]
    Turso --> Drizzle
    Drizzle --> UI[UIコンポーネント]
    UI --> Viz[可視化<br/>Heatmap/Calendar]

    style User fill:#10B981,stroke:#333,stroke-width:2px
    style Form fill:#F59E0B,stroke:#333,stroke-width:2px
    style ServerFn fill:#EF4444,stroke:#333,stroke-width:2px
    style Turso fill:#003B57,stroke:#333,stroke-width:2px,color:#fff
    style Viz fill:#8B5CF6,stroke:#333,stroke-width:2px,color:#fff
```

---

## 📊 データベース設計

### ER図

```mermaid
erDiagram
    users ||--o{ habits : owns
    users ||--o{ records : creates
    users ||--o{ settings : has
    habits ||--o{ records : tracks
    users ||--o{ sessions : has
    users ||--o{ accounts : links
    users ||--o{ passkeys : registers

    users {
        text id PK
        text name
        text email UK
        boolean emailVerified
        text image
        timestamp createdAt
        timestamp updatedAt
    }

    habits {
        text id PK
        text name UK
        text description
        text color
        text userId FK
        timestamp createdAt
        timestamp updatedAt
    }

    records {
        text id PK
        text habitId FK
        text date
        boolean completed
        integer duration_minutes
        text notes
        text userId FK
        timestamp createdAt
        timestamp updatedAt
    }

    settings {
        text id PK
        text theme
        text userId FK
        timestamp createdAt
        timestamp updatedAt
    }

    sessions {
        text id PK
        text token UK
        text userId FK
        timestamp expiresAt
        text ipAddress
        text userAgent
        timestamp createdAt
        timestamp updatedAt
    }

    accounts {
        text id PK
        text accountId
        text providerId
        text userId FK
        text accessToken
        text refreshToken
        text idToken
        timestamp accessTokenExpiresAt
        timestamp refreshTokenExpiresAt
    }

    passkeys {
        text id PK
        text name
        text publicKey
        text credentialID
        text userId FK
        integer counter
        text deviceType
        boolean backedUp
        text transports
        timestamp createdAt
    }
```

### データベーススキーマ詳細

#### アプリケーションテーブル

**habits（習慣テーブル）**
- 習慣の定義とメタデータを保存
- ユーザーごとに分離（userId外部キー）
- カスタムカラー対応

**records（記録テーブル）**
- 日次の習慣実行記録
- 完了状態、時間、メモを含む
- 同一習慣・同一日付のユニーク制約

**settings（設定テーブル）**
- ユーザー設定とプリファレンス
- テーマ設定などを保存

#### Better Auth テーブル

**users（ユーザーテーブル）**
- ユーザーアカウント情報
- メール検証ステータス

**sessions（セッションテーブル）**
- アクティブセッション管理
- IPアドレス、ユーザーエージェント記録

**accounts（アカウントテーブル）**
- OAuth連携アカウント情報
- アクセストークン、リフレッシュトークン管理

**verifications（検証テーブル）**
- メール検証コード管理

**passkeys（Passkeyテーブル）**
- WebAuthn認証情報
- デバイスタイプ、公開鍵を保存

---

## 📁 ディレクトリ構造

### プロジェクト構造

```
src/
├── routes/                    # TanStack Router ファイルベースルート
│   ├── __root.tsx            # ルートレイアウト（プロバイダー設定）
│   ├── index.tsx             # ホームページ（ダッシュボード）
│   ├── habits/               # 習慣管理ルート
│   │   ├── index.tsx         # 習慣一覧
│   │   └── $habitId.tsx      # 習慣詳細（動的ルート）
│   ├── auth/                 # 認証ルート
│   │   ├── sign-in.tsx       # サインインページ
│   │   ├── sign-up.tsx       # サインアップページ
│   │   ├── sign-out.tsx      # サインアウトハンドラー
│   │   └── passkey-setup.tsx # Passkey登録
│   ├── checkout/             # 決済ルート
│   │   ├── index.tsx         # チェックアウトページ
│   │   └── success.tsx       # 成功コールバック
│   └── api/                  # サーバーサイドAPIルート
│       └── auth/$.ts         # Better Authハンドラー
│
├── features/                 # 機能ベースモジュール
│   ├── habits/               # 習慣トラッキング機能
│   │   ├── components/       # 習慣固有UIコンポーネント
│   │   ├── server/          # サーバー関数（CRUD操作）
│   │   ├── types/           # 型定義＆Zodスキーマ
│   │   ├── hooks/           # カスタムフック（useHabitColor）
│   │   └── utils/           # ユーティリティ関数（時間、カレンダー）
│   ├── auth/                # 認証機能
│   │   ├── components/      # 認証UI（Passkey、Portal）
│   │   └── server/          # 認証サーバー関数
│   ├── home/                # ホームダッシュボード機能
│   │   └── components/      # ダッシュボードコンポーネント
│   ├── theme/               # テーマ管理
│   │   ├── components/      # テーマ切り替え
│   │   └── server/          # テーマ永続化
│   └── root/                # ルートレベル機能
│
├── components/              # 共有コンポーネント
│   ├── ui/                  # 再利用可能UIコンポーネント
│   └── providers/           # コンテキストプロバイダー
│
├── db/                      # データベースレイヤー
│   ├── schema.ts            # Drizzleスキーマ定義
│   └── index.ts             # データベースクライアント
│
├── lib/                     # コアライブラリ
│   ├── auth.ts              # Better Auth設定
│   └── auth-client.ts       # 認証クライアントユーティリティ
│
└── theme/                   # Mantineテーマ設定
    └── index.ts             # テーマカスタマイズ
```

### 主要な設計パターン

1. **サーバー関数**: `createServerFn`による型安全なサーバーサイド操作
2. **Zodバリデーション**: すべてのユーザー入力とAPIレスポンスのランタイム検証
3. **ファイルベースルーティング**: TanStack Routerによる自動ルート生成
4. **機能ベース構成**: 関連するコンポーネント、フック、ロジックのコロケーション
5. **SSRデータローディング**: 最適なパフォーマンスのためのルートローダー

---

## 🚀 セットアップ手順

### 前提条件

- [Bun](https://bun.sh/)（最新バージョン）
- [Turso](https://turso.tech/)アカウント（データベース用）
- [Better Auth](https://www.better-auth.com/)セットアップ
- [Polar](https://polar.sh/)アカウント（決済用、オプション）
- GitHub OAuthアプリ（ソーシャルログイン用、オプション）

### 環境変数

プロジェクトルートに`.dev.vars`ファイルを作成：

```bash
# データベース（必須）
VITE_TURSO_CONNECTION_URL=your-turso-url
VITE_TURSO_AUTH_TOKEN=your-turso-token

# Better Auth（必須）
VITE_BETTER_AUTH_URL=http://localhost:3000
VITE_BETTER_AUTH_SECRET=your-secret-key

# GitHub OAuth（オプション）
VITE_GITHUB_CLIENT_ID=your-github-client-id
VITE_GITHUB_CLIENT_SECRET=your-github-client-secret

# Passkey設定（オプション）
VITE_PASSKEY_RP_ID=your-domain.com
VITE_PASSKEY_RP_NAME=Track

# Polar統合（オプション）
VITE_POLAR_ACCESS_TOKEN=your-polar-token
VITE_POLAR_SERVER=sandbox  # または production
VITE_POLAR_PRODUCT_ID=your-product-id
VITE_POLAR_WEBHOOK_SECRET=your-webhook-secret
```

### インストール

```bash
# 依存関係のインストール
bun install

# データベーススキーマの生成
bun run db:push

# 開発サーバーの起動
bun run dev
```

アプリケーションは`http://localhost:3000`で利用可能になります

---

## 💻 開発ガイド

### 利用可能なコマンド

```bash
# 開発
bun run dev              # ポート3000で開発サーバー起動
bun run cf:dev          # Cloudflareローカル開発サーバー起動

# ビルド＆本番
bun run build           # 本番用ビルド
bun run start           # 本番サーバー起動
bun run serve           # 本番ビルドプレビュー

# データベース
bun run db:generate     # マイグレーション生成
bun run db:migrate      # マイグレーション実行
bun run db:push         # スキーマ変更をプッシュ
bun run db:studio       # Drizzle Studio起動

# コード品質
bun run test            # Vitestテスト実行
bun run tsc             # TypeScript型チェック
bun run lint            # Biomeリント（自動修正）
bun run format          # Biomeコードフォーマット
bun run check           # Biome包括的チェック

# デプロイメント
bun run deploy          # Cloudflare Workersへデプロイ
bun run cf:build        # ビルド＆デプロイ
```

### 開発ワークフロー

#### 1. 機能の作成

```bash
# 機能ディレクトリの作成
mkdir -p src/features/your-feature/{components,server,types}
```

#### 2. ルートの追加

```bash
# ルートファイル追加（自動的にルート生成）
touch src/routes/your-route.tsx
```

#### 3. サーバー関数の実装

```typescript
// src/features/your-feature/server/functions.ts
import { createServerFn } from '@tanstack/react-start/server'
import { z } from 'zod'

export const yourFunction = createServerFn({ method: 'POST' })
  .validator((data: unknown) => yourSchema.parse(data))
  .handler(async ({ data }) => {
    // サーバーサイドロジック
    return { success: true }
  })
```

#### 4. 型安全なフォーム

```typescript
import { useForm, zodResolver } from '@mantine/form'
import { yourSchema } from './types/schemas'

const form = useForm({
  validate: zodResolver(yourSchema),
  initialValues: { /* ... */ }
})
```

---

## 🚢 デプロイメント

### Cloudflare Workers デプロイ

#### 1. Wranglerの設定

プロジェクトは`wrangler.json`で設定済み：

```json
{
  "name": "track-habit-app",
  "compatibility_date": "2025-09-27",
  "compatibility_flags": ["nodejs_compat"]
}
```

#### 2. 本番シークレットの設定

```bash
# データベース認証情報の設定
echo "your-turso-url" | bun wrangler secret put VITE_TURSO_CONNECTION_URL
echo "your-turso-token" | bun wrangler secret put VITE_TURSO_AUTH_TOKEN

# 認証シークレットの設定
echo "your-auth-url" | bun wrangler secret put VITE_BETTER_AUTH_URL
echo "your-auth-secret" | bun wrangler secret put VITE_BETTER_AUTH_SECRET

# その他の必要なシークレット...
```

#### 3. デプロイ

```bash
bun run cf:build    # ビルド＆デプロイ
# または
bun run deploy      # デプロイのみ
```

#### 4. デプロイの検証

- Cloudflare Workersダッシュボードで確認
- 認証フローのテスト
- データベース接続の確認
- Polar Webhook（設定している場合）のテスト

---

## 📚 技術的な学びと工夫

### 1. TanStack Startのマスタリー

- **ファイルベースルーティング**: 型安全なパラメータを持つ動的ルートの実装
- **サーバー関数**: 再利用可能で検証済みのサーバー操作の作成
- **SSR最適化**: 最適なデータフェッチのためのローダー活用
- **ストリーミング**: Suspenseによる段階的レンダリング

### 2. 認証アーキテクチャ

- **マルチプロバイダー認証**: Email/Password、OAuth（GitHub）、Passkeyの統合
- **セッション管理**: Better Authによる安全なセッション処理の実装
- **Passkey統合**: パスワードレス認証のためのWebAuthnサポート追加
- **ユーザー分離**: 適切なユーザー関係を持つデータベーススキーマ設計

### 3. 決済統合

- **Polarチェックアウト**: カスタム成功ハンドリングを伴うサブスクリプションフローの実装
- **Webhook管理**: 決済イベント（paid、active、canceled、revoked）の処理
- **カスタマーポータル**: セルフサービスサブスクリプション管理の統合
- **イベント駆動アーキテクチャ**: 非同期決済イベントの確実な処理

### 4. データベース設計

- **Drizzle ORM**: リレーションを持つ型安全なスキーマ設計
- **Turso (libSQL)**: SQLite互換クラウドデータベースの活用
- **データ整合性**: ユニーク制約とカスケード削除の実装
- **マイグレーション戦略**: Drizzle Kitによるスキーマバージョニング

### 5. データ可視化

- **Mantine Charts**: 習慣追跡用のヒートマップとラインチャートの構築
- **カレンダーコンポーネント**: カスタム月/週/日ビューの作成
- **日付ユーティリティ**: dayjsによる日本語ロケール実装
- **パフォーマンス**: 大規模データセットレンダリングの最適化

### 6. フルスタック型安全性

- **エンドツーエンド型**: クライアントとサーバー間での型共有
- **Zodバリデーション**: TypeScript型に一致するランタイム検証
- **フォームバリデーション**: Mantine FormとZodリゾルバーの統合
- **APIコントラクト**: 型安全なサーバー関数呼び出し

### 7. モダンUI/UX

- **Mantine UIシステム**: コンポーネントライブラリの効果的な活用
- **テーマ管理**: 永続的なテーマ切り替えの実装
- **レスポンシブデザイン**: デスクトップとモバイルの最適化
- **アクセシビリティ**: セマンティックHTMLとARIA属性の使用

### 8. DevOps＆デプロイメント

- **Cloudflare Workers**: サーバーレスアプリケーションのグローバルデプロイ
- **環境管理**: ローカルと本番環境の設定
- **CI/CD準備**: 自動デプロイ用スクリプトのセットアップ
- **モニタリング**: エラーバウンダリとロギングの統合

---

## 🎨 スクリーンショット

_アプリケーションがデプロイされたら、ここにスクリーンショットが追加されます_

### ダッシュボード
![ダッシュボード](docs/screenshots/dashboard.png)

### 習慣管理
![習慣管理](docs/screenshots/habits.png)

### ヒートマップ可視化
![ヒートマップ](docs/screenshots/heatmap.png)

### カレンダービュー
![カレンダー](docs/screenshots/calendar.png)

---

## 📝 ライセンス

このプロジェクトはMITライセンスの下でライセンスされています - 詳細は[LICENSE](LICENSE)ファイルを参照してください。

---

## 👤 著者

**Your Name**

- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Name](https://linkedin.com/in/yourprofile)
- ポートフォリオ: [yourportfolio.com](https://yourportfolio.com)

---

## 🙏 謝辞

- [TanStack](https://tanstack.com/) - 素晴らしいReactエコシステム
- [Mantine](https://mantine.dev/) - 美しいUIコンポーネント
- [Better Auth](https://www.better-auth.com/) - セキュアな認証
- [Polar](https://polar.sh/) - 決済統合
- [Turso](https://turso.tech/) - エッジデータベース
- [Cloudflare](https://www.cloudflare.com/) - グローバルデプロイメント

---

## 🤝 コントリビューション

コントリビューション、イシュー、機能リクエストを歓迎します！

[イシューページ](https://github.com/yourusername/track-habit-app/issues)をご確認ください。

---

<div align="center">
  TanStack Start、React、TypeScriptで🔥を込めて作成
</div>

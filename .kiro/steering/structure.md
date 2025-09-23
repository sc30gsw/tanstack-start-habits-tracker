# プロジェクト構造 - trak-daily-habits-app

**最終更新**: 2025-09-23
**包含モード**: Always Included

## ルートディレクトリ構成

```
/tanstack-start-demo (trak-daily-habits-app)
├── .kiro/                    # Kiro仕様駆動開発ファイル
│   ├── steering/            # プロジェクトステアリング文書
│   └── specs/              # 機能仕様書
├── .serena/                 # Serena MCPメモリファイル
├── .claude/                 # Claude Code設定
├── public/                  # 静的アセット
├── src/                     # ソースコード
├── node_modules/           # 依存関係
├── package.json            # パッケージ設定
├── tsconfig.json          # TypeScript設定
├── vite.config.ts         # Vite設定
├── drizzle.config.ts      # Drizzleデータベース設定
├── postcss.config.cjs     # PostCSS設定
├── biome.json             # Biome設定
├── CLAUDE.md              # Claude Code設定
├── REQUIREMENTS.md        # プロダクトバックログ
├── CODING-STANDARDS.md    # コーディング規約
└── README.md              # プロジェクト概要
```

## ソースコード構造（`src/`）

### TanStack Start準拠構造
```
src/
├── routes/                          # TanStack Routerファイルベースルーティング
│   ├── __root.tsx                  # ルートレイアウト（プロバイダー設定）
│   ├── index.tsx                   # ホームページルート
│   └── api/                        # サーバーサイドAPIルート
│       ├── habits.ts               # 習慣管理API
│       └── records.ts              # 記録管理API
├── features/                       # 機能ベースモジュール
│   ├── habits/                     # 習慣管理機能
│   │   ├── components/            # 習慣特化コンポーネント
│   │   │   ├── habit-form.tsx     # 習慣作成・編集フォーム
│   │   │   ├── habit-list.tsx     # 習慣一覧表示
│   │   │   └── habit-card.tsx     # 個別習慣カード
│   │   ├── server/                # 習慣関連Server Functions
│   │   │   ├── habit-functions.ts # 習慣CRUD操作
│   │   │   └── habit-validation.ts # 習慣データ検証
│   │   ├── types/                 # 習慣関連型定義
│   │   │   ├── schemas/           # Zodスキーマ定義
│   │   │   │   ├── habit-schema.ts # 習慣スキーマ
│   │   │   │   └── index.ts       # スキーマエクスポート
│   │   │   └── habit.ts          # 習慣TypeScript型
│   │   └── hooks/                 # 習慣特化カスタムフック
│   │       ├── use-habits.ts      # 習慣データ管理フック
│   │       └── use-habit-form.ts  # 習慣フォーム管理フック
│   ├── records/                   # 記録管理機能
│   │   ├── components/
│   │   │   ├── record-form.tsx    # 記録入力フォーム
│   │   │   ├── daily-tracker.tsx  # 日次記録追跡
│   │   │   └── time-input.tsx     # 時間入力コンポーネント
│   │   ├── server/
│   │   │   ├── record-functions.ts # 記録CRUD操作
│   │   │   └── record-validation.ts # 記録データ検証
│   │   ├── types/
│   │   │   ├── schemas/
│   │   │   │   ├── record-schema.ts # 記録スキーマ
│   │   │   │   └── index.ts
│   │   │   └── record.ts          # 記録TypeScript型
│   │   └── hooks/
│   │       ├── use-records.ts     # 記録データ管理フック
│   │       └── use-daily-tracking.ts # 日次追跡フック
│   ├── visualization/             # データ可視化機能
│   │   ├── components/
│   │   │   ├── habit-heatmap.tsx  # 習慣ヒートマップ
│   │   │   ├── calendar-view.tsx  # カレンダー表示
│   │   │   └── stats-dashboard.tsx # 統計ダッシュボード
│   │   ├── server/
│   │   │   └── chart-data.ts      # チャートデータ処理
│   │   ├── types/
│   │   │   └── chart.ts           # チャート関連型
│   │   └── hooks/
│   │       ├── use-heatmap-data.ts # ヒートマップデータフック
│   │       └── use-calendar-data.ts # カレンダーデータフック
│   └── root/                      # 既存のrootフィーチャー（カウンター）
│       ├── types/schemas/
│       │   └── count-schema.ts
│       └── server/
│           └── count-dto.ts
├── components/                    # 共有コンポーネント
│   ├── providers/                 # Contextプロバイダー
│   │   ├── mantine-provider.tsx   # Mantineテーマプロバイダー
│   │   ├── query-provider.tsx     # TanStack Queryプロバイダー
│   │   └── app-providers.tsx      # 統合プロバイダー
│   └── ui/                        # 共通UIコンポーネント
│       ├── layout/                # レイアウトコンポーネント
│       │   ├── header.tsx         # アプリケーションヘッダー
│       │   ├── navigation.tsx     # ナビゲーション
│       │   └── page-layout.tsx    # ページレイアウト
│       ├── forms/                 # 汎用フォームコンポーネント
│       │   ├── form-field.tsx     # フォームフィールド
│       │   ├── date-picker.tsx    # 日付ピッカー
│       │   └── time-input.tsx     # 時間入力
│       └── feedback/              # フィードバックコンポーネント
│           ├── loading-spinner.tsx # ローディング表示
│           ├── error-boundary.tsx  # エラー境界
│           └── empty-state.tsx     # 空状態表示
├── hooks/                         # グローバルカスタムフック
│   ├── use-local-storage.ts       # ローカルストレージフック
│   ├── use-debounce.ts           # デバウンスフック
│   └── use-theme.ts              # テーマ管理フック
├── theme/                         # Mantineテーマ設定
│   ├── index.ts                   # メインテーマ設定
│   ├── colors.ts                  # カスタムカラー定義
│   └── components.ts              # コンポーネントスタイルオーバーライド
├── db/                           # データベース関連
│   ├── index.ts                   # データベース接続設定
│   └── schema.ts                  # Drizzleスキーマ定義
├── types/                         # グローバル型定義
│   ├── api.ts                     # API応答型
│   ├── common.ts                  # 共通ユーティリティ型
│   └── database.ts               # データベース関連型
├── utils/                         # グローバルユーティリティ関数
│   ├── format.ts                  # フォーマッティングユーティリティ
│   ├── validation.ts             # バリデーションヘルパー
│   ├── date.ts                   # 日付操作ユーティリティ
│   └── api.ts                    # APIユーティリティ関数
├── constants/                     # アプリケーション定数
│   ├── routes.ts                  # ルートパス定数
│   ├── config.ts                  # 設定定数
│   └── habit-defaults.ts         # 習慣デフォルト値
├── styles/                        # グローバルスタイル
│   ├── globals.css               # グローバルCSSスタイル
│   └── components.css            # コンポーネント固有スタイル
├── router.tsx                     # ルーター設定
└── routeTree.gen.ts              # 生成されたルート木（自動生成）
```

## コード組織パターン

### 機能ベース組織化
- **コロケーション原則**: 関連するファイルを機能ごとにグループ化
- **ドメイン分離**: 各機能モジュールは独立したドメインを表現
- **依存関係管理**: 機能間の依存は最小限に抑制

### ファイル命名規則

#### ファイル名
- **kebab-case**: `habit-form.tsx`, `use-habits.ts`
- **拡張子**: `.tsx`（コンポーネント）、`.ts`（ロジック）
- **動的ルート**: `$habitId.tsx`（TanStack Router）

#### コンポーネント名
- **PascalCase**: `HabitForm`, `CalendarView`
- **説明的命名**: 目的と機能を明確に示す

#### 変数・関数名
- **camelCase**: `habitData`, `createHabit`
- **フック名**: `use`プレフィックス（`useHabits`）
- **Server Functions**: 動詞で開始（`createHabit`, `updateRecord`）

### インポート組織化

#### インポート順序
1. **Reactライブラリ**: `react`, `react-dom`
2. **外部ライブラリ**: `@mantine/core`, `dayjs`
3. **内部モジュール**:
   - コンポーネント（`~/components/`）
   - フック（`~/hooks/`）
   - 型（`~/types/`）
   - ユーティリティ（`~/utils/`）
4. **相対インポート**: `./local-component`

#### パスエイリアス使用
```typescript
// ✅ 推奨
import { HabitForm } from '~/features/habits/components/habit-form'
import { useHabits } from '~/features/habits/hooks/use-habits'

// ❌ 非推奨
import { HabitForm } from '../../../features/habits/components/habit-form'
```

## 主要アーキテクチャ原則

### 1. 型安全性重視
- **エンドツーエンド型安全**: データベースからUIまで一貫した型定義
- **Zodスキーマ統合**: ランタイム検証とTypeScript型の統合
- **Server Functions型検証**: サーバーサイド操作の厳密な型チェック

### 2. 責任分離
- **レイヤー分離**: プレゼンテーション、ビジネスロジック、データアクセス
- **機能モジュール**: 各機能の独立性とテストの容易性
- **共有コンポーネント**: 再利用可能な汎用コンポーネント

### 3. パフォーマンス最適化
- **コード分割**: 機能ごとの遅延読み込み
- **SSR/ストリーミング**: 初期ロード高速化
- **効率的なデータフェッチ**: TanStack Routerのキャッシング活用

### 4. 開発者体験
- **一貫した構造**: 予測可能なファイル配置
- **明確な命名**: 自己文書化されたコード
- **ツール統合**: Biome、TypeScript、Vitestの統合環境

## データベーススキーマ構造

### スキーマファイル組織
```
src/db/
├── schema.ts              # メインスキーマファイル
├── migrations/            # マイグレーションファイル
│   ├── 0001_initial.sql
│   └── 0002_add_habits.sql
└── seed/                  # シードデータ
    └── initial-data.ts
```

### 主要テーブル
- **habits**: 習慣定義テーブル
- **records**: 実行記録テーブル
- **settings**: ユーザー設定テーブル

## 設定ファイル構造

### TypeScript設定
- **baseUrl**: プロジェクトルート
- **paths**: `~/*` → `./src/*`
- **target**: ES2022
- **strict**: 有効

### Vite設定
- **ポート**: 3000（開発）
- **プラグイン**: React、TypeScriptパス
- **ビルド最適化**: コード分割とバンドル最適化

---

*このプロジェクト構造は、スケーラビリティ、保守性、開発効率を最大化するために設計されています。機能追加時は、この構造パターンに従って実装してください。*
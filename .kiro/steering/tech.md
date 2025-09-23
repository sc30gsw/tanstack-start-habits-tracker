# 技術スタック - trak-daily-habits-app

**最終更新**: 2025-09-23
**包含モード**: Always Included

## アーキテクチャ概要

**trak-daily-habits-app**は、モダンなWebアプリケーションアーキテクチャを採用し、TanStack Startを中核としたSSR対応のReactアプリケーションです。型安全性、パフォーマンス、開発者体験を重視した技術選択を行っています。

### 高レベル設計
```
Frontend (React 19)
    ↕
TanStack Router (File-based Routing)
    ↕
Server Functions (Validation Layer)
    ↕
Drizzle ORM (Type-safe Database)
    ↕
libSQL/Turso (Cloud Database)
```

## フロントエンド技術

### コアフレームワーク
- **TanStack Start v1.131.7**: SSR対応のモダンReactフレームワーク
  - ファイルベースルーティング
  - Server Functions統合
  - 型安全なナビゲーション
  - ストリーミングSSR対応

- **React v19.0.0**: 最新のReact機能活用
  - Concurrent Features
  - Improved Suspense
  - 最新のHooks API

- **TypeScript v5.7.2**: 型安全な開発環境
  - 厳格な型チェック
  - パスエイリアス設定（`~/*`）
  - ES2022ターゲット

### UIフレームワーク
- **Mantine UI v8.3.1**: 包括的なコンポーネントライブラリ
  - `@mantine/core`: 基本コンポーネントとテーマシステム
  - `@mantine/charts`: データ可視化コンポーネント（ヒートマップ）
  - `@mantine/dates`: カレンダーと日付ピッカー
  - `@mantine/hooks`: ユーティリティフック
  - `@mantine/modals`: モーダル管理

- **Tailwind CSS v4.0.6**: ユーティリティファーストCSS
  - `@tailwindcss/vite`: Vite統合
  - Mantineとの併用設計

### スタイリング設定
- **PostCSS v8.5.6**: CSS処理
  - `postcss-preset-mantine`: Mantine最適化
  - `postcss-simple-vars`: CSS変数サポート

## バックエンド技術

### データベース層
- **Drizzle ORM v0.44.5**: 型安全なORMソリューション
  - 完全なTypeScript統合
  - マイグレーション機能
  - スキーマ定義とコード生成

- **libSQL v0.15.15**: SQLiteベースのクラウドデータベース
  - Tursoクラウド対応
  - 高速なクエリ実行
  - 自動同期機能

### Server Functions
- **TanStack Router SSR Query v1.131.7**: サーバーサイド処理
  - 型安全なServer Functions
  - データ取得の最適化
  - エラーハンドリング統合

### バリデーション
- **Zod v4.1.5**: スキーマ検証ライブラリ
  - ランタイム型検証
  - TypeScript型推論
  - Server Functions入力検証

## 開発環境

### ビルドツール
- **Vite v6.3.5**: 高速開発サーバー・ビルドツール
  - HMR（Hot Module Replacement）
  - ESModules最適化
  - プラグインエコシステム

- **vite-tsconfig-paths v5.1.4**: TypeScriptパスエイリアス対応

### コード品質
- **Biome v2.2.2**: 統合された開発ツール
  - コードフォーマッティング
  - リンティング
  - 高速実行

### テスト環境
- **Vitest v3.0.5**: Vite統合テストフレームワーク
  - 高速実行
  - TypeScript対応
  - モックサポート

- **Testing Library**: コンポーネントテスト
  - `@testing-library/react v16.2.0`
  - `@testing-library/dom v10.4.0`

- **jsdom v26.0.0**: ブラウザ環境シミュレーション

### 追加ライブラリ
- **dayjs v1.11.18**: 日付操作ライブラリ
- **recharts v3.2.1**: 追加チャート機能
- **web-vitals v4.2.4**: パフォーマンス監視

## 開発コマンド

### 開発・実行
```bash
bun run dev          # 開発サーバー起動（ポート3000）
bun run start        # 本番サーバー起動
bun run build        # 本番ビルド
bun run serve        # ビルド結果のプレビュー
```

### 品質管理
```bash
bun run test         # Vitestユニットテスト実行
bun run tsc          # TypeScript型チェック
bun run lint         # Biomeリンティング（自動修正）
bun run format       # Biomeコードフォーマット
bun run check        # Biome包括チェック
```

### パッケージ管理
```bash
bun install         # 依存関係インストール
bun add <package>   # 新しい依存関係追加
bun add -d <package> # 開発依存関係追加
```

## 環境設定

### ポート設定
- **開発サーバー**: 3000（デフォルト）
- **プレビューサーバー**: 4173（Viteデフォルト）

### 環境変数
```env
# データベース接続（libSQL/Turso）
VITE_TURSO_CONNECTION_URL= # Tursoデータベース接続URL
VITE_TURSO_AUTH_TOKEN= # Turso認証トークン

```

### TypeScript設定
- **ターゲット**: ES2022
- **モジュール**: ESNext
- **厳格モード**: 有効
- **パスエイリアス**: `~/*` → `./src/*`

## パフォーマンス最適化

### フロントエンド最適化
- SSR/ストリーミングによる初期ロード高速化
- TanStack Routerのビルトインキャッシング
- コード分割とレイジーローディング
- Viteの最適化されたバンドリング

### データベース最適化
- Drizzle ORMによる効率的なクエリ生成
- libSQL/Tursoの高速クエリ実行
- 適切なインデックス設計

## セキュリティ考慮事項

### データ検証
- Zodスキーマによる厳密な入力検証
- Server Functions層でのサーバーサイド検証
- XSS/CSRF対策の実装

### データベースセキュリティ
- Tursoクラウドの暗号化
- 認証トークンによるアクセス制御
- 環境変数による機密情報管理

## 開発原則

### 型安全性
- エンドツーエンドの型安全な実装
- ZodスキーマとTypeScript型の統合
- ランタイム検証の徹底

### パフォーマンス
- 初期ページロード3秒以内
- データ取得・表示1秒以内
- ヒートマップ生成2秒以内

### 開発者体験
- 高速なHMRとビルド
- 一貫したコード品質ツール
- 明確なエラーメッセージ

---

*この技術仕様は、一貫した開発環境と技術選択を保証し、チーム全体の効率的な開発を支援するために維持されています。*
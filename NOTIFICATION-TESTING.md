# 通知システムのテスト方法

## 🚀 クイックテスト（推奨）

**一度に全ての通知タイプをテストする方法：**

```
http://localhost:3000/?testNotificationTime=test
```

このURLにアクセスすると、以下の通知が一度に生成されます：
- ✅ メインリマインダー
- ⚠️ 未完了の習慣（設定で有効化している場合）
- ⏭️ スキップした習慣（設定で有効化している場合）
- 📅 予定の習慣（設定で有効化している場合）
- 🔔 カスタムリマインダー

### コンソール出力例

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 FULL NOTIFICATION TEST STARTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📢 1. Generating main reminder...
   ✅ Main reminder created

⚠️  2. Checking incomplete habits...
📊 Today (2025-10-17): 2 incomplete habits
  ⚠️ Incomplete: 朝の運動
  ⚠️ Incomplete: 読書

⏭️  3. Checking skipped habits...
📊 Today (2025-10-17): 1 skipped habits
  ⏭️ Skipped: 瞑想

📅 4. Checking scheduled habits...
📊 Today (2025-10-17): 3 scheduled habits
  📅 Scheduled: 日記
  📅 Scheduled: 英語学習
  📅 Scheduled: プログラミング

🔔 5. Generating custom reminder...
   ✅ Custom reminder created

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ FULL NOTIFICATION TEST COMPLETED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## テストモードの使用方法

URLに `?testNotificationTime=HH:mm` または `?testNotificationTime=test` を追加することで通知をテストできます。

### 基本的な使い方

1. アプリにログインした状態で、設定画面で通知を有効化
2. URLに時刻パラメータを追加
3. コンソールログで通知生成の様子を確認

### モード1: フルテストモード（最も簡単）⭐️

**全ての通知を一度にテスト：**

```
http://localhost:3000/?testNotificationTime=test
```

- 時刻に関係なく、全ての通知タイプを即座に生成
- 各通知タイプの動作を一度に確認可能
- テスト準備が完了しているか確認するのに最適

### モード2: 特定時刻シミュレーション

### モード2: 特定時刻シミュレーション

任意の時刻で通知をテスト：

```
http://localhost:3000/?testNotificationTime=06:20
http://localhost:3000/?testNotificationTime=14:30
```

#### デフォルト通知時刻（9:00, 13:00, 17:00, 21:00）のテスト

```
http://localhost:3000/?testNotificationTime=09:00
http://localhost:3000/?testNotificationTime=13:00
http://localhost:3000/?testNotificationTime=17:00
http://localhost:3000/?testNotificationTime=21:00
```

これらの時刻では以下の通知が生成されます：
- ✅ メインリマインダー（常に生成）
- ⚠️ 未完了の習慣（設定で有効化している場合）
- ⏭️ スキップした習慣（設定で有効化している場合）
- 📅 予定の習慣（設定で有効化している場合）

#### カスタム時刻のテスト

設定画面で「日次リマインダー時刻」を設定後、その時刻でテスト：

```
# 例：14:30に設定した場合
http://localhost:3000/?testNotificationTime=14:30
```

カスタム時刻では以下の通知が生成されます：
- ✅ カスタムリマインダー（シンプルなリマインダーのみ）

## 通知種類のテスト準備

### テストシナリオの準備

フルテストモード（`?testNotificationTime=test`）を使う前に、以下のデータを準備しておくと、全ての通知タイプをテストできます：

#### 準備手順

1. **3つの習慣を作成**:
   - 習慣A: 「朝の運動」
   - 習慣B: 「読書」
   - 習慣C: 「瞑想」

2. **今日の日付でレコードを作成**:
   - 習慣A: `status = 'active'` → 未完了通知のテスト用
   - 習慣B: `status = 'skipped'` → スキップ通知のテスト用
   - 習慣C: レコードなし → 予定通知のテスト用

3. **設定で全ての通知を有効化**:
   - ✅ 通知を有効にする
   - ✅ 未完了の習慣リマインダー
   - ✅ スキップした習慣リマインダー
   - ✅ 予定の習慣リマインダー

4. **テスト実行**:
   ```
   http://localhost:3000/?testNotificationTime=test
   ```

5. **結果確認**:
   - コンソールログで各通知の生成を確認
   - 通知ポップオーバーで通知が表示されることを確認

---

## 個別の通知種類のテスト

### 1. 未完了の習慣通知をテストする

**準備：**
1. 習慣を作成
2. 今日の日付でレコードを作成（`status = 'active'`）
3. 設定で「未完了の習慣リマインダー」を有効化

**テスト：**
```
# フルテストモード
http://localhost:3000/?testNotificationTime=test

# または特定時刻でテスト
http://localhost:3000/?testNotificationTime=09:00
```

**期待される結果：**
- コンソールに `⚠️ Incomplete: [習慣名]` と表示
- 通知が生成される：「未完了: [習慣名]」

### 2. スキップした習慣通知をテストする

**準備：**
1. 習慣を作成
2. 今日の日付でレコードを作成（`status = 'skipped'`）
3. 設定で「スキップした習慣リマインダー」を有効化

**テスト：**
```
# フルテストモード
http://localhost:3000/?testNotificationTime=test

# または特定時刻でテスト
http://localhost:3000/?testNotificationTime=13:00
```

**期待される結果：**
- コンソールに `⏭️ Skipped: [習慣名]` と表示
- 通知が生成される：「スキップ: [習慣名]」

### 3. 予定の習慣通知をテストする

**準備：**
1. 習慣を作成
2. 今日の日付でレコードを作成**しない**（レコードなし）
3. 設定で「予定の習慣リマインダー」を有効化

**テスト：**
```
# フルテストモード
http://localhost:3000/?testNotificationTime=test

# または特定時刻でテスト
http://localhost:3000/?testNotificationTime=17:00
```

**期待される結果：**
- コンソールに `📅 Scheduled: [習慣名]` と表示
- 通知が生成される：「予定: [習慣名]」

## コンソールログの見方

### フルテストモードのログ

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 FULL NOTIFICATION TEST STARTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📢 1. Generating main reminder...
   ✅ Main reminder created

⚠️  2. Checking incomplete habits...
📊 Today (2025-10-17): 2 incomplete habits
  ⚠️ Incomplete: 朝の運動
  ⚠️ Incomplete: 読書

⏭️  3. Checking skipped habits...
📊 Today (2025-10-17): 1 skipped habits
  ⏭️ Skipped: 瞑想

📅 4. Checking scheduled habits...
📊 Today (2025-10-17): 3 scheduled habits
  📅 Scheduled: 日記
  📅 Scheduled: 英語学習
  📅 Scheduled: プログラミング

🔔 5. Generating custom reminder...
   ✅ Custom reminder created

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ FULL NOTIFICATION TEST COMPLETED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 特定時刻モードのログ

テストモードでは、以下のようなログが表示されます：

```
🧪 TEST MODE: Using test time 09:00 instead of actual time 14:23
📢 Generating default time notifications for 09:00
📊 Today (2025-10-17): 2 incomplete habits
  ⚠️ Incomplete: 朝の運動
  ⚠️ Incomplete: 読書
📊 Today (2025-10-17): 1 skipped habits
  ⏭️ Skipped: 瞑想
📊 Today (2025-10-17): 3 scheduled habits
  📅 Scheduled: 日記
  📅 Scheduled: 英語学習
  📅 Scheduled: プログラミング
```

## 重要な注意点

### タイムゾーン

- すべての時刻は **JST（日本時間）** で指定します
- データベースは **UTC** で保存されますが、自動的に変換されます

### 重複防止

- 同じ日付・時刻での通知は1回のみ生成されます
- **フルテストモード（`?testNotificationTime=test`）を繰り返す場合は、ページをリロード**してください
- 特定時刻モードの場合は、別の時刻でテストするか、日付が変わるまで待つ必要があります

### 設定の確認

通知をテストする前に、設定画面で以下を確認：

1. ✅ 通知を有効にする - **ON**
2. ✅ 未完了の習慣リマインダー - **ON**（テストしたい場合）
3. ✅ スキップした習慣リマインダー - **ON**（テストしたい場合）
4. ✅ 予定の習慣リマインダー - **ON**（テストしたい場合）

## トラブルシューティング

### 通知が生成されない

1. **コンソールにログが表示されるか確認**
   - 表示されない → 通知設定が無効、または時刻が一致していない
   - 表示される → サーバー関数のエラーを確認

2. **ブラウザのコンソールエラーを確認**
   - ネットワークエラー
   - 認証エラー

3. **データベースを確認**
   - 習慣が存在するか
   - レコードのstatusが正しいか
   - 日付が今日（JST）か

### テスト後のクリーンアップ

テストで生成された通知を削除するには：

1. 通知ポップオーバーを開く
2. 「すべて削除」または個別に削除
3. または、データベースから直接削除

## 本番環境での動作

- クライアントサイド実装のため、**アプリが開いている時のみ動作**
- 本番環境では **サーバーサイドCron Job** の実装を推奨
- Cloudflare Workers、Vercel Cron、AWS EventBridge などを検討

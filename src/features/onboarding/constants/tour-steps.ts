import type { OnboardingTourStep } from '@gfazioli/mantine-onboarding-tour'

const HOME_STEPS = [
  {
    id: 'welcome',
    title: 'Trackへようこそ!',
    content:
      '習慣追跡アプリTrackの使い方をご案内します。日々の習慣を記録し、継続状況を可視化しましょう。',
    focusRevealProps: {
      popoverProps: {
        position: 'bottom',
        offset: 10,
      },
    },
  },
  {
    id: 'stats-overview',
    title: '統計情報の確認',
    content: 'ここでは登録習慣数、総記録数、今日の完了数を一目で確認できます。',
    focusRevealProps: {
      popoverProps: {
        position: 'bottom',
        offset: 10,
      },
    },
  },
  {
    id: 'quick-action',
    title: '習慣一覧へ',
    content:
      'このボタンから習慣一覧ページに移動できます。習慣の作成・編集・記録はすべてここから行えます。',
    focusRevealProps: {
      popoverProps: {
        position: 'bottom',
        offset: 10,
      },
    },
  },
  {
    id: 'calendar-view',
    title: 'カレンダー表示',
    content:
      '月・週・日の3つの表示モードで習慣の実行状況を確認できます。日付を選択すると、その日の詳細が表示されます。',
    focusRevealProps: {
      popoverProps: {
        position: 'top',
        offset: 10,
      },
    },
  },
  {
    id: 'daily-habits',
    title: '今日の完了習慣',
    content:
      '選択した日付に完了した習慣を一覧で確認できます。共有ボタンで実績をシェアすることもできます。',
    focusRevealProps: {
      popoverProps: {
        position: 'top',
        offset: 10,
      },
    },
  },
  {
    id: 'heatmap-view',
    title: 'ヒートマップ',
    content:
      'GitHubスタイルのヒートマップで年間の継続状況を可視化します。色の濃さで活動量が分かります。',
    focusRevealProps: {
      popoverProps: {
        position: 'top',
        offset: 10,
      },
    },
  },
] as const satisfies OnboardingTourStep[]

const HABITS_STEPS = [
  {
    id: 'create-habit',
    title: '習慣を作成しよう',
    content: 'ここから新しい習慣を作成できます。習慣名、説明、カラー、優先度を設定しましょう。',
    focusRevealProps: {
      popoverProps: {
        position: 'bottom',
        offset: 10,
      },
    },
  },
  {
    id: 'habit-organizer',
    title: '習慣を整理',
    content:
      '検索、並び順、フィルタを使って習慣を見やすく整理できます。優先度別やキーワードで絞り込めます。',
    focusRevealProps: {
      popoverProps: {
        position: 'bottom',
        offset: 10,
      },
    },
  },
  {
    id: 'habit-card',
    title: '習慣カード',
    content:
      '各習慣の詳細を確認できます。編集・削除ボタンで習慣を管理し、「詳細」ボタンでは統計情報、レベル & バッジ、トレンドチャート、ヒートマップなどの詳細な分析を表示します。',
    focusRevealProps: {
      popoverProps: {
        position: 'right',
        offset: 10,
      },
    },
  },
  {
    id: 'calendar-view',
    title: 'カレンダー表示',
    content:
      '月・週・日の3つの表示モードで習慣の実行状況を確認できます。完了済みの習慣のみが表示されます。',
    focusRevealProps: {
      popoverProps: {
        position: 'left',
        offset: 10,
      },
    },
  },
  {
    id: 'time-usage-chart',
    title: '時間配分グラフ',
    content:
      '選択した期間の習慣別の時間配分を円グラフで確認できます。どの習慣にどれだけ時間を使ったかが一目でわかります。',
    focusRevealProps: {
      popoverProps: {
        position: 'left',
        offset: 10,
      },
    },
  },
  {
    id: 'panel-resize',
    title: 'パネルリサイズ',
    content:
      '左右のパネルサイズは中央のハンドルをドラッグして調整できます。お好みのレイアウトに変更しましょう。',
    focusRevealProps: {
      popoverProps: {
        position: 'right',
        offset: 10,
      },
    },
  },
] as const satisfies OnboardingTourStep[]

export const STEPS = {
  HOME: HOME_STEPS,
  HABITS: HABITS_STEPS,
} as const satisfies Record<string, readonly OnboardingTourStep[]>

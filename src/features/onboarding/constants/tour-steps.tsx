import type { OnboardingTourStep } from '@gfazioli/mantine-onboarding-tour'
import { List, Stack, Text, ThemeIcon } from '@mantine/core'
import {
  IconCalendar,
  IconChartPie,
  IconCheck,
  IconEdit,
  IconFilter,
  IconFlame,
  IconListCheck,
  IconPlus,
  IconResize,
  IconShare,
  IconSparkles,
  IconTrendingUp,
} from '@tabler/icons-react'

const HOME_STEPS = [
  {
    id: 'welcome',
    title: 'Trackへようこそ!',
    content: (
      <Stack gap="xs">
        <Text size="sm">習慣追跡アプリTrackの使い方をご案内します。</Text>
        <List
          size="sm"
          spacing="xs"
          icon={
            <ThemeIcon color="blue" size={20} radius="xl">
              <IconSparkles size={12} />
            </ThemeIcon>
          }
        >
          <List.Item>日々の習慣を記録</List.Item>
          <List.Item>継続状況を可視化</List.Item>
        </List>
      </Stack>
    ),
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
    content: (
      <Stack gap="xs">
        <Text size="sm">ここでは一目で確認できます：</Text>
        <List
          size="sm"
          spacing="xs"
          icon={
            <ThemeIcon color="teal" size={20} radius="xl">
              <IconTrendingUp size={12} />
            </ThemeIcon>
          }
        >
          <List.Item>登録習慣数</List.Item>
          <List.Item>総記録数</List.Item>
          <List.Item>今日の完了数</List.Item>
        </List>
      </Stack>
    ),
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
    content: (
      <Stack gap="xs">
        <Text size="sm">このボタンから習慣一覧ページに移動できます。</Text>
        <List
          size="sm"
          spacing="xs"
          icon={
            <ThemeIcon color="grape" size={20} radius="xl">
              <IconCheck size={12} />
            </ThemeIcon>
          }
        >
          <List.Item>習慣の作成</List.Item>
          <List.Item>習慣の編集</List.Item>
          <List.Item>記録の追加</List.Item>
        </List>
      </Stack>
    ),
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
    content: (
      <Stack gap="xs">
        <List
          size="sm"
          spacing="xs"
          icon={
            <ThemeIcon color="blue" size={20} radius="xl">
              <IconCalendar size={12} />
            </ThemeIcon>
          }
        >
          <List.Item>月・週・日の3つの表示モード</List.Item>
          <List.Item>習慣の実行状況を確認</List.Item>
          <List.Item>日付をクリックで詳細表示</List.Item>
        </List>
      </Stack>
    ),
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
    content: (
      <Stack gap="xs">
        <Text size="sm">選択した日付の完了習慣を確認</Text>
        <List
          size="sm"
          spacing="xs"
          icon={
            <ThemeIcon color="green" size={20} radius="xl">
              <IconListCheck size={12} />
            </ThemeIcon>
          }
        >
          <List.Item>完了習慣の一覧表示</List.Item>
          <List.Item>
            <IconShare size={14} style={{ display: 'inline', marginRight: 4 }} />
            共有ボタンで実績をシェア
          </List.Item>
        </List>
      </Stack>
    ),
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
    content: (
      <Stack gap="xs">
        <Text size="sm">GitHubスタイルのヒートマップ</Text>
        <List
          size="sm"
          spacing="xs"
          icon={
            <ThemeIcon color="orange" size={20} radius="xl">
              <IconFlame size={12} />
            </ThemeIcon>
          }
        >
          <List.Item>年間の継続状況を可視化</List.Item>
          <List.Item>色の濃さで活動量を表示</List.Item>
        </List>
      </Stack>
    ),
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
    content: (
      <Stack gap="xs">
        <Text size="sm">新しい習慣を作成できます</Text>
        <List
          size="sm"
          spacing="xs"
          icon={
            <ThemeIcon color="blue" size={20} radius="xl">
              <IconPlus size={12} />
            </ThemeIcon>
          }
        >
          <List.Item>習慣名</List.Item>
          <List.Item>説明</List.Item>
          <List.Item>カラー</List.Item>
          <List.Item>優先度</List.Item>
        </List>
      </Stack>
    ),
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
    content: (
      <Stack gap="xs">
        <Text size="sm">習慣を見やすく整理</Text>
        <List
          size="sm"
          spacing="xs"
          icon={
            <ThemeIcon color="violet" size={20} radius="xl">
              <IconFilter size={12} />
            </ThemeIcon>
          }
        >
          <List.Item>検索機能</List.Item>
          <List.Item>並び順の変更</List.Item>
          <List.Item>優先度フィルター</List.Item>
          <List.Item>キーワード絞り込み</List.Item>
        </List>
      </Stack>
    ),
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
    content: (
      <Stack gap="xs">
        <Text size="sm">各習慣の詳細を確認</Text>
        <List
          size="sm"
          spacing="xs"
          icon={
            <ThemeIcon color="teal" size={20} radius="xl">
              <IconEdit size={12} />
            </ThemeIcon>
          }
        >
          <List.Item>編集・削除ボタン</List.Item>
          <List.Item>統計情報</List.Item>
          <List.Item>レベル & バッジ</List.Item>
          <List.Item>トレンドチャート</List.Item>
          <List.Item>ヒートマップ</List.Item>
        </List>
      </Stack>
    ),
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
    content: (
      <Stack gap="xs">
        <List
          size="sm"
          spacing="xs"
          icon={
            <ThemeIcon color="blue" size={20} radius="xl">
              <IconCalendar size={12} />
            </ThemeIcon>
          }
        >
          <List.Item>月・週・日の表示モード</List.Item>
          <List.Item>習慣の実行状況</List.Item>
          <List.Item>完了済み習慣のみ表示</List.Item>
        </List>
      </Stack>
    ),
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
    content: (
      <Stack gap="xs">
        <Text size="sm">習慣別の時間配分を可視化</Text>
        <List
          size="sm"
          spacing="xs"
          icon={
            <ThemeIcon color="pink" size={20} radius="xl">
              <IconChartPie size={12} />
            </ThemeIcon>
          }
        >
          <List.Item>期間別の時間配分</List.Item>
          <List.Item>円グラフで表示</List.Item>
          <List.Item>使用時間が一目でわかる</List.Item>
        </List>
      </Stack>
    ),
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
    content: (
      <Stack gap="xs">
        <Text size="sm">レイアウトをカスタマイズ</Text>
        <List
          size="sm"
          spacing="xs"
          icon={
            <ThemeIcon color="cyan" size={20} radius="xl">
              <IconResize size={12} />
            </ThemeIcon>
          }
        >
          <List.Item>中央のハンドルをドラッグ</List.Item>
          <List.Item>左右のパネルサイズを調整</List.Item>
          <List.Item>お好みのレイアウトに変更</List.Item>
        </List>
      </Stack>
    ),
    focusRevealProps: {
      popoverProps: {
        position: 'right-start',
        offset: 10,
      },
    },
  },
] as const satisfies OnboardingTourStep[]

export const STEPS = {
  HOME: HOME_STEPS,
  HABITS: HABITS_STEPS,
} as const satisfies Record<string, readonly OnboardingTourStep[]>

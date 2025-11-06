import type { OnboardingTourStep } from '@gfazioli/mantine-onboarding-tour'
import { List, Stack, Text, ThemeIcon } from '@mantine/core'
import {
  IconArrowsHorizontal,
  IconArrowsSort,
  IconAward,
  IconCalendarEvent,
  IconCalendarTime,
  IconChartBar,
  IconChartGridDots,
  IconChartLine,
  IconChartPie,
  IconCirclePlus,
  IconClick,
  IconClock,
  IconDatabase,
  IconEdit,
  IconEye,
  IconFileText,
  IconFilter,
  IconFilterCheck,
  IconGripVertical,
  IconLayout,
  IconLetterCase,
  IconList,
  IconListCheck,
  IconPalette,
  IconPlus,
  IconProgress,
  IconSearch,
  IconShare,
  IconStar,
  IconTrendingUp,
  IconZoomQuestion,
} from '@tabler/icons-react'

const HOME_STEPS = [
  {
    id: 'welcome',
    title: 'Trackへようこそ!',
    content: (
      <Stack pr="xl" w={340}>
        <Text size="sm">習慣追跡アプリTrackの使い方をご案内します。</Text>
        <List size="sm" spacing="xs">
          <List.Item
            icon={
              <ThemeIcon color="blue" size={18} radius="xl">
                <IconEdit size={10} />
              </ThemeIcon>
            }
          >
            日々の習慣を記録
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="cyan" size={18} radius="xl">
                <IconChartLine size={10} />
              </ThemeIcon>
            }
          >
            継続状況を可視化
          </List.Item>
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
      <Stack gap="xs" w={330}>
        <Text size="sm">ここでは一目で確認できます：</Text>
        <List size="sm" spacing="xs">
          <List.Item
            icon={
              <ThemeIcon color="teal" size={18} radius="xl">
                <IconList size={10} />
              </ThemeIcon>
            }
          >
            登録習慣数
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="blue" size={18} radius="xl">
                <IconDatabase size={10} />
              </ThemeIcon>
            }
          >
            総記録数
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="green" size={18} radius="xl">
                <IconListCheck size={10} />
              </ThemeIcon>
            }
          >
            今日の完了数
          </List.Item>
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
      <Stack gap="xs" w={330}>
        <Text size="sm">このボタンから習慣一覧ページに移動できます。</Text>
        <List size="sm" spacing="xs">
          <List.Item
            icon={
              <ThemeIcon color="grape" size={18} radius="xl">
                <IconPlus size={10} />
              </ThemeIcon>
            }
          >
            習慣の作成
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="violet" size={18} radius="xl">
                <IconEdit size={10} />
              </ThemeIcon>
            }
          >
            習慣の編集
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="indigo" size={18} radius="xl">
                <IconCirclePlus size={10} />
              </ThemeIcon>
            }
          >
            記録の追加
          </List.Item>
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
      <Stack gap="xs" w={330}>
        <List size="sm" spacing="xs">
          <List.Item
            icon={
              <ThemeIcon color="blue" size={18} radius="xl">
                <IconCalendarEvent size={10} />
              </ThemeIcon>
            }
          >
            月・週・日の3つの表示モード
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="cyan" size={18} radius="xl">
                <IconEye size={10} />
              </ThemeIcon>
            }
          >
            習慣の実行状況を確認
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="teal" size={18} radius="xl">
                <IconClick size={10} />
              </ThemeIcon>
            }
          >
            日付をクリックで詳細表示
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
    id: 'daily-habits',
    title: '今日の完了習慣',
    content: (
      <Stack gap="xs" w={330}>
        <Text size="sm">選択した日付の完了習慣を確認</Text>
        <List size="sm" spacing="xs">
          <List.Item
            icon={
              <ThemeIcon color="green" size={18} radius="xl">
                <IconListCheck size={10} />
              </ThemeIcon>
            }
          >
            完了習慣の一覧表示
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="blue" size={18} radius="xl">
                <IconShare size={10} />
              </ThemeIcon>
            }
          >
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
      <Stack gap="xs" w={330}>
        <Text size="sm">GitHubスタイルのヒートマップ</Text>
        <List size="sm" spacing="xs">
          <List.Item
            icon={
              <ThemeIcon color="orange" size={18} radius="xl">
                <IconCalendarTime size={10} />
              </ThemeIcon>
            }
          >
            年間の継続状況を可視化
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="red" size={18} radius="xl">
                <IconPalette size={10} />
              </ThemeIcon>
            }
          >
            色の濃さで活動量を表示
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
] as const satisfies OnboardingTourStep[]

const HABITS_STEPS = [
  {
    id: 'create-habit',
    title: '習慣を作成しよう',
    content: (
      <Stack gap="xs" w={330}>
        <Text size="sm">新しい習慣を作成できます</Text>
        <List size="sm" spacing="xs">
          <List.Item
            icon={
              <ThemeIcon color="blue" size={18} radius="xl">
                <IconLetterCase size={10} />
              </ThemeIcon>
            }
          >
            習慣名
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="cyan" size={18} radius="xl">
                <IconFileText size={10} />
              </ThemeIcon>
            }
          >
            説明
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="pink" size={18} radius="xl">
                <IconPalette size={10} />
              </ThemeIcon>
            }
          >
            カラー
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="yellow" size={18} radius="xl">
                <IconStar size={10} />
              </ThemeIcon>
            }
          >
            優先度
          </List.Item>
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
      <Stack gap="xs" w={330}>
        <Text size="sm">習慣を見やすく整理</Text>
        <List size="sm" spacing="xs">
          <List.Item
            icon={
              <ThemeIcon color="violet" size={18} radius="xl">
                <IconSearch size={10} />
              </ThemeIcon>
            }
          >
            検索機能
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="grape" size={18} radius="xl">
                <IconArrowsSort size={10} />
              </ThemeIcon>
            }
          >
            並び順の変更
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="indigo" size={18} radius="xl">
                <IconFilter size={10} />
              </ThemeIcon>
            }
          >
            優先度フィルター
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="blue" size={18} radius="xl">
                <IconZoomQuestion size={10} />
              </ThemeIcon>
            }
          >
            キーワード絞り込み
          </List.Item>
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
      <Stack gap="xs" w={330}>
        <Text size="sm">各習慣の詳細を確認</Text>
        <List size="sm" spacing="xs">
          <List.Item
            icon={
              <ThemeIcon color="teal" size={18} radius="xl">
                <IconEdit size={10} />
              </ThemeIcon>
            }
          >
            編集・削除ボタン
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="blue" size={18} radius="xl">
                <IconChartBar size={10} />
              </ThemeIcon>
            }
          >
            統計情報
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="yellow" size={18} radius="xl">
                <IconAward size={10} />
              </ThemeIcon>
            }
          >
            レベル & バッジ
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="green" size={18} radius="xl">
                <IconTrendingUp size={10} />
              </ThemeIcon>
            }
          >
            トレンドチャート
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="orange" size={18} radius="xl">
                <IconChartGridDots size={10} />
              </ThemeIcon>
            }
          >
            ヒートマップ
          </List.Item>
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
      <Stack gap="xs" w={330}>
        <List size="sm" spacing="xs">
          <List.Item
            icon={
              <ThemeIcon color="blue" size={18} radius="xl">
                <IconCalendarEvent size={10} />
              </ThemeIcon>
            }
          >
            月・週・日の表示モード
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="cyan" size={18} radius="xl">
                <IconProgress size={10} />
              </ThemeIcon>
            }
          >
            習慣の実行状況
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="green" size={18} radius="xl">
                <IconFilterCheck size={10} />
              </ThemeIcon>
            }
          >
            完了済み習慣のみ表示
          </List.Item>
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
      <Stack gap="xs" w={330}>
        <Text size="sm">習慣別の時間配分を可視化</Text>
        <List size="sm" spacing="xs">
          <List.Item
            icon={
              <ThemeIcon color="pink" size={18} radius="xl">
                <IconClock size={10} />
              </ThemeIcon>
            }
          >
            期間別の時間配分
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="grape" size={18} radius="xl">
                <IconChartPie size={10} />
              </ThemeIcon>
            }
          >
            円グラフで表示
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="cyan" size={18} radius="xl">
                <IconEye size={10} />
              </ThemeIcon>
            }
          >
            使用時間が一目でわかる
          </List.Item>
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
      <Stack gap="xs" w={330}>
        <Text size="sm">レイアウトをカスタマイズ</Text>
        <List size="sm" spacing="xs">
          <List.Item
            icon={
              <ThemeIcon color="cyan" size={18} radius="xl">
                <IconGripVertical size={10} />
              </ThemeIcon>
            }
          >
            中央のハンドルをドラッグ
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="blue" size={18} radius="xl">
                <IconArrowsHorizontal size={10} />
              </ThemeIcon>
            }
          >
            左右のパネルサイズを調整
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="violet" size={18} radius="xl">
                <IconLayout size={10} />
              </ThemeIcon>
            }
          >
            お好みのレイアウトに変更
          </List.Item>
        </List>
      </Stack>
    ),
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

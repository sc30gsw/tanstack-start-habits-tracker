import { createTheme } from '@mantine/core'

export const theme = createTheme({
  /** Trak習慣追跡アプリのテーマ設定 */

  // カラーパレット
  primaryColor: 'blue',
  colors: {
    // カスタムカラーパレット（習慣追跡アプリ向け）
    success: [
      '#e8f5e8',
      '#d3f0d3',
      '#a8e6a8',
      '#7dd87d',
      '#5cc85c',
      '#4ade80', // メインの成功カラー
      '#22c55e',
      '#16a34a',
      '#15803d',
      '#166534',
    ],
    habit: [
      '#e0f2fe',
      '#b3e5fc',
      '#81d4fa',
      '#4fc3f7',
      '#29b6f6',
      '#03a9f4', // メインの習慣カラー
      '#039be5',
      '#0288d1',
      '#0277bd',
      '#01579b',
    ],
    duration: [
      '#fff3e0',
      '#ffe0b2',
      '#ffcc80',
      '#ffb74d',
      '#ffa726',
      '#ff9800', // メインの時間カラー
      '#fb8c00',
      '#f57700',
      '#ef6c00',
      '#e65100',
    ],
  },

  // タイポグラフィ
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontFamilyMonospace: 'Monaco, Consolas, "Lucida Console", "Courier New", monospace',

  headings: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontWeight: '600',
    sizes: {
      h1: { fontSize: '2rem', lineHeight: '1.2' },
      h2: { fontSize: '1.75rem', lineHeight: '1.25' },
      h3: { fontSize: '1.5rem', lineHeight: '1.3' },
      h4: { fontSize: '1.25rem', lineHeight: '1.35' },
      h5: { fontSize: '1.125rem', lineHeight: '1.4' },
      h6: { fontSize: '1rem', lineHeight: '1.4' },
    },
  },

  // スペーシング
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },

  // ボーダーラディウス
  radius: {
    xs: '0.25rem',
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },

  // ブレイクポイント（MacBook最適化）
  breakpoints: {
    xs: '36em', // 576px
    sm: '48em', // 768px
    md: '62em', // 992px
    lg: '75em', // 1200px
    xl: '88em', // 1408px (MacBook Pro 16inch対応)
  },

  // コンポーネントのデフォルトスタイル
  components: {
    Container: {
      defaultProps: {
        sizes: {
          xs: '100%',
          sm: '540px',
          md: '720px',
          lg: '960px',
          xl: '1140px',
        },
      },
    },

    Button: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        root: {
          fontWeight: 500,
          transition: 'all 0.2s ease',
        },
      },
    },

    Card: {
      defaultProps: {
        radius: 'md',
        shadow: 'sm',
      },
      styles: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },

    Badge: {
      defaultProps: {
        radius: 'sm',
      },
    },

    Input: {
      defaultProps: {
        radius: 'md',
      },
    },

    NumberInput: {
      defaultProps: {
        radius: 'md',
      },
    },
  },

  // その他の設定
  other: {
    // 習慣追跡アプリ固有の設定
    habitColors: {
      completed: '#4ade80',
      partial: '#fbbf24',
      missed: '#f87171',
      none: '#e5e7eb',
    },
    heatmapColors: {
      level0: '#ebedf0',
      level1: '#c6e48b',
      level2: '#7bc96f',
      level3: '#239a3b',
      level4: '#196127',
    },
  },
})

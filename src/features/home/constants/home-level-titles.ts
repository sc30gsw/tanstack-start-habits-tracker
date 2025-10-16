import type { HomeAggregatedLevel, HomeBadge } from '~/features/home/types/home-level'

export type HomeLevelInfo = Record<'maxLevel' | 'minLevel', number> &
  Record<'info', Pick<HomeBadge, 'title' | 'icon' | 'color'> & Record<'description', string>>

export const HOME_LEVEL_TITLES = [
  {
    minLevel: 1,
    maxLevel: 10,
    info: {
      title: '初心者',
      icon: '🌱',
      color: 'green',
      description: '習慣の旅を始めたばかり。少しずつ継続していきましょう。',
    },
  },
  {
    minLevel: 11,
    maxLevel: 30,
    info: {
      title: '実践者',
      icon: '🌿',
      color: 'teal',
      description: '習慣が定着し始めています。この調子で続けましょう。',
    },
  },
  {
    minLevel: 31,
    maxLevel: 60,
    info: {
      title: '達人',
      icon: '🌳',
      color: 'blue',
      description: '習慣がライフスタイルの一部になっています。素晴らしい継続力です。',
    },
  },
  {
    minLevel: 61,
    maxLevel: 100,
    info: {
      title: 'マスター',
      icon: '🏆',
      color: 'violet',
      description: '習慣のマスター。圧倒的な継続力と成長を遂げています。',
    },
  },
  {
    minLevel: 101,
    maxLevel: Number.POSITIVE_INFINITY,
    info: {
      title: '伝説',
      icon: '👑',
      color: 'yellow',
      description: '伝説の領域。習慣の達人として極限の継続力を発揮しています。',
    },
  },
] as const satisfies readonly HomeLevelInfo[]

export function getHomeLevelInfo(totalLevel: HomeAggregatedLevel['totalLevel']) {
  const levelInfo = HOME_LEVEL_TITLES.find(
    (item) => totalLevel >= item.minLevel && totalLevel <= item.maxLevel,
  )

  return levelInfo || HOME_LEVEL_TITLES[0]
}

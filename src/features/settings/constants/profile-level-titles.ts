import type { ProfileAggregatedLevel, ProfileBadge } from '~/features/settings/types/profile-level'

export type ProfileLevelInfo = Record<'maxLevel' | 'minLevel', number> &
  Record<'info', Pick<ProfileBadge, 'title' | 'icon' | 'color'> & Record<'description', string>>

export const PROFILE_LEVEL_TITLES = [
  {
    minLevel: 1,
    maxLevel: 10,
    info: {
      title: '初心者',
      icon: 'IconTarget',
      color: 'gray',
      description: '習慣の旅を始めたばかり。少しずつ継続していきましょう。',
    },
  },
  {
    minLevel: 11,
    maxLevel: 20,
    info: {
      title: '見習い',
      icon: 'IconSparkles',
      color: 'green',
      description: '習慣の基礎を学んでいます。継続の大切さを実感し始めています。',
    },
  },
  {
    minLevel: 21,
    maxLevel: 30,
    info: {
      title: '実践者',
      icon: 'IconShield',
      color: 'teal',
      description: '習慣が定着し始めています。この調子で続けましょう。',
    },
  },
  {
    minLevel: 31,
    maxLevel: 50,
    info: {
      title: '熟練者',
      icon: 'IconStar',
      color: 'cyan',
      description: '習慣が日常の一部になりつつあります。安定した継続力を発揮しています。',
    },
  },
  {
    minLevel: 51,
    maxLevel: 75,
    info: {
      title: '達人',
      icon: 'IconBolt',
      color: 'blue',
      description: '習慣がライフスタイルの一部になっています。素晴らしい継続力です。',
    },
  },
  {
    minLevel: 76,
    maxLevel: 100,
    info: {
      title: 'エキスパート',
      icon: 'IconFlame',
      color: 'indigo',
      description: '習慣の専門家。継続と成長が当たり前になっています。',
    },
  },
  {
    minLevel: 101,
    maxLevel: 200,
    info: {
      title: 'マスター',
      icon: 'IconAward',
      color: 'violet',
      description: '習慣のマスター。圧倒的な継続力と成長を遂げています。',
    },
  },
  {
    minLevel: 201,
    maxLevel: 300,
    info: {
      title: 'チャンピオン',
      icon: 'IconTrophy',
      color: 'grape',
      description: '習慣の頂点を目指す者。その継続力は称賛に値します。',
    },
  },
  {
    minLevel: 301,
    maxLevel: 400,
    info: {
      title: 'ヒーロー',
      icon: 'IconRocket',
      color: 'pink',
      description: '習慣のヒーロー。多くの人の目標となる存在です。',
    },
  },
  {
    minLevel: 401,
    maxLevel: 500,
    info: {
      title: 'レジェンド',
      icon: 'IconDiamond',
      color: 'red',
      description: '伝説の領域。習慣の達人として極限の継続力を発揮しています。',
    },
  },
  {
    minLevel: 501,
    maxLevel: 600,
    info: {
      title: 'セージ',
      icon: 'IconWand',
      color: 'orange',
      description: '賢者の境地。習慣を通じて人生を豊かにしています。',
    },
  },
  {
    minLevel: 601,
    maxLevel: 700,
    info: {
      title: 'タイタン',
      icon: 'IconCrown',
      color: 'yellow',
      description: '巨人の力。圧倒的な実績を積み重ねています。',
    },
  },
  {
    minLevel: 701,
    maxLevel: 800,
    info: {
      title: 'オラクル',
      icon: 'IconEye',
      color: 'lime',
      description: '予言者の眼。習慣の本質を深く理解しています。',
    },
  },
  {
    minLevel: 801,
    maxLevel: 900,
    info: {
      title: 'イモータル',
      icon: 'IconInfinity',
      color: 'cyan',
      description: '不滅の継続力。習慣が生命の一部となっています。',
    },
  },
  {
    minLevel: 901,
    maxLevel: 1000,
    info: {
      title: 'ディヴァイン',
      icon: 'IconMoon',
      color: 'teal',
      description: '神聖なる領域。習慣を極めた者だけが到達できる境地です。',
    },
  },
  {
    minLevel: 1001,
    maxLevel: 1200,
    info: {
      title: 'アセンデッド',
      icon: 'IconPlanet',
      color: 'blue',
      description: '昇華された存在。習慣の力で新たな次元に到達しました。',
    },
  },
  {
    minLevel: 1201,
    maxLevel: 1400,
    info: {
      title: 'トランセンデント',
      icon: 'IconStars',
      color: 'indigo',
      description: '超越者。習慣を通じて限界を超え続けています。',
    },
  },
  {
    minLevel: 1401,
    maxLevel: 1600,
    info: {
      title: 'コズミック',
      icon: 'IconZodiacGemini',
      color: 'violet',
      description: '宇宙の領域。その継続力は天文学的です。',
    },
  },
  {
    minLevel: 1601,
    maxLevel: 1800,
    info: {
      title: 'エターナル',
      icon: 'IconHourglass',
      color: 'grape',
      description: '永遠なる者。習慣が永続する力となっています。',
    },
  },
  {
    minLevel: 1801,
    maxLevel: 2000,
    info: {
      title: 'インフィニティ',
      icon: 'IconUniverse',
      color: 'pink',
      description: '無限の領域。習慣の究極を体現しています。',
    },
  },
  {
    minLevel: 2001,
    maxLevel: Number.POSITIVE_INFINITY,
    info: {
      title: 'アブソリュート',
      icon: 'IconAtom',
      color: 'red',
      description: '絶対者。全ての限界を超えた伝説中の伝説です。',
    },
  },
] as const satisfies readonly ProfileLevelInfo[]

export function getProfileLevelInfo(totalLevel: ProfileAggregatedLevel['totalLevel']) {
  const levelInfo = PROFILE_LEVEL_TITLES.find(
    (item) => totalLevel >= item.minLevel && totalLevel <= item.maxLevel,
  )

  return levelInfo || PROFILE_LEVEL_TITLES[0]
}

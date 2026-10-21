export const categories = {
  park: '公園・広場',
  public: '公共施設',
  cafe: 'カフェ',
  other: 'その他',
} as const;
export const costs = {
  free: '無料',
  paid: '有料',
  unknown: '料金未確認',
} as const;
// 地域検索用の概略中心。施設の入口や休憩席の位置を意味しない。
export const areas = [
  { id: 'sakae', name: '栄', lat: 35.1709, lon: 136.9084 },
  { id: 'hisaya', name: '久屋大通', lat: 35.1746, lon: 136.9083 },
  { id: 'yaba', name: '矢場町', lat: 35.1638, lon: 136.9082 },
] as const;
export const defaultFilters = {
  query: '',
  category: 'all',
  cost: 'all',
  radius: 3000,
} as const;

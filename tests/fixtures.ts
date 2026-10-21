import type { Spot } from '../src/lib/validation';
// Synthetic tests ONLY. Never copied to public/. Public validator rejects the fixture flag.
export const spot = {
  id: 'fixture-a',
  name: '架空テスト用の休憩場所A',
  category: 'park',
  lat: 35.1709,
  lon: 136.9084,
  address: 'テスト用の場所',
  cost: 'free',
  conditions: 'テスト用の条件',
  facilities: ['テスト用ベンチ'],
  sourceUrl: 'https://example.com/evidence',
  sourceLabel: 'テスト出典',
  rights: '合成テストデータ',
  verifiedAt: '2026-10-01',
  validUntil: '2099-12-31',
  published: true,
  fixture: true,
} as unknown as Spot;
export const spots: Spot[] = [
  spot,
  {
    ...spot,
    id: 'fixture-b',
    name: '架空テスト用のカフェB',
    category: 'cafe',
    cost: 'paid',
    lat: 35.172,
  },
  {
    ...spot,
    id: 'fixture-c',
    name: '架空テスト用の施設C',
    cost: 'unknown',
    lat: 35.19,
  },
];

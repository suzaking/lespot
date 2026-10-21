import { describe, it, expect } from 'vitest';
import { distanceMeters, searchSpots, formatDistance } from '../src/lib/search';
import { parseDataset } from '../src/lib/validation';
import { mapLinks } from '../src/lib/mapLinks';
import { defaultFilters, areas } from '../src/lib/config';
import { importCsv, columns } from '../scripts/csv';
import { spot, spots } from './fixtures';
const today = '2026-10-21';
// Sanitized synthetic input used ONLY to exercise validation contracts, never publication.
const record = {
  ...spot,
  id: 'validation-input',
  name: 'Validation input',
  fixture: false,
};
function dataset(changes: Record<string, unknown> = {}) {
  return { schemaVersion: 1, spots: [{ ...record, ...changes }] };
}
function csv(rows: Record<string, unknown>[]) {
  return (
    columns.join(',') +
    '\n' +
    rows
      .map((r) =>
        columns
          .map((c) => '"' + String(r[c] ?? '').replaceAll('"', '""') + '"')
          .join(','),
      )
      .join('\n')
  );
}
describe('distance and filters', () => {
  it('same position and known equatorial distance', () => {
    expect(distanceMeters(spot, spot)).toBe(0);
    expect(distanceMeters({ lat: 0, lon: 0 }, { lat: 0, lon: 1 })).toBeCloseTo(
      111194.93,
      1,
    );
  });
  it('sorts before rounding and breaks ties by ID', () => {
    expect(
      searchSpots([...spots].reverse(), areas[0], defaultFilters, today)[0]
        ?.spot.id,
    ).toBe(spot.id);
    expect(
      searchSpots(
        [
          { ...spot, id: 'b' },
          { ...spot, id: 'a' },
        ],
        spot,
        defaultFilters,
        today,
      ).map((r) => r.spot.id),
    ).toEqual(['a', 'b']);
  });
  it('combines query/category/cost/radius without unknown as free', () => {
    expect(
      searchSpots(spots, spot, { ...defaultFilters, cost: 'free' }, today),
    ).toHaveLength(1);
    expect(
      searchSpots(
        spots,
        spot,
        { ...defaultFilters, category: 'cafe', query: 'カフェ', cost: 'paid' },
        today,
      ),
    ).toHaveLength(1);
    expect(
      searchSpots(spots, spot, { ...defaultFilters, radius: 0 }, today),
    ).toHaveLength(1);
  });
  it('includes exact radius but excludes just below', () => {
    const radius = distanceMeters(spot, spots[1]!);
    expect(
      searchSpots([spots[1]!], spot, { ...defaultFilters, radius }, today),
    ).toHaveLength(1);
    expect(
      searchSpots(
        [spots[1]!],
        spot,
        { ...defaultFilters, radius: radius - 0.01 },
        today,
      ),
    ).toHaveLength(0);
  });
  it('stale facts do not match free filter', () => {
    expect(
      searchSpots(
        [{ ...spot, validUntil: '2026-10-20' }],
        spot,
        { ...defaultFilters, cost: 'free' },
        today,
      ),
    ).toHaveLength(0);
  });
  it('formats straight distances', () => {
    expect(formatDistance(0)).toBe('10m未満');
    expect(formatDistance(996)).toBe('約1.0km');
  });
});
describe('publication boundary', () => {
  it('accepts valid schema', () =>
    expect(parseDataset(dataset(), today).spots).toHaveLength(1));
  it.each([
    { fixture: true },
    { lat: 136.9, lon: 35.1 },
    { lat: NaN },
    { cost: 'yes' },
    { sourceUrl: 'javascript:alert(1)' },
    { sourceUrl: 'https://user:pass@example.com' },
    { published: false },
    { verifiedAt: '2099-01-01' },
    { verifiedAt: '2026-02-30' },
    { validUntil: '2020-01-01' },
    { name: '架空テスト用' },
    { id: 'fixture-a' },
    { extra: 'secret' },
  ])('rejects unsafe input %j', (input) =>
    expect(() => parseDataset(dataset(input), today)).toThrow(),
  );
  it('rejects duplicated IDs and unknown schema', () => {
    expect(() =>
      parseDataset({ schemaVersion: 1, spots: [record, record] }, today),
    ).toThrow();
    expect(() =>
      parseDataset({ schemaVersion: 2, spots: [] }, today),
    ).toThrow();
  });
  it('never includes unpublished rows in CSV output', () => {
    const output = importCsv(
      csv([
        { ...record, facilities: 'ベンチ|トイレ' },
        { id: 'draft', published: false, name: 'private secret' },
      ]),
      today,
    );
    expect(output.spots).toHaveLength(1);
    expect(JSON.stringify(output)).not.toContain('private secret');
  });
  it('handles quoted commas/newlines and BOM', () => {
    expect(
      importCsv(
        '\ufeff' + csv([{ ...record, conditions: 'a,b\n次の行' }]),
        today,
      ).spots[0]?.conditions,
    ).toBe('a,b\n次の行');
  });
  it('rejects empty coordinates, visibility typos, duplicate headers', () => {
    expect(() => importCsv(csv([{ ...record, lat: '' }]), today)).toThrow();
    expect(() =>
      importCsv(csv([{ ...record, published: 'yes' }]), today),
    ).toThrow();
    expect(() => importCsv('id,id\na,b')).toThrow();
  });
  it('rejects fixtures from CSV', () =>
    expect(() => importCsv(csv([spot]), today)).toThrow());
});
describe('external maps', () => {
  it('uses fixed HTTPS domains, encodes text, excludes origin', () => {
    for (const l of mapLinks({ ...spot, name: 'A & B # 駅' })) {
      const u = new URL(l.href);
      expect(['www.google.com', 'maps.apple.com']).toContain(u.host);
      expect(u.protocol).toBe('https:');
      expect(u.searchParams.has('origin')).toBe(false);
      expect(u.hash).toBe('');
    }
    expect(
      new URL(mapLinks(spot)[1]!.href).searchParams.get('destination'),
    ).toBe('35.1709,136.9084');
    expect(new URL(mapLinks(spot)[2]!.href).searchParams.get('viewpoint')).toBe(
      '35.1709,136.9084',
    );
  });
});

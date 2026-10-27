import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseDataset } from '../src/lib/validation';
import { exportCsv, importCsv } from '../scripts/csv';
import { areas, defaultFilters } from '../src/lib/config';
import { searchSpots } from '../src/lib/search';

const data = parseDataset(
  JSON.parse(readFileSync('data/bootstrap-spots.json', 'utf8')),
);

describe('published dataset', () => {
  it('contains no fixture, has evidence, and has unique valid IDs', () => {
    expect(data.spots.length).toBeGreaterThan(0);
    for (const spot of data.spots) {
      expect(spot.fixture).toBe(false);
      expect(spot.sourceUrl).toMatch(/^https:\/\//);
      expect(spot.rights.length).toBeGreaterThan(0);
    }
  });

  it('survives the same CSV round trip used for Sheets updates', () => {
    expect(importCsv(exportCsv(data))).toEqual(data);
  });

  it('rejects spreadsheet formula cells when exporting', () => {
    expect(() =>
      exportCsv({
        ...data,
        spots: data.spots.map((spot) => ({ ...spot, address: '=1+1' })),
      }),
    ).toThrow(/数式/);
  });

  it('finds published spots from the default area and radius', () => {
    const result = searchSpots(
      data.spots,
      areas[0],
      defaultFilters,
      '2026-10-21',
    );
    expect(result.map(({ spot }) => spot.id)).toEqual([
      'tsuruma-park',
      'noritake-garden',
      'shirakawa-science-museum-bench',
      'shimozono-park-bench-west',
      'shimozono-park-bench-northwest',
      'shimozono-park-bench-east',
      'nishi-osu-park-bench-east',
    ]);
  });
});

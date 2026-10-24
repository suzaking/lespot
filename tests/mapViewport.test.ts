import { describe, expect, it } from 'vitest';
import { isSpotInViewport } from '../src/lib/mapViewport';
import { spot } from './fixtures';

describe('map viewport search', () => {
  const viewport = {
    center: { lat: 35.1709, lon: 136.9084 },
    north: 35.18,
    south: 35.16,
    west: 136.9,
    east: 136.92,
  };
  it('includes only points inside the visible rectangle', () => {
    expect(isSpotInViewport(spot, viewport)).toBe(true);
    expect(isSpotInViewport({ ...spot, lat: 35.19 }, viewport)).toBe(false);
    expect(isSpotInViewport({ ...spot, lon: 136.95 }, viewport)).toBe(false);
  });
  it('handles date-line crossing rectangles', () => {
    expect(
      isSpotInViewport(
        { ...spot, lon: 179.8 },
        { ...viewport, west: 179, east: -179 },
      ),
    ).toBe(true);
    expect(isSpotInViewport(spot, { ...viewport, west: 179, east: -179 })).toBe(
      false,
    );
  });
});

import type { Coordinates, Spot } from './validation';
import { isFresh } from './validation';
export interface Filters {
  query: string;
  category: Spot['category'] | 'all';
  cost: Spot['cost'] | 'all';
  radius: number;
}
export type SearchResult = { spot: Spot; distance: number };
export function distanceMeters(a: Coordinates, b: Coordinates): number {
  const rad = Math.PI / 180;
  const h =
    Math.sin(((b.lat - a.lat) * rad) / 2) ** 2 +
    Math.cos(a.lat * rad) *
      Math.cos(b.lat * rad) *
      Math.sin(((b.lon - a.lon) * rad) / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, h))));
}
export function searchSpots(
  spots: Spot[],
  origin: Coordinates,
  filters: Filters,
  today: string,
): SearchResult[] {
  const q = filters.query.trim().normalize('NFKC').toLocaleLowerCase('ja');
  return spots
    .map((spot) => ({ spot, distance: distanceMeters(origin, spot) }))
    .filter(
      ({ spot: s, distance }) =>
        distance <= filters.radius &&
        (filters.category === 'all' || s.category === filters.category) &&
        (filters.cost === 'all' ||
          (s.cost === filters.cost &&
            (filters.cost === 'unknown' || isFresh(s, today)))) &&
        (!q ||
          `${s.name} ${s.address}`
            .normalize('NFKC')
            .toLocaleLowerCase('ja')
            .includes(q)),
    )
    .sort(
      (a, b) =>
        a.distance - b.distance ||
        (a.spot.id < b.spot.id ? -1 : a.spot.id > b.spot.id ? 1 : 0),
    );
}
export function formatDistance(meters: number): string {
  if (meters < 10) return '10m未満';
  const rounded = Math.round(meters / 10) * 10;
  return rounded < 1000 ? `約${rounded}m` : `約${(meters / 1000).toFixed(1)}km`;
}

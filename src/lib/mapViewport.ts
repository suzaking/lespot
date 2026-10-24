import type { Coordinates, Spot } from './validation';

export interface MapViewport {
  center: Coordinates;
  north: number;
  south: number;
  east: number;
  west: number;
}

export function isSpotInViewport(spot: Spot, viewport: MapViewport): boolean {
  const longitudeMatches =
    viewport.west <= viewport.east
      ? spot.lon >= viewport.west && spot.lon <= viewport.east
      : spot.lon >= viewport.west || spot.lon <= viewport.east;
  return (
    spot.lat >= viewport.south &&
    spot.lat <= viewport.north &&
    longitudeMatches
  );
}

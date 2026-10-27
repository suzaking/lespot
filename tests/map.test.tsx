import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { it, expect, vi } from 'vitest';
import type { StyleSpecification } from 'maplibre-gl';
import MapView from '../src/components/map/MapView';
import { spot } from './fixtures';

const mapState = vi.hoisted(() => ({
  options: null as unknown,
  map: null as unknown,
  markers: [] as { element: HTMLElement; removed: boolean }[],
}));

vi.mock('maplibre-gl', () => ({
  setWorkerUrl: vi.fn(),
  Map: class {
    listeners = new globalThis.Map<string, Set<() => void>>();
    container: HTMLElement;

    constructor(options: unknown) {
      mapState.options = options;
      mapState.map = this;
      this.container = (options as { container: HTMLElement }).container;
    }

    on(event: string, callback: () => void) {
      const listeners = this.listeners.get(event) ?? new Set();
      listeners.add(callback);
      this.listeners.set(event, listeners);
      return this;
    }

    off(event: string, callback: () => void) {
      this.listeners.get(event)?.delete(callback);
      return this;
    }

    getCenter() {
      return { lat: spot.lat, lng: spot.lon };
    }

    getBounds() {
      return {
        getNorth: () => spot.lat + 1,
        getSouth: () => spot.lat - 1,
        getEast: () => spot.lon + 1,
        getWest: () => spot.lon - 1,
      };
    }

    jumpTo() {}
    panTo() {}
    zoomIn = vi.fn();
    zoomOut = vi.fn();
    remove() {}
  },
  Marker: class {
    element: HTMLElement;
    removed = false;
    lat = 0;
    lon = 0;

    constructor(options: { element: HTMLElement }) {
      this.element = options.element;
      mapState.markers.push(this);
    }

    setLngLat([lon, lat]: [number, number]) {
      this.lon = lon;
      this.lat = lat;
      return this;
    }

    addTo() {
      (mapState.map as { container: HTMLElement }).container.appendChild(
        this.element,
      );
      return this;
    }

    getElement() {
      return this.element;
    }

    getLngLat() {
      return { lat: this.lat, lng: this.lon };
    }

    remove() {
      this.removed = true;
      this.element.remove();
      return this;
    }
  },
}));

it('names markers and supports click, keyboard, and selected state', async () => {
  mapState.options = null;
  mapState.map = null;
  mapState.markers = [];
  const onSelect = vi.fn();
  const results = [{ spot, distance: 0 }];
  const { rerender } = render(
    <MapView
      results={results}
      origin={spot}
      selected={null}
      onSelect={onSelect}
    />,
  );
  const marker = screen.getByRole('button', { name: `1 ${spot.name}を選択` });
  fireEvent.click(marker);
  expect(onSelect).toHaveBeenCalledWith(spot.id);
  marker.focus();
  await userEvent.keyboard(' ');
  expect(onSelect).toHaveBeenCalledTimes(2);
  rerender(
    <MapView
      results={results}
      origin={spot}
      selected={spot.id}
      onSelect={onSelect}
    />,
  );
  expect(marker).toHaveAttribute('aria-pressed', 'true');
});

it('loads OpenFreeMap with zoom controls and a road-only style transform', () => {
  mapState.options = null;
  mapState.map = null;
  mapState.markers = [];
  render(
    <MapView results={[]} origin={spot} selected={null} onSelect={vi.fn()} />,
  );

  const options = mapState.options as {
    style: string;
    transformStyle: (
      previous: StyleSpecification | undefined,
      next: StyleSpecification,
    ) => StyleSpecification;
  };
  expect(options.style).toBe('https://tiles.openfreemap.org/styles/positron');
  const filtered = options.transformStyle(undefined, {
    version: 8,
    sources: {
      openmaptiles: {
        type: 'vector',
        url: 'https://tiles.openfreemap.org/planet',
      },
      unused: { type: 'vector', url: 'https://example.com/tiles' },
    },
    glyphs: 'https://example.com/fonts/{fontstack}/{range}.pbf',
    sprite: 'https://example.com/sprite',
    layers: [
      { id: 'background', type: 'background' },
      {
        id: 'highway_minor',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
      },
      {
        id: 'place_label',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'place',
      },
      {
        id: 'building',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'building',
      },
    ],
  } as StyleSpecification);

  expect(filtered.layers.map(({ id }) => id)).toEqual([
    'background',
    'highway_minor',
  ]);
  expect(Object.keys(filtered.sources)).toEqual(['openmaptiles']);
  expect(filtered.glyphs).toBeUndefined();
  expect(filtered.sprite).toBeUndefined();
  expect(filtered.sources.openmaptiles).toHaveProperty('attribution');
  expect(
    screen.getByRole('button', { name: '地図を拡大' }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: '地図を縮小' }),
  ).toBeInTheDocument();
});

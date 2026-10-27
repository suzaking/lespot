import { useEffect, useRef, useState } from 'react';
import {
  Map as MapLibreMap,
  Marker,
  setWorkerUrl,
  type MapOptions,
} from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Coordinates } from '../../lib/validation';
import type { SearchResult } from '../../lib/search';
import type { MapViewport } from '../../lib/mapViewport';
import { roadOnlyMapStyle } from '../../lib/roadMapStyle';
import styles from './MapView.module.css';

setWorkerUrl(workerUrl);

export default function MapView({
  results,
  origin,
  selected,
  onSelect,
  onViewportChange,
  cameraKey = 0,
}: {
  results: SearchResult[];
  origin: Coordinates;
  selected: string | null;
  onSelect: (id: string) => void;
  onViewportChange?: (viewport: MapViewport) => void;
  cameraKey?: number;
}) {
  const container = useRef<HTMLDivElement>(null);
  const initialOrigin = useRef(origin);
  const map = useRef<MapLibreMap | null>(null);
  const markers = useRef(new Map<string, Marker>());
  const onSelectRef = useRef(onSelect);
  const onViewportRef = useRef(onViewportChange);
  const oldCameraKey = useRef(cameraKey);
  const [tileError, setTileError] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
    onViewportRef.current = onViewportChange;
  }, [onSelect, onViewportChange]);

  useEffect(() => {
    if (!container.current) return;
    const host = container.current;
    const markerStore = markers.current;
    let m: MapLibreMap;
    try {
      const options: MapOptions = {
        container: host,
        style: 'https://tiles.openfreemap.org/styles/positron',
        center: [initialOrigin.current.lon, initialOrigin.current.lat],
        zoom: 13,
        attributionControl: { compact: true },
        dragRotate: false,
        touchPitch: false,
        pitchWithRotate: false,
        transformStyle: (_previousStyle, nextStyle) =>
          roadOnlyMapStyle(nextStyle),
      };
      m = new MapLibreMap(options);
    } catch {
      queueMicrotask(() => setTileError(true));
      return;
    }
    map.current = m;

    let userMovePending = false;
    const markUserMove = () => {
      userMovePending = true;
    };
    const moved = () => {
      if (!userMovePending) return;
      userMovePending = false;
      const center = m.getCenter();
      const bounds = m.getBounds();
      onViewportRef.current?.({
        center: { lat: center.lat, lon: center.lng },
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    };
    const mapError = () => setTileError(true);
    const mapLoaded = () => setTileError(false);
    m.on('dragstart', markUserMove);
    m.on('zoomstart', markUserMove);
    m.on('moveend', moved);
    m.on('error', mapError);
    m.on('load', mapLoaded);

    return () => {
      m.off('dragstart', markUserMove);
      m.off('zoomstart', markUserMove);
      m.off('moveend', moved);
      m.off('error', mapError);
      m.off('load', mapLoaded);
      markerStore.forEach((marker) => marker.remove());
      markerStore.clear();
      m.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m || oldCameraKey.current === cameraKey) return;
    oldCameraKey.current = cameraKey;
    m.jumpTo({ center: [origin.lon, origin.lat], zoom: 14 });
  }, [cameraKey, origin]);

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    markers.current.forEach((marker) => marker.remove());
    markers.current.clear();
    results.forEach(({ spot }, i) => {
      const element = document.createElement('button');
      element.type = 'button';
      element.classList.add(styles.pin!);
      element.textContent = String(i + 1);
      element.setAttribute('aria-label', `${i + 1} ${spot.name}を選択`);
      element.setAttribute('aria-pressed', 'false');
      element.addEventListener('click', () => onSelectRef.current(spot.id));
      const marker = new Marker({ element, anchor: 'bottom' })
        .setLngLat([spot.lon, spot.lat])
        .addTo(m);
      markers.current.set(spot.id, marker);
    });
  }, [results]);

  useEffect(() => {
    for (const [id, marker] of markers.current) {
      marker.getElement().classList.toggle(styles.active!, id === selected);
      marker.getElement().setAttribute('aria-pressed', String(id === selected));
    }
    const marker = selected ? markers.current.get(selected) : undefined;
    if (marker) map.current?.panTo(marker.getLngLat(), { animate: false });
  }, [selected, results]);

  return (
    <div className={styles.wrapper}>
      <div
        ref={container}
        className={styles.map}
        aria-label="休憩スポットの地図"
      />
      {tileError && (
        <p role="status" className={styles.warning}>
          地図を読み込めません。一覧と外部地図リンクをご利用ください。
        </p>
      )}
      <div className={styles.zoomControls} aria-label="地図の拡大縮小">
        <button
          className={styles.zoomButton}
          type="button"
          aria-label="地図を拡大"
          onClick={() => map.current?.zoomIn()}
        >
          <span aria-hidden="true">＋</span>
        </button>
        <button
          className={styles.zoomButton}
          type="button"
          aria-label="地図を縮小"
          onClick={() => map.current?.zoomOut()}
        >
          <span aria-hidden="true">−</span>
        </button>
      </div>
      <p className={styles.caption}>
        道路を中心に表示します。番号は一覧と共通です。
      </p>
    </div>
  );
}

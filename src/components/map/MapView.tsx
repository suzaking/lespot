import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Coordinates } from '../../lib/validation';
import type { SearchResult } from '../../lib/search';
import type { MapViewport } from '../../lib/mapViewport';
import styles from './MapView.module.css';

type MapType = 'standard' | 'pale';

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
  const map = useRef<L.Map | null>(null);
  const markers = useRef(new Map<string, L.Marker>());
  const onSelectRef = useRef(onSelect);
  const onViewportRef = useRef(onViewportChange);
  const oldCameraKey = useRef(cameraKey);
  const [tileError, setTileError] = useState(false);
  const [mapType, setMapType] = useState<MapType>('standard');
  const baseLayers = useRef<Record<MapType, L.TileLayer> | null>(null);

  useEffect(() => {
    onSelectRef.current = onSelect;
    onViewportRef.current = onViewportChange;
  }, [onSelect, onViewportChange]);

  useEffect(() => {
    if (!container.current) return;
    const host = container.current;
    const markerStore = markers.current;
    const m = L.map(host, {
      scrollWheelZoom: true,
      zoomControl: false,
      attributionControl: true,
    }).setView([initialOrigin.current.lat, initialOrigin.current.lon], 13);
    map.current = m;
    L.control
      .zoom({
        position: 'bottomright',
        zoomInTitle: '拡大',
        zoomOutTitle: '縮小',
      })
      .addTo(m);

    const tileOptions: L.TileLayerOptions = {
      minZoom: 10,
      maxZoom: 18,
      attribution:
        '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener noreferrer">地理院タイル</a>',
    };
    const layers: Record<MapType, L.TileLayer> = {
      standard: L.tileLayer(
        'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
        tileOptions,
      ),
      pale: L.tileLayer(
        'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
        tileOptions,
      ),
    };
    baseLayers.current = layers;
    Object.values(layers).forEach((tiles) => {
      tiles.on('tileerror', () => setTileError(true));
      tiles.on('tileload', () => setTileError(false));
    });

    let userMovePending = false;
    const markUserMove = () => {
      userMovePending = true;
    };
    const trackControls = (event: PointerEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest('.leaflet-control-zoom')
      ) {
        markUserMove();
      }
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
    m.on('dragstart', markUserMove);
    m.on('moveend', moved);
    host.addEventListener('wheel', markUserMove, { passive: true });
    host.addEventListener('pointerdown', trackControls, true);

    const resize =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            m.invalidateSize();
          });
    resize?.observe(host);
    return () => {
      resize?.disconnect();
      host.removeEventListener('wheel', markUserMove);
      host.removeEventListener('pointerdown', trackControls, true);
      m.off('dragstart', markUserMove);
      m.off('moveend', moved);
      m.remove();
      map.current = null;
      markerStore.clear();
      baseLayers.current = null;
    };
  }, []);

  useEffect(() => {
    const m = map.current;
    const layers = baseLayers.current;
    if (!m || !layers) return;
    Object.values(layers).forEach((layer) => layer.remove());
    layers[mapType].addTo(m);
  }, [mapType]);

  useEffect(() => {
    const m = map.current;
    if (!m || oldCameraKey.current === cameraKey) return;
    oldCameraKey.current = cameraKey;
    m.setView([origin.lat, origin.lon], 14, { animate: false });
  }, [cameraKey, origin]);

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    for (const marker of markers.current.values()) marker.remove();
    markers.current.clear();
    results.forEach(({ spot }, i) => {
      const marker = L.marker([spot.lat, spot.lon], {
        keyboard: true,
        title: `${spot.name}を選択`,
        alt: `${spot.name}を選択`,
        icon: L.divIcon({
          className: styles.pin,
          html: String(i + 1),
          iconSize: [44, 44],
          iconAnchor: [22, 44],
        }),
      }).addTo(m);
      marker
        .getElement()
        ?.setAttribute('aria-label', `${i + 1} ${spot.name}を選択`);
      marker.on('click', () => onSelectRef.current(spot.id));
      marker.getElement()?.addEventListener('keydown', (event) => {
        if (event.key === ' ') {
          event.preventDefault();
          onSelectRef.current(spot.id);
        }
      });
      markers.current.set(spot.id, marker);
    });
  }, [results]);

  useEffect(() => {
    for (const [id, marker] of markers.current) {
      marker.getElement()?.classList.toggle(styles.active!, id === selected);
      marker
        .getElement()
        ?.setAttribute('aria-pressed', String(id === selected));
      marker.setZIndexOffset(id === selected ? 1000 : 0);
    }
    const marker = selected ? markers.current.get(selected) : undefined;
    if (marker) map.current?.panTo(marker.getLatLng(), { animate: false });
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
          地図の一部を読み込めません。一覧と外部地図リンクをご利用ください。
        </p>
      )}
      <button
        className={styles.mapTypeButton}
        type="button"
        aria-label={`${mapType === 'standard' ? '淡色地図' : '標準地図'}に切り替え`}
        title="地図の種類を切り替え"
        onClick={() =>
          setMapType((current) =>
            current === 'standard' ? 'pale' : 'standard',
          )
        }
      >
        {mapType === 'standard' ? '標準地図' : '淡色地図'}
      </button>
      <p className={styles.caption}>
        番号は一覧と共通です。ピンを選ぶとカードを表示します。
      </p>
    </div>
  );
}

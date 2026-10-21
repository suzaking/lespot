import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Coordinates } from '../../lib/validation';
import type { SearchResult } from '../../lib/search';
import styles from './MapView.module.css';
export default function MapView({
  results,
  origin,
  selected,
  onSelect,
}: {
  results: SearchResult[];
  origin: Coordinates;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef(new Map<string, L.Marker>());
  const selectRef = useRef(onSelect);
  const [tileError, setTileError] = useState(false);
  useEffect(() => {
    selectRef.current = onSelect;
  }, [onSelect]);
  useEffect(() => {
    if (!container.current) return;
    const markerStore = markers.current;
    const m = L.map(container.current, {
      scrollWheelZoom: false,
      zoomControl: false,
      attributionControl: true,
    }).setView([35.1709, 136.9084], 15);
    map.current = m;
    L.control.zoom({ zoomInTitle: '拡大', zoomOutTitle: '縮小' }).addTo(m);
    const tiles = L.tileLayer(
      'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
      {
        minZoom: 10,
        maxZoom: 18,
        attribution:
          '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener noreferrer">地理院タイル</a>',
      },
    );
    tiles.on('tileerror', () => setTileError(true));
    tiles.addTo(m);
    const resize = new ResizeObserver(() => m.invalidateSize());
    resize.observe(container.current);
    return () => {
      resize.disconnect();
      m.remove();
      map.current = null;
      markerStore.clear();
    };
  }, []);
  useEffect(() => {
    map.current?.setView([origin.lat, origin.lon], 15, { animate: false });
  }, [origin]);
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
      marker.getElement()?.setAttribute('aria-label', `${spot.name}を選択`);
      marker.on('click', () => selectRef.current(spot.id));
      marker.getElement()?.addEventListener('keydown', (event) => {
        if (event.key === ' ') {
          event.preventDefault();
          selectRef.current(spot.id);
        }
      });
      markers.current.set(spot.id, marker);
    });
  }, [results]);
  useEffect(() => {
    for (const [id, marker] of markers.current) {
      const element = marker.getElement();
      element?.classList.toggle(styles.active!, id === selected);
      element?.setAttribute('aria-pressed', String(id === selected));
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
      <p className={styles.caption}>
        番号は一覧と共通です。ピンを選ぶとカードを表示します。
      </p>
    </div>
  );
}

import { lazy, Suspense, useMemo, useState } from 'react';
import { areas, defaultFilters } from '../lib/config';
import { searchSpots, formatDistance, type Filters } from '../lib/search';
import type { Coordinates } from '../lib/validation';
import { useSpots } from '../hooks/useSpots';
import { useGeolocation } from '../hooks/useGeolocation';
import { SearchControls } from '../components/search/SearchControls';
import { SpotList } from '../components/spots/SpotList';
import { StatusPanel } from '../components/ui/StatusPanel';
import { MapBoundary } from '../components/ui/MapBoundary';
import styles from './App.module.css';

const MapView = lazy(() => import('../components/map/MapView'));

export default function App() {
  const data = useSpots();
  const [area, setArea] = useState('sakae');
  const [origin, setOrigin] = useState<Coordinates>(areas[0]);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [mapEnabled, setMapEnabled] = useState(true);

  const geo = useGeolocation((point) => {
    setOrigin(point);
    setArea('current');
    setSelected(null);
  });

  const today = new Date().toISOString().slice(0, 10);
  const results = useMemo(
    () => searchSpots(data.spots, origin, filters, today),
    [data.spots, origin, filters, today],
  );
  const selectedResult = results.find((result) => result.spot.id === selected);
  const selectedId = selectedResult?.spot.id ?? null;
  const areaName =
    area === 'current'
      ? '現在地'
      : (areas.find((item) => item.id === area)?.name ?? '栄');
  const filtered =
    filters.query !== defaultFilters.query ||
    filters.category !== defaultFilters.category ||
    filters.cost !== defaultFilters.cost ||
    filters.radius !== defaultFilters.radius;

  function chooseArea(id: string): void {
    const next = areas.find((item) => item.id === id);
    if (!next) return;
    geo.cancel();
    setArea(id);
    setOrigin(next);
    setSelected(null);
  }

  function showMap(id?: string): void {
    if (id) setSelected(id);
    setMapEnabled(true);
    setView('map');
  }

  function focusSelectedCard(id: string): void {
    requestAnimationFrame(() => {
      const card = document.getElementById(`spot-${id}`);
      card?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
      card?.querySelector('button')?.focus({ preventScroll: true });
    });
  }

  function selectFromMap(id: string): void {
    setSelected(id);
    // Desktop already displays the list beside the map. Mobile keeps map context
    // and offers an explicit jump to the detail row from the place preview.
    if (window.matchMedia('(min-width: 800px)').matches) {
      focusSelectedCard(id);
    }
  }

  function openSelectedDetails(): void {
    if (!selectedId) return;
    setView('list');
    focusSelectedCard(selectedId);
  }

  return (
    <div className={styles.shell}>
      <a className="skipLink" href="#results">
        検索結果へスキップ
      </a>
      <header className={styles.topbar}>
        <a className={styles.brand} href="./" aria-label="LeSpot ホーム">
          <span className={styles.brandIcon} aria-hidden="true">
            L
          </span>
          LeSpot
        </a>
        <span className={styles.appName}>名古屋の休憩スポット検索</span>
        <a className={styles.infoLink} href="#about">
          掲載情報について
        </a>
      </header>

      <main className={styles.layout}>
        <div className={styles.sidebar}>
          <SearchControls
            area={area}
            chooseArea={chooseArea}
            filters={filters}
            setFilters={setFilters}
            geo={geo}
          />
          <section
            id="results"
            className={`${styles.results} ${view === 'map' ? styles.resultsCompact : ''}`}
            aria-labelledby="results-title"
          >
            <div className={styles.resultsHeader}>
              <div>
                <h1 id="results-title">
                  検索結果
                  <span className={styles.count} aria-live="polite">
                    {data.status === 'ready' ? ` ${results.length}件` : ''}
                  </span>
                </h1>
                <p>{areaName}から近い順 · 直線距離</p>
              </div>
              <button
                className={styles.reset}
                onClick={() => {
                  setFilters({ ...defaultFilters });
                  setSelected(null);
                }}
                disabled={!filtered}
              >
                絞り込みをリセット
              </button>
            </div>

            <div className={styles.tabs} role="group" aria-label="表示切替">
              <button
                aria-pressed={view === 'list'}
                onClick={() => setView('list')}
              >
                一覧
              </button>
              <button aria-pressed={view === 'map'} onClick={() => showMap()}>
                地図
              </button>
            </div>

            {data.status === 'loading' && (
              <StatusPanel title="スポットを読み込んでいます…" />
            )}
            {data.status === 'error' && (
              <StatusPanel error title="スポットを読み込めませんでした">
                <p>通信環境を確認し、再試行してください。</p>
                <button onClick={data.retry}>再試行</button>
              </StatusPanel>
            )}
            {data.status === 'ready' && (
              <div className={view === 'map' ? styles.mobileHidden : ''}>
                {results.length ? (
                  <SpotList
                    results={results}
                    selected={selectedId}
                    onSelect={setSelected}
                    onShowMap={showMap}
                    today={today}
                  />
                ) : (
                  <StatusPanel
                    title={
                      data.spots.length === 0
                        ? '掲載スポットを確認中です'
                        : '条件に合うスポットが見つかりません'
                    }
                  >
                    <p>
                      {data.spots.length === 0
                        ? '利用条件を確認できたスポットから掲載します。'
                        : '地域または検索条件を変更してください。'}
                    </p>
                    {filtered && data.spots.length > 0 && (
                      <button onClick={() => setFilters({ ...defaultFilters })}>
                        条件をクリア
                      </button>
                    )}
                  </StatusPanel>
                )}
              </div>
            )}
          </section>
          <section
            id="about"
            className={styles.notes}
            aria-label="掲載情報と位置情報"
          >
            <details>
              <summary>掲載情報と位置情報について</summary>
              <p>
                ピンは施設の代表位置で、入口や席・空席を示しません。
                距離は直線距離です。料金・利用条件は確認日時点の情報です。
                現在地は許可した場合のみ取得し、保存しません。
                地図表示のため国土地理院にIPアドレスと表示範囲が伝わります。
                外部サービスにはそのサービスの規約が適用され、
                徒歩ルートの出発地に現在地を自動送信しません。
              </p>
            </details>
          </section>
        </div>

        <section
          id="spot-map"
          className={styles.mapStage}
          aria-label="地図表示"
        >
          {mapEnabled ? (
            <MapBoundary>
              <Suspense
                fallback={<StatusPanel title="地図を準備しています…" />}
              >
                <MapView
                  results={results}
                  origin={origin}
                  selected={selectedId}
                  onSelect={selectFromMap}
                />
              </Suspense>
            </MapBoundary>
          ) : (
            <div className={styles.mapOptIn}>
              <div className={styles.mapOptInContent}>
                <h2>地図を表示</h2>
                <p>
                  周辺のスポットを地図上で確認できます。
                  地図を開くと、国土地理院から地図データを取得します。
                </p>
                <button className="primary" onClick={() => setMapEnabled(true)}>
                  地図を読み込む
                </button>
              </div>
            </div>
          )}
          {selectedResult && view === 'map' && (
            <div className={styles.selectionSheet} aria-live="polite">
              <div className={styles.sheetText}>
                <strong>{selectedResult.spot.name}</strong>
                <span>
                  {formatDistance(selectedResult.distance)} ·{' '}
                  {selectedResult.spot.address}
                </span>
              </div>
              <button onClick={openSelectedDetails}>一覧で詳細を見る</button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

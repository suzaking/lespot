import { lazy, Suspense, useMemo, useState } from 'react';
import { areas, categories, defaultFilters } from '../lib/config';
import { searchSpots, formatDistance, type Filters } from '../lib/search';
import { mapLinks } from '../lib/mapLinks';
import type { Coordinates, Spot } from '../lib/validation';
import { isSpotInViewport, type MapViewport } from '../lib/mapViewport';
import { useSpots } from '../hooks/useSpots';
import { useGeolocation } from '../hooks/useGeolocation';
import { SearchControls } from '../components/search/SearchControls';
import { SpotList } from '../components/spots/SpotList';
import { SpotCard } from '../components/spots/SpotCard';
import { StatusPanel } from '../components/ui/StatusPanel';
import { MapBoundary } from '../components/ui/MapBoundary';
import { SheetGrip } from '../components/ui/SheetGrip';
import styles from './App.module.css';

const MapView = lazy(() => import('../components/map/MapView'));
type Panel = 'closed' | 'results' | 'place' | 'info';

export default function App() {
  const data = useSpots();
  const [area, setArea] = useState('sakae');
  const [origin, setOrigin] = useState<Coordinates>(areas[0]);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [selected, setSelected] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel>('closed');
  const [expanded, setExpanded] = useState(false);
  const [sheetExtent, setSheetExtent] = useState<'peek' | 'half' | 'full'>(
    'half',
  );
  const [mapBounds, setMapBounds] = useState<MapViewport | null>(null);
  const [pendingViewport, setPendingViewport] = useState<MapViewport | null>(
    null,
  );
  const [cameraKey, setCameraKey] = useState(0);

  const geo = useGeolocation((point) => {
    setOrigin(point);
    setCameraKey((n) => n + 1);
    setMapBounds(null);
    setPendingViewport(null);
    setArea('current');
    setSelected(null);
    setPanel('results');
  });
  const today = new Date().toISOString().slice(0, 10);
  const results = useMemo(() => {
    const found = searchSpots(
      data.spots,
      origin,
      mapBounds ? { ...filters, radius: 250000 } : filters,
      today,
    );
    return mapBounds
      ? found.filter(({ spot }) => isSpotInViewport(spot, mapBounds))
      : found;
  }, [data.spots, origin, filters, today, mapBounds]);
  const selectedResult = results.find((result) => result.spot.id === selected);
  const selectedId = selectedResult?.spot.id ?? null;
  const areaName =
    area === 'current'
      ? '現在地'
      : area === 'map'
        ? '表示範囲'
        : (areas.find((item) => item.id === area)?.name ?? '栄');
  const filtered =
    filters.query !== defaultFilters.query ||
    filters.category !== defaultFilters.category ||
    filters.cost !== defaultFilters.cost ||
    filters.radius !== defaultFilters.radius;
  const walking = selectedResult
    ? mapLinks(selectedResult.spot).find((link) =>
        link.label.includes('徒歩ルート'),
      )
    : undefined;

  const activePanel =
    data.status === 'error' && panel === 'closed' ? 'results' : panel;

  function chooseArea(id: string): void {
    const next = areas.find((item) => item.id === id);
    if (!next) return;
    geo.cancel();
    setArea(id);
    setOrigin(next);
    setMapBounds(null);
    setPendingViewport(null);
    setCameraKey((n) => n + 1);
    setSelected(null);
    setPanel('results');
  }
  function updateFilters(next: Filters): void {
    setFilters(next);
    setMapBounds(null);
    setPendingViewport(null);
    setSelected(null);
    setPanel('results');
  }
  function selectSpot(id: string): void {
    setPendingViewport(null);
    setSelected(id);
    setExpanded(false);
    setPanel('place');
  }
  function openResults(): void {
    setSheetExtent('half');
    setPanel('results');
    setExpanded(false);
  }
  function chooseSuggestion(spot: Spot): void {
    setFilters({
      ...filters,
      query: spot.name,
      radius: Math.max(filters.radius, 10000),
    });
    setOrigin({ lat: spot.lat, lon: spot.lon });
    setMapBounds(null);
    setPendingViewport(null);
    setCameraKey((n) => n + 1);
    setSelected(spot.id);
    setExpanded(false);
    setPanel('place');
  }
  function searchHere(): void {
    if (!pendingViewport) return;
    setOrigin(pendingViewport.center);
    setArea('map');
    setMapBounds(pendingViewport);
    setPendingViewport(null);
    setSelected(null);
    openResults();
  }
  function extendResults(): void {
    setSheetExtent((level) => (level === 'peek' ? 'half' : 'full'));
  }
  function reduceResults(): void {
    if (sheetExtent === 'full') setSheetExtent('half');
    else if (sheetExtent === 'half') setSheetExtent('peek');
    else closePanel();
  }
  function reducePlace(): void {
    if (expanded) setExpanded(false);
    else closePanel();
  }
  function retrySpots(): void {
    setPanel('results');
    data.retry();
  }
  function closePanel(): void {
    setPanel('closed');
    setSelected(null);
    setExpanded(false);
  }
  function openSelectedInList(): void {
    if (!selectedId) return;
    openResults();
    requestAnimationFrame(() => {
      const card = document.getElementById(`spot-${selectedId}`);
      card?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
      card?.querySelector('button')?.focus({ preventScroll: true });
    });
  }

  return (
    <main className={styles.shell}>
      <a className="skipLink" href="#spot-map">
        地図へスキップ
      </a>
      <h1 className="srOnly">LeSpot — 名古屋の休憩スポットマップ</h1>
      <section
        className={styles.mapStage}
        id="spot-map"
        aria-label="休憩スポットの地図"
      >
        <MapBoundary>
          <Suspense fallback={<StatusPanel title="地図を準備しています…" />}>
            <MapView
              results={results}
              origin={origin}
              selected={selectedId}
              onSelect={selectSpot}
              onViewportChange={setPendingViewport}
              cameraKey={cameraKey}
            />
          </Suspense>
        </MapBoundary>
      </section>

      {pendingViewport && (
        <button
          className={styles.searchHere}
          type="button"
          onClick={searchHere}
        >
          このエリアを検索
        </button>
      )}
      <div className={styles.searchDock}>
        <SearchControls
          area={area}
          chooseArea={chooseArea}
          filters={filters}
          setFilters={updateFilters}
          geo={geo}
          onShowResults={openResults}
          spots={data.spots}
          onChooseSuggestion={chooseSuggestion}
        />
      </div>
      <div className={styles.utilityDock}>
        <button
          className={styles.utilityButton}
          type="button"
          aria-label="掲載情報について"
          aria-pressed={activePanel === 'info'}
          onClick={() => setPanel(activePanel === 'info' ? 'closed' : 'info')}
        >
          i
        </button>
        <button
          className={styles.utilityButton}
          type="button"
          aria-label="現在地から探す"
          disabled={geo.pending}
          onClick={geo.locate}
        >
          <svg
            width="23"
            height="23"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
        </button>
        {geo.message && (
          <p role="status" className={styles.geoMessage}>
            {geo.message}
          </p>
        )}
      </div>

      {activePanel === 'closed' && (
        <button
          className={styles.exploreButton}
          type="button"
          onClick={openResults}
          aria-label="スポット一覧を開く"
        >
          スポットを見る
          {data.status === 'ready' ? ` · ${results.length}件` : ''}
        </button>
      )}

      {activePanel === 'results' && (
        <section
          id="results"
          className={`${styles.overlayPanel} ${styles.resultsPanel} ${sheetExtent === 'peek' ? styles.sheetPeek : sheetExtent === 'full' ? styles.sheetFull : ''}`}
          aria-labelledby="results-title"
        >
          <SheetGrip onUp={extendResults} onDown={reduceResults} />
          <header className={styles.panelHeader}>
            <div>
              <h2 id="results-title">
                休憩スポット{' '}
                <span aria-live="polite">
                  {data.status === 'ready' ? `${results.length}件` : ''}
                </span>
              </h2>
              <p>{areaName}から近い順 · 直線距離</p>
            </div>
            <button
              className={styles.closeButton}
              onClick={closePanel}
              aria-label="結果一覧を閉じる"
            >
              ×
            </button>
          </header>
          {filtered && (
            <div className={styles.resetBar}>
              <button
                onClick={() => {
                  setFilters({ ...defaultFilters });
                  setSelected(null);
                }}
              >
                絞り込みをリセット
              </button>
            </div>
          )}
          <div className={styles.scrollBody}>
            {data.status === 'loading' && (
              <StatusPanel title="スポットを読み込んでいます…" />
            )}
            {data.status === 'error' && (
              <StatusPanel error title="スポットを読み込めませんでした">
                <p>通信環境を確認し、再試行してください。</p>
                <button onClick={retrySpots}>再試行</button>
              </StatusPanel>
            )}
            {data.status === 'ready' &&
              (results.length ? (
                <SpotList
                  results={results}
                  selected={selectedId}
                  onSelect={selectSpot}
                  onShowMap={selectSpot}
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
                  <p>地域や検索条件を変更してみてください。</p>
                  {filtered && (
                    <button onClick={() => setFilters({ ...defaultFilters })}>
                      条件をクリア
                    </button>
                  )}
                </StatusPanel>
              ))}
          </div>
        </section>
      )}

      {activePanel === 'place' && selectedResult && (
        <section
          className={`${styles.overlayPanel} ${styles.placePanel} ${expanded ? styles.placeExpanded : ''}`}
          aria-labelledby="selected-place-title"
        >
          <SheetGrip onUp={() => setExpanded(true)} onDown={reducePlace} />
          <header className={styles.placeHeader}>
            <div>
              <h2 id="selected-place-title">{selectedResult.spot.name}</h2>
              <p>
                {categories[selectedResult.spot.category]} ·{' '}
                {formatDistance(selectedResult.distance)}
              </p>
            </div>
            <button
              className={styles.closeButton}
              onClick={closePanel}
              aria-label="スポット詳細を閉じる"
            >
              ×
            </button>
          </header>
          <div className={styles.placeActions}>
            {walking && (
              <a
                className={styles.directions}
                href={walking.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {walking.label}
                <span className="srOnly">（新しいタブ）</span>
              </a>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
            >
              {expanded ? '詳細を閉じる' : '詳細を見る'}
            </button>
            <button onClick={openSelectedInList}>一覧で詳細を見る</button>
          </div>
          {expanded && (
            <div className={styles.expandedDetails}>
              <SpotCard
                result={selectedResult}
                index={results.indexOf(selectedResult)}
                selected
                onSelect={() => setExpanded(false)}
                onShowMap={() => setExpanded(false)}
                today={today}
              />
            </div>
          )}
        </section>
      )}

      {activePanel === 'info' && (
        <aside
          className={`${styles.overlayPanel} ${styles.infoPanel}`}
          aria-labelledby="info-title"
        >
          <header className={styles.panelHeader}>
            <h2 id="info-title">LeSpotについて</h2>
            <button
              className={styles.closeButton}
              onClick={closePanel}
              aria-label="情報を閉じる"
            >
              ×
            </button>
          </header>
          <p>名古屋の確認済み休憩スポットを地図から探せます。</p>
          <p>
            距離は直線距離、ピンは施設の代表位置です。入口・休憩席・空席・営業状況を保証しません。出典・確認日は各スポットの詳細で確認できます。
          </p>
          <p>
            現在地は許可した場合だけ取得し、保存しません。地図表示ではOpenFreeMapにIPアドレスと表示範囲が伝わります。現在地座標は送信しません。
          </p>
          <a href="/admin.html">運営者向け管理</a>
        </aside>
      )}
    </main>
  );
}

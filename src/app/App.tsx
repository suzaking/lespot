import { lazy, Suspense, useMemo, useState } from 'react';
import { areas, defaultFilters } from '../lib/config';
import { searchSpots, type Filters } from '../lib/search';
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
  const [mapEnabled, setMapEnabled] = useState(false);
  const geo = useGeolocation((p) => {
    setOrigin(p);
    setArea('current');
    setSelected(null);
  });
  const today = new Date().toISOString().slice(0, 10);
  const results = useMemo(
    () => searchSpots(data.spots, origin, filters, today),
    [data.spots, origin, filters, today],
  );
  const selectedId = results.some((r) => r.spot.id === selected)
    ? selected
    : null;
  function chooseArea(id: string): void {
    const next = areas.find((a) => a.id === id);
    if (next) {
      geo.cancel();
      setArea(id);
      setOrigin(next);
      setSelected(null);
    }
  }
  function selectFromMap(id: string): void {
    setSelected(id);
    setView('list');
    requestAnimationFrame(() => {
      const card = document.getElementById(`spot-${id}`);
      card?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
      card?.querySelector('button')?.focus({ preventScroll: true });
    });
  }
  return (
    <div className={styles.shell}>
      <a className="skipLink" href="#results">
        検索結果へスキップ
      </a>
      <header className={styles.header}>
        <a href="./" className={styles.logo}>
          LeSpot<span>ひと休みを、もっと身近に。</span>
        </a>
        <span className={styles.areaTag}>NAGOYA</span>
      </header>
      <main>
        <section className={styles.intro}>
          <p className={styles.eyebrow}>街歩きの、ひと休みに。</p>
          <h1>
            自分のペースで、
            <br />
            休める場所を。
          </h1>
          <p>栄・久屋大通・矢場町周辺の休憩スポットを探す。</p>
        </section>
        <SearchControls
          area={area}
          chooseArea={chooseArea}
          filters={filters}
          setFilters={setFilters}
          geo={geo}
        />
        <section
          id="results"
          className={styles.results}
          aria-labelledby="results-title"
        >
          <div className={styles.resultsHeader}>
            <div>
              <h2 id="results-title">
                近くの休憩スポット{' '}
                <span aria-live="polite">
                  {data.status === 'ready' ? `${results.length}件` : ''}
                </span>
              </h2>
              <p>
                {area === 'current'
                  ? '現在地'
                  : areas.find((a) => a.id === area)?.name}
                から近い順 · 直線距離
              </p>
            </div>
            <button
              onClick={() => {
                setFilters(defaultFilters);
                setSelected(null);
              }}
            >
              絞り込みをリセット
            </button>
          </div>
          <div className={styles.tabs} aria-label="表示切替">
            <button
              aria-pressed={view === 'list'}
              onClick={() => setView('list')}
            >
              一覧
            </button>
            <button
              aria-pressed={view === 'map'}
              onClick={() => {
                setView('map');
                setMapEnabled(true);
              }}
            >
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
            <div className={styles.workspace}>
              <div className={view === 'map' ? styles.mobileHidden : ''}>
                {results.length ? (
                  <SpotList
                    results={results}
                    selected={selectedId}
                    onSelect={setSelected}
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
                        ? '利用条件と位置を確認できたスポットから掲載します。未確認の施設は表示していません。'
                        : '地域を変更するか、距離や絞り込み条件を広げてみてください。'}
                    </p>
                  </StatusPanel>
                )}
              </div>
              <aside
                className={`${styles.mapPanel} ${view === 'list' ? styles.mobileHidden : ''}`}
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
                  <div className={styles.mapPlaceholder}>
                    <span aria-hidden="true">◎</span>
                    <h3>地図で位置を確認</h3>
                    <p>近くのスポットをまとめて見られます。</p>
                    <button
                      className="primary"
                      onClick={() => setMapEnabled(true)}
                    >
                      地図を読み込む
                    </button>
                  </div>
                )}
              </aside>
            </div>
          )}
        </section>
        <section className={styles.notes} aria-label="ご利用にあたって">
          <p>
            ピンは施設の代表位置で、入口・休憩席の正確な位置や空席を示すものではありません。距離は徒歩の移動距離ではありません。料金・利用条件は確認日時点の情報です。施設検索の結果やStreet
            Viewの撮影位置は、目的の場所と異なる場合があります。
          </p>
          <details>
            <summary>位置情報と外部サービスについて</summary>
            <p>
              現在地はボタンを押して許可したときだけ取得し、この画面のメモリだけで使います。保存・解析送信はしません。地図を開くと国土地理院にIPアドレスと表示範囲が伝わります。外部リンクは新しいタブで開き、各サービスの規約が適用されます。徒歩ルートの出発地に現在地を自動送信しません。
            </p>
          </details>
        </section>
      </main>
      <footer className={styles.footer}>
        LeSpot <span>名古屋で、ひと休み。</span>
      </footer>
    </div>
  );
}

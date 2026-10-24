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
  const selectedId = results.some((result) => result.spot.id === selected)
    ? selected
    : null;
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
        <a href="./" className={styles.brand} aria-label="LeSpot ホーム">
          <span className={styles.brandMark} aria-hidden="true">
            L<span>.</span>
          </span>
          <span className={styles.brandName}>
            LeSpot
            <small>REST SPOT FINDER</small>
          </span>
        </a>
        <nav className={styles.headerLinks} aria-label="サイト内メニュー">
          <a href="#results">スポットを探す</a>
          <a href="#about">LeSpotについて</a>
        </nav>
        <span className={styles.headerLocation}>
          <span aria-hidden="true" className={styles.headerLocationDot} />
          NAGOYA, JAPAN
        </span>
      </header>

      <main>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span aria-hidden="true" /> YOUR LITTLE PAUSE IN THE CITY
            </p>
            <h1 id="hero-title">
              街のなかに、
              <br />
              <em>ひと息</em>つける場所。
            </h1>
            <p className={styles.heroDescription}>
              ちょっと座りたい。少し気分を変えたい。
              <br />
              名古屋で、今の自分にちょうどいい休憩スポットを探そう。
            </p>
            <a className={styles.heroLink} href="#search">
              休憩スポットを探す <span aria-hidden="true">↘</span>
            </a>
          </div>
          <div className={styles.heroArt} aria-hidden="true">
            <span className={styles.heroOrbitOuter} />
            <span className={styles.heroOrbitInner} />
            <span className={styles.heroSun} />
            <span className={styles.heroArtWord}>a little pause.</span>
            <span className={styles.heroArtNumber}>35°10′ N · 136°54′ E</span>
            <span className={styles.heroArtLabel}>SLOW DOWN & LOOK AROUND</span>
          </div>
        </section>

        <div id="search" className={styles.searchSection}>
          <div className={styles.sectionEyebrow}>
            <span>01</span> FIND YOUR SPOT
          </div>
          <div className={styles.searchHeading}>
            <div>
              <h2>どこで、ひと休みする？</h2>
              <p>地域を選んで、気になる条件で絞り込むだけ。</p>
            </div>
            <span className={styles.searchHint}>検索・閲覧は無料です</span>
          </div>
          <SearchControls
            area={area}
            chooseArea={chooseArea}
            filters={filters}
            setFilters={setFilters}
            geo={geo}
          />
        </div>

        <section
          id="results"
          className={styles.results}
          aria-labelledby="results-title"
        >
          <div className={styles.sectionEyebrow}>
            <span>02</span> EXPLORE NEARBY
          </div>
          <div className={styles.resultsHeader}>
            <div>
              <h2 id="results-title">
                見つかった場所
                <span className={styles.count} aria-live="polite">
                  {data.status === 'ready'
                    ? `${results.length} SPOTS`
                    : '— SPOTS'}
                </span>
              </h2>
              <p className={styles.resultsSummary}>
                {areaName}を基準に、直線距離が近い順に表示
              </p>
            </div>
            <button
              className={styles.reset}
              disabled={!filtered}
              onClick={() => {
                setFilters({ ...defaultFilters });
                setSelected(null);
              }}
            >
              <span aria-hidden="true">↺</span> 絞り込みをリセット
            </button>
          </div>

          <div className={styles.tabs} role="group" aria-label="表示切替">
            <button
              aria-pressed={view === 'list'}
              onClick={() => setView('list')}
            >
              <span aria-hidden="true">☷</span> 一覧
            </button>
            <button aria-pressed={view === 'map'} onClick={() => showMap()}>
              <span aria-hidden="true">◎</span> 地図
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
              <div
                className={`${styles.listColumn} ${view === 'map' ? styles.mobileHidden : ''}`}
              >
                <p className={styles.listEyebrow}>
                  <span className={styles.listDot} aria-hidden="true" />
                  {results.length}件のスポットを表示しています
                </p>
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
                        ? '利用条件と位置を確認できたスポットから掲載します。未確認の施設は表示していません。'
                        : '地域を変更するか、距離や絞り込み条件を広げてみてください。'}
                    </p>
                    {data.spots.length > 0 && filtered && (
                      <button onClick={() => setFilters({ ...defaultFilters })}>
                        条件をクリア
                      </button>
                    )}
                  </StatusPanel>
                )}
              </div>
              <aside
                className={`${styles.mapPanel} ${view === 'list' ? styles.mobileHidden : ''}`}
                aria-label="地図表示"
              >
                <div className={styles.mapHeading}>
                  <div>
                    <strong>SPOT MAP</strong>
                    <span>スポットの位置を確認</span>
                  </div>
                  <span className={styles.mapLive}>NAGOYA AREA</span>
                </div>
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
                    <div className={styles.previewVisual} aria-hidden="true">
                      <span className={styles.previewRingOne} />
                      <span className={styles.previewRingTwo} />
                      <span className={styles.previewPinOne} />
                      <span className={styles.previewPinTwo} />
                      <span className={styles.previewPinThree} />
                      <span className={styles.previewCenter}>◎</span>
                    </div>
                    <div className={styles.mapPlaceholderCopy}>
                      <span className={styles.previewEyebrow}>
                        THE CITY IS YOURS
                      </span>
                      <h3>地図から、見つけよう。</h3>
                      <p>地図を開くと周辺のスポットをまとめて確認できます。</p>
                      <button
                        className="primary"
                        onClick={() => setMapEnabled(true)}
                      >
                        地図を読み込む <span aria-hidden="true">↗</span>
                      </button>
                      <small>地図は操作したときだけ読み込みます。</small>
                    </div>
                  </div>
                )}
              </aside>
            </div>
          )}
        </section>
        <section
          id="about"
          className={styles.notes}
          aria-label="ご利用にあたって"
        >
          <div className={styles.notesTitle}>
            <span>GOOD TO KNOW</span>
            <h2>安心して、ひと休み。</h2>
          </div>
          <div className={styles.notesBody}>
            <p>
              掲載しているのは確認済みの施設情報です。ピンは施設の代表位置で、入口・休憩席の正確な位置や空席を保証しません。表示距離は直線距離です。料金や利用条件は確認日時点のものであり、訪問前に公式情報や現地表示をご確認ください。
            </p>
            <details>
              <summary>位置情報と外部サービスについて</summary>
              <p>
                現在地はボタンを押して許可したときだけ取得し、この画面のメモリだけで使用します。保存・解析送信はしません。地図を開くと国土地理院にIPアドレスと表示範囲が伝わります。外部地図は新しいタブで開き、Street
                Viewの撮影位置などは施設と異なる場合があります。徒歩ルートの出発地に現在地を自動送信しません。
              </p>
            </details>
          </div>
        </section>
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          LeSpot<span>®</span>
        </div>
        <p>何もしない時間も、いい時間。</p>
        <span>MADE FOR LITTLE BREAKS IN NAGOYA</span>
      </footer>
    </div>
  );
}

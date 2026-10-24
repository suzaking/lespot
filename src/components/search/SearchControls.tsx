import { areas, categories, costs } from '../../lib/config';
import type { Filters } from '../../lib/search';
import type { useGeolocation } from '../../hooks/useGeolocation';
import styles from './SearchControls.module.css';

export function SearchControls({
  area,
  chooseArea,
  filters,
  setFilters,
  geo,
}: {
  area: string;
  chooseArea: (id: string) => void;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  geo: ReturnType<typeof useGeolocation>;
}) {
  return (
    <section aria-label="検索条件" className={styles.controls}>
      <div className={styles.mainSearch}>
        <label className={styles.searchInput}>
          <span className={styles.label}>キーワード検索</span>
          <span className={styles.searchField}>
            <span className={styles.searchIcon} aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="公園、施設名、住所など"
              aria-label="スポット名・場所"
              value={filters.query}
              onChange={(event) =>
                setFilters({ ...filters, query: event.target.value })
              }
            />
          </span>
        </label>
        <div className={styles.location}>
          <label className={styles.areaInput}>
            <span className={styles.label}>検索する地域</span>
            <select value={area} onChange={(event) => chooseArea(event.target.value)}>
              {area === 'current' && <option value="current">現在地</option>}
              {areas.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <button className={styles.geoButton} onClick={geo.locate} disabled={geo.pending}>
            <span aria-hidden="true">◎</span>
            {geo.pending ? '取得中…' : '現在地から探す'}
          </button>
        </div>
      </div>
      <p role="status" className={styles.message}>{geo.message}</p>
      <div className={styles.filterPanel}>
        <div className={styles.filterHeader}>
          <strong>絞り込み</strong>
          <span>気分に合わせて選ぼう</span>
        </div>
        <div className={styles.quickFilters} aria-label="かんたん絞り込み">
          <button
            aria-pressed={filters.cost === 'free'}
            onClick={() => setFilters({ ...filters, cost: filters.cost === 'free' ? 'all' : 'free' })}
          >
            無料スポット
          </button>
          <button
            aria-pressed={filters.category === 'park'}
            onClick={() => setFilters({ ...filters, category: filters.category === 'park' ? 'all' : 'park' })}
          >
            公園・広場
          </button>
          <button
            aria-pressed={filters.radius === 1000}
            onClick={() => setFilters({ ...filters, radius: filters.radius === 1000 ? 3000 : 1000 })}
          >
            1km以内
          </button>
        </div>
        <div className={styles.filters}>
          <label>
            カテゴリ
            <select
              value={filters.category}
              onChange={(event) =>
                setFilters({ ...filters, category: event.target.value as Filters['category'] })
              }
            >
              <option value="all">すべて</option>
              {Object.entries(categories).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label>
            料金
            <select
              value={filters.cost}
              onChange={(event) =>
                setFilters({ ...filters, cost: event.target.value as Filters['cost'] })
              }
            >
              <option value="all">すべて</option>
              {Object.entries(costs).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label>
            直線距離
            <select
              value={filters.radius}
              onChange={(event) =>
                setFilters({ ...filters, radius: Number(event.target.value) })
              }
            >
              {[500, 1000, 3000, 10000].map((radius) => (
                <option key={radius} value={radius}>
                  {radius < 1000 ? `${radius}m` : `${radius / 1000}km`}以内
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <p className={styles.help}>
        <span aria-hidden="true">ⓘ</span> 位置情報を許可しなくても地域指定で検索できます。
      </p>
    </section>
  );
}

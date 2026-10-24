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
    <section className={styles.controls} aria-label="検索条件">
      <label className={styles.query}>
        <span className="srOnly">スポット名・場所</span>
        <input
          aria-label="スポット名・場所"
          type="search"
          placeholder="場所や施設名を検索"
          value={filters.query}
          onChange={(event) =>
            setFilters({ ...filters, query: event.target.value })
          }
        />
      </label>
      <div className={styles.location}>
        <label>
          検索する地域
          <select
            value={area}
            onChange={(event) => chooseArea(event.target.value)}
          >
            {area === 'current' && <option value="current">現在地</option>}
            {areas.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <button
          className={styles.locate}
          onClick={geo.locate}
          disabled={geo.pending}
        >
          {geo.pending ? '現在地を取得中…' : '現在地から探す'}
        </button>
      </div>
      <p className={styles.message} role="status">
        {geo.message}
      </p>

      <div className={styles.chips} aria-label="クイックフィルター">
        <button
          aria-pressed={filters.cost === 'free'}
          onClick={() =>
            setFilters({
              ...filters,
              cost: filters.cost === 'free' ? 'all' : 'free',
            })
          }
        >
          無料
        </button>
        <button
          aria-pressed={filters.category === 'park'}
          onClick={() =>
            setFilters({
              ...filters,
              category: filters.category === 'park' ? 'all' : 'park',
            })
          }
        >
          公園・広場
        </button>
        <button
          aria-pressed={filters.radius === 1000}
          onClick={() =>
            setFilters({
              ...filters,
              radius: filters.radius === 1000 ? 3000 : 1000,
            })
          }
        >
          1km以内
        </button>
      </div>
      <details className={styles.advanced}>
        <summary>詳細な絞り込み</summary>
        <div className={styles.filters}>
          <label>
            カテゴリ
            <select
              value={filters.category}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  category: event.target.value as Filters['category'],
                })
              }
            >
              <option value="all">すべて</option>
              {Object.entries(categories).map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            料金
            <select
              value={filters.cost}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  cost: event.target.value as Filters['cost'],
                })
              }
            >
              <option value="all">すべて</option>
              {Object.entries(costs).map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
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
      </details>
    </section>
  );
}

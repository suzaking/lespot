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
      <div className={styles.location}>
        <label>
          検索する地域
          <select value={area} onChange={(e) => chooseArea(e.target.value)}>
            {area === 'current' && <option value="current">現在地</option>}
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <button className="primary" onClick={geo.locate} disabled={geo.pending}>
          {geo.pending ? '取得中…' : '◎ 現在地から探す'}
        </button>
      </div>
      <p className={styles.help}>
        位置情報を使わず、地域の指定だけでも探せます。
      </p>
      <p role="status" className={styles.message}>
        {geo.message}
      </p>
      <label>
        スポット名・場所
        <input
          type="search"
          placeholder="施設名や住所で絞り込み"
          value={filters.query}
          onChange={(e) => setFilters({ ...filters, query: e.target.value })}
        />
      </label>
      <div className={styles.filters}>
        <label>
          カテゴリ
          <select
            value={filters.category}
            onChange={(e) =>
              setFilters({
                ...filters,
                category: e.target.value as Filters['category'],
              })
            }
          >
            <option value="all">すべて</option>
            {Object.entries(categories).map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          料金
          <select
            value={filters.cost}
            onChange={(e) =>
              setFilters({
                ...filters,
                cost: e.target.value as Filters['cost'],
              })
            }
          >
            <option value="all">すべて</option>
            {Object.entries(costs).map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          直線距離
          <select
            value={filters.radius}
            onChange={(e) =>
              setFilters({ ...filters, radius: Number(e.target.value) })
            }
          >
            {[500, 1000, 3000, 10000].map((r) => (
              <option key={r} value={r}>
                {r < 1000 ? `${r}m` : `${r / 1000}km`}以内
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}

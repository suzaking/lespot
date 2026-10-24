import { useState } from 'react';
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
  onShowResults,
}: {
  area: string;
  chooseArea: (id: string) => void;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  geo: ReturnType<typeof useGeolocation>;
  onShowResults: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <section className={styles.controls} aria-label="スポット検索">
      <div className={styles.searchBar}>
        <span className={styles.brandMark} aria-hidden="true">L</span>
        <label className={styles.query}>
          <span className="srOnly">スポット名・場所</span>
          <input
            type="search"
            aria-label="スポット名・場所"
            placeholder="休憩スポットを検索"
            value={filters.query}
            onChange={(event) => setFilters({ ...filters, query: event.target.value })}
            onFocus={onShowResults}
          />
        </label>
        <button
          type="button"
          className={styles.searchAction}
          aria-label={open ? '検索条件を閉じる' : '検索条件を開く'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M4 7h16M4 17h16" />
            <circle cx="9" cy="7" r="2.5" fill="white" />
            <circle cx="15" cy="17" r="2.5" fill="white" />
          </svg>
        </button>
      </div>
      {open && (
        <div className={styles.filterPanel}>
          <div className={styles.location}>
            <label>
              検索する地域
              <select value={area} onChange={(e) => chooseArea(e.target.value)}>
                {area === 'current' && <option value="current">現在地</option>}
                {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </label>
            <button className={styles.locate} onClick={geo.locate} disabled={geo.pending}>
              {geo.pending ? '取得中…' : '現在地から探す'}
            </button>
          </div>
          <div className={styles.chips} aria-label="クイックフィルター">
            <button aria-pressed={filters.cost === 'free'} onClick={() => setFilters({ ...filters, cost: filters.cost === 'free' ? 'all' : 'free' })}>無料</button>
            <button aria-pressed={filters.category === 'park'} onClick={() => setFilters({ ...filters, category: filters.category === 'park' ? 'all' : 'park' })}>公園・広場</button>
            <button aria-pressed={filters.radius === 1000} onClick={() => setFilters({ ...filters, radius: filters.radius === 1000 ? 3000 : 1000 })}>1km以内</button>
          </div>
          <div className={styles.filters}>
            <label>カテゴリ
              <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value as Filters['category'] })}>
                <option value="all">すべて</option>
                {Object.entries(categories).map(([value, name]) => <option key={value} value={value}>{name}</option>)}
              </select>
            </label>
            <label>料金
              <select value={filters.cost} onChange={(e) => setFilters({ ...filters, cost: e.target.value as Filters['cost'] })}>
                <option value="all">すべて</option>
                {Object.entries(costs).map(([value, name]) => <option key={value} value={value}>{name}</option>)}
              </select>
            </label>
            <label>直線距離
              <select value={filters.radius} onChange={(e) => setFilters({ ...filters, radius: Number(e.target.value) })}>
                {[500, 1000, 3000, 10000].map((r) => <option key={r} value={r}>{r < 1000 ? `${r}m` : `${r / 1000}km`}以内</option>)}
              </select>
            </label>
          </div>
          {geo.message && <p role="status" className={styles.message}>{geo.message}</p>}
        </div>
      )}
    </section>
  );
}

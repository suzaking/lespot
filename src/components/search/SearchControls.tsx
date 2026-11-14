import { useRef, useState, type KeyboardEvent } from 'react';
import { areas, categories, costs } from '../../lib/config';
import type { Filters } from '../../lib/search';
import type { Spot } from '../../lib/validation';
import type { useGeolocation } from '../../hooks/useGeolocation';
import styles from './SearchControls.module.css';

export function SearchControls({
  area,
  chooseArea,
  filters,
  setFilters,
  geo,
  onShowResults,
  spots,
  onChooseSuggestion,
}: {
  area: string;
  chooseArea: (id: string) => void;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  geo: ReturnType<typeof useGeolocation>;
  onShowResults: () => void;
  spots: Spot[];
  onChooseSuggestion: (spot: Spot) => void;
}) {
  const [open, setOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);
  const query = filters.query.trim().normalize('NFKC').toLocaleLowerCase('ja');
  const suggestions = query
    ? spots
        .filter((spot) =>
          `${spot.name} ${spot.address}`
            .normalize('NFKC')
            .toLocaleLowerCase('ja')
            .includes(query),
        )
        .slice(0, 5)
    : [];

  function choose(spot: Spot) {
    setSuggestionsOpen(false);
    inputRef.current?.blur();
    onChooseSuggestion(spot);
  }

  function keyboard(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setSuggestionsOpen(false);
    } else if (
      event.key === 'Enter' &&
      suggestionsOpen &&
      suggestions.length > 0
    ) {
      event.preventDefault();
      choose(suggestions[0]!);
    } else if (
      event.key === 'ArrowDown' &&
      suggestionsOpen &&
      suggestions.length > 0
    ) {
      event.preventDefault();
      suggestionsRef.current
        ?.querySelector<HTMLElement>('[role="option"]')
        ?.focus();
    }
  }

  return (
    <section className={styles.controls} aria-label="スポット検索">
      <div className={styles.searchBar}>
        <span className={styles.brandMark} aria-hidden="true">
          L
        </span>
        <label className={styles.query}>
          <span className="srOnly">スポット名・場所</span>
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-label="スポット名・場所"
            aria-autocomplete="list"
            aria-controls="place-suggestions"
            aria-expanded={suggestionsOpen && suggestions.length > 0}
            placeholder="休憩スポットを検索"
            value={filters.query}
            onChange={(event) => {
              setSuggestionsOpen(true);
              setFilters({ ...filters, query: event.target.value });
            }}
            onKeyDown={keyboard}
            onFocus={() => {
              setSuggestionsOpen(true);
              onShowResults();
            }}
          />
        </label>
        <button
          type="button"
          className={styles.searchAction}
          aria-label={open ? '検索条件を閉じる' : '検索条件を開く'}
          aria-expanded={open}
          onClick={() => {
            setOpen(!open);
            setSuggestionsOpen(false);
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path d="M4 7h16M4 17h16" />
            <circle cx="9" cy="7" r="2.5" fill="white" />
            <circle cx="15" cy="17" r="2.5" fill="white" />
          </svg>
        </button>
      </div>
      {suggestionsOpen && suggestions.length > 0 && (
        <ul
          id="place-suggestions"
          ref={suggestionsRef}
          className={styles.suggestions}
          role="listbox"
          aria-label="検索候補"
        >
          {suggestions.map((spot) => (
            <li
              key={spot.id}
              role="option"
              aria-selected={false}
              tabIndex={0}
              onClick={() => choose(spot)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  choose(spot);
                } else if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  (
                    event.currentTarget.nextElementSibling as HTMLElement | null
                  )?.focus();
                } else if (event.key === 'ArrowUp') {
                  event.preventDefault();
                  const previous = event.currentTarget
                    .previousElementSibling as HTMLElement | null;
                  if (previous) previous.focus();
                  else inputRef.current?.focus();
                } else if (event.key === 'Escape') {
                  setSuggestionsOpen(false);
                  inputRef.current?.focus();
                }
              }}
            >
              <strong>{spot.name}</strong>
              <small>{spot.address}</small>
            </li>
          ))}
        </ul>
      )}
      {open && (
        <div className={styles.filterPanel}>
          <div className={styles.location}>
            <label>
              検索する地域
              <select value={area} onChange={(e) => chooseArea(e.target.value)}>
                {area === 'map' && <option value="map">地図の表示範囲</option>}
                {area === 'current' && <option value="current">現在地</option>}
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              className={styles.locate}
              onClick={geo.locate}
              disabled={geo.pending}
            >
              {geo.pending ? '取得中…' : '現在地から探す'}
            </button>
          </div>
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
                {Object.entries(categories).map(([value, name]) => (
                  <option key={value} value={value}>
                    {name}
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
                {Object.entries(costs).map(([value, name]) => (
                  <option key={value} value={value}>
                    {name}
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
          {geo.message && (
            <p role="status" className={styles.message}>
              {geo.message}
            </p>
          )}
        </div>
      )}
    </section>
  );
}


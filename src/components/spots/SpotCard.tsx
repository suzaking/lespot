import { categories, costs } from '../../lib/config';
import { formatDistance, type SearchResult } from '../../lib/search';
import { isFresh } from '../../lib/validation';
import { SpotActions } from './SpotActions';
import styles from './SpotCard.module.css';
export function SpotCard({
  result,
  index,
  selected,
  onSelect,
  today,
}: {
  result: SearchResult;
  index: number;
  selected: boolean;
  onSelect: () => void;
  today: string;
}) {
  const { spot, distance } = result;
  const fresh = isFresh(spot, today);
  return (
    <article
      id={`spot-${spot.id}`}
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      aria-label={spot.name}
    >
      <div className={styles.meta}>
        <span>
          {String(index + 1).padStart(2, '0')} · {categories[spot.category]}
        </span>
        <span>{formatDistance(distance)}</span>
      </div>
      <h3>
        <button
          className={styles.title}
          aria-pressed={selected}
          onClick={onSelect}
        >
          {spot.name}
        </button>
      </h3>
      <p className={styles.address}>{spot.address}</p>
      <p>
        <span className={styles.badge}>
          {fresh ? costs[spot.cost] : '料金・条件の再確認が必要'}
        </span>
      </p>
      {!fresh && <p>確認期限を過ぎています。以下は前回確認時の情報です。</p>}
      <p>{spot.conditions}</p>
      {spot.facilities.length > 0 && (
        <p>確認済み設備：{spot.facilities.join('・')}</p>
      )}
      <SpotActions spot={spot} />
      <details className={styles.source}>
        <summary>出典・確認日</summary>
        <p>
          <a href={spot.sourceUrl} target="_blank" rel="noopener noreferrer">
            {spot.sourceLabel}（新しいタブ）
          </a>
        </p>
        <p>
          確認：{spot.verifiedAt} ／ 確認期限：{spot.validUntil}
        </p>
        <p>{spot.rights}</p>
        <p>
          座標：{spot.lat}, {spot.lon}
        </p>
      </details>
    </article>
  );
}

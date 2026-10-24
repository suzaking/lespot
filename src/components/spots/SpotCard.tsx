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
  onShowMap,
  today,
}: {
  result: SearchResult;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onShowMap: () => void;
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
      <div className={styles.cardTop}>
        <div className={styles.number} aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </div>
        <div className={styles.cardHeading}>
          <div className={styles.meta}>
            <span className={styles.category}>{categories[spot.category]}</span>
            <span className={styles.distance}>◎ {formatDistance(distance)}</span>
          </div>
          <h3>
            <button className={styles.title} aria-pressed={selected} onClick={onSelect}>
              {spot.name}
            </button>
          </h3>
          <p className={styles.address}>{spot.address}</p>
        </div>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.costRow}>
          <span className={`${styles.badge} ${fresh && spot.cost === 'free' ? styles.free : ''}`}>
            {fresh ? costs[spot.cost] : '料金・条件の再確認が必要'}
          </span>
          <span className={styles.verified}>
            {fresh ? '確認済み情報' : '前回確認時の情報'}
          </span>
        </div>
        {!fresh && <p className={styles.expired}>確認期限を過ぎています。訪問前に最新情報を確認してください。</p>}
        <p className={styles.conditions}>{spot.conditions}</p>
        {spot.facilities.length > 0 && (
          <p className={styles.facilities}>確認済み設備：{spot.facilities.join('・')}</p>
        )}
      </div>
      <div className={styles.cardActions}>
        <button className={styles.mapButton} onClick={onShowMap}>
          <span aria-hidden="true">◎</span> 地図で見る <span aria-hidden="true">↗</span>
        </button>
        <SpotActions spot={spot} />
      </div>
      <details className={styles.source}>
        <summary>出典・確認日を確認する <span aria-hidden="true">＋</span></summary>
        <p>
          <a href={spot.sourceUrl} target="_blank" rel="noopener noreferrer">
            {spot.sourceLabel}（新しいタブ）
          </a>
        </p>
        <p>確認：{spot.verifiedAt} ／ 確認期限：{spot.validUntil}</p>
        <p>{spot.rights}</p>
        <p>座標：{spot.lat}, {spot.lon}</p>
      </details>
    </article>
  );
}

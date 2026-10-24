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
      <div className={styles.row}>
        <span aria-hidden="true" className={styles.number}>{index + 1}</span>
        <div className={styles.content}>
          <h2>
            <button className={styles.title} aria-pressed={selected} onClick={onSelect}>
              {spot.name}
            </button>
          </h2>
          <div className={styles.meta}>
            <span>{categories[spot.category]}</span>
            <span>{formatDistance(distance)}</span>
            <span className={fresh && spot.cost === 'free' ? styles.free : ''}>
              {fresh ? costs[spot.cost] : '料金・条件の再確認が必要'}
            </span>
          </div>
          <p className={styles.address}>{spot.address}</p>
          {!fresh && (
            <p className={styles.expired}>
              確認期限が切れています。訪問前に最新情報をご確認ください。
            </p>
          )}
          <p className={styles.conditions}>{spot.conditions}</p>
          {spot.facilities.length > 0 && (
            <p className={styles.facilities}>
              確認済み設備：{spot.facilities.join('・')}
            </p>
          )}
          <div className={styles.cardActions}>
            <button className={styles.mapButton} onClick={onShowMap}>
              地図で見る
            </button>
            <SpotActions spot={spot} />
          </div>
          <details className={styles.source}>
            <summary>出典・確認日</summary>
            <a href={spot.sourceUrl} target="_blank" rel="noopener noreferrer">
              {spot.sourceLabel}（新しいタブ）
            </a>
            <p>確認：{spot.verifiedAt} ／ 確認期限：{spot.validUntil}</p>
            <p>{spot.rights}</p>
            <p>座標：{spot.lat}, {spot.lon}</p>
          </details>
        </div>
      </div>
    </article>
  );
}

import type { SearchResult } from '../../lib/search';
import { SpotCard } from './SpotCard';
import styles from './SpotCard.module.css';

export function SpotList({
  results,
  selected,
  onSelect,
  onShowMap,
  today,
}: {
  results: SearchResult[];
  selected: string | null;
  onSelect: (id: string) => void;
  onShowMap: (id: string) => void;
  today: string;
}) {
  return (
    <div className={styles.list}>
      {results.map((result, index) => (
        <SpotCard
          key={result.spot.id}
          result={result}
          index={index}
          selected={selected === result.spot.id}
          onSelect={() => onSelect(result.spot.id)}
          onShowMap={() => onShowMap(result.spot.id)}
          today={today}
        />
      ))}
    </div>
  );
}

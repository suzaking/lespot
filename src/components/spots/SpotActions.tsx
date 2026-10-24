import type { Spot } from '../../lib/validation';
import { mapLinks } from '../../lib/mapLinks';
import styles from './SpotCard.module.css';

export function SpotActions({ spot }: { spot: Spot }) {
  const links = mapLinks(spot);
  const walking = links.find((link) => link.label.includes('徒歩ルート'));
  const secondary = links.filter((link) => link !== walking);
  return (
    <div className={styles.actions} aria-label={`${spot.name}の外部リンク`}>
      {walking && (
        <a href={walking.href} target="_blank" rel="noopener noreferrer">
          {walking.label}
          <span className="srOnly">（新しいタブ）</span>
        </a>
      )}
      <details className={styles.moreLinks}>
        <summary>ほかの地図</summary>
        <div className={styles.moreLinksBody}>
          {secondary.map((link) => (
            <a
              href={link.href}
              key={link.label}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
              <span className="srOnly">（新しいタブ）</span>
            </a>
          ))}
        </div>
      </details>
    </div>
  );
}

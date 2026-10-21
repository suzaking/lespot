import type { Spot } from '../../lib/validation';
import { mapLinks } from '../../lib/mapLinks';
import styles from './SpotCard.module.css';
export function SpotActions({ spot }: { spot: Spot }) {
  return (
    <div className={styles.actions} aria-label={`${spot.name}の外部リンク`}>
      {mapLinks(spot).map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {link.label}
          <span className="srOnly">（新しいタブ）</span> ↗
        </a>
      ))}
    </div>
  );
}

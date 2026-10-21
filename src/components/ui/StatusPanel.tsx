import type { ReactNode } from 'react';
import styles from './StatusPanel.module.css';
export function StatusPanel({
  title,
  children,
  error = false,
}: {
  title: string;
  children?: ReactNode;
  error?: boolean;
}) {
  return (
    <div className={styles.panel} role={error ? 'alert' : 'status'}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

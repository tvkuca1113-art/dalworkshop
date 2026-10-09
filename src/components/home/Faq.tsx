import styles from './Faq.module.css';

export interface FaqItem {
  q: string;
  a: React.ReactNode;
}

/** Native details/summary: keyboard accessible without extra script. */
export function Faq({ items }: { items: readonly FaqItem[] }) {
  return (
    <div className={styles.list}>
      {items.map((item) => (
        <details key={item.q} className={styles.item}>
          <summary className={styles.q}>{item.q}</summary>
          <div className={styles.a}>{item.a}</div>
        </details>
      ))}
    </div>
  );
}

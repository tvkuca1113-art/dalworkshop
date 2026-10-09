'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Work } from '@/lib/catalog/works';
import styles from './Gallery.module.css';

interface Item {
  workTitle: string;
  src: string;
  width: number;
  height: number;
  alt: string;
}

/** Keyboard-accessible lightbox: arrows navigate, Escape closes, focus returns to the thumbnail. */
export function Gallery({ works }: { works: readonly Work[] }) {
  const items: Item[] = works.flatMap((w) => w.photos.map((p) => ({ workTitle: w.title, ...p })));
  const [index, setIndex] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const last = useRef<number | null>(null);

  const open = (i: number) => {
    last.current = i;
    setIndex(i);
  };
  const close = useCallback(() => setIndex(null), []);
  const move = useCallback((d: number) => setIndex((i) => (i === null ? i : (i + d + items.length) % items.length)), [items.length]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (index !== null && !d.open) d.showModal();
    if (index === null && d.open) d.close();
  }, [index]);

  return (
    <>
      {works.map((w) => (
        <article key={w.id} className={styles.work}>
          <div className={styles.head}>
            <h2>{w.title}</h2>
            <ul>
              {w.facts.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            {w.note && <p className="note">{w.note}</p>}
            <a href={w.source} target="_blank" rel="noopener" className="text-link">
              Objava na Instagramu
            </a>
          </div>
          <div className={styles.grid} data-count={w.photos.length}>
            {w.photos.map((p) => {
              const i = items.findIndex((it) => it.src === p.src);
              return (
                <button
                  key={p.src}
                  type="button"
                  className={styles.thumb}
                  onClick={() => open(i)}
                  ref={(el) => {
                    triggers.current[i] = el;
                  }}
                  aria-label={`Uvećaj fotografiju: ${p.alt}`}
                >
                  <Image src={p.src} alt={p.alt} fill sizes="(min-width: 900px) 30vw, 50vw" className={styles.img} />
                </button>
              );
            })}
          </div>
        </article>
      ))}
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-label="Uvećana fotografija"
        onClose={() => {
          setIndex(null);
          if (last.current !== null) triggers.current[last.current]?.focus();
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') move(1);
          if (e.key === 'ArrowLeft') move(-1);
        }}
      >
        {index !== null && items[index] && (
          <div className={styles.box}>
            <div className={styles.bar}>
              <p>
                {items[index].workTitle} · {index + 1}/{items.length}
              </p>
              <button type="button" className="btn btn--ghost-light btn--small" onClick={close} autoFocus>
                Zatvori
              </button>
            </div>
            <div className={styles.full}>
              <Image src={items[index].src} alt={items[index].alt} width={items[index].width} height={items[index].height} sizes="90vw" className={styles.fullImg} />
            </div>
            <div className={styles.nav}>
              <button type="button" className="btn btn--ghost-light btn--small" onClick={() => move(-1)}>
                Prethodna
              </button>
              <button type="button" className="btn btn--ghost-light btn--small" onClick={() => move(1)}>
                Sljedeća
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

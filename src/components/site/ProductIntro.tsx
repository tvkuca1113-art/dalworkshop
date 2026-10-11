import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { whatsappLink } from '@/lib/catalog/brand';
import { WhatsAppIcon } from './WhatsAppIcon';
import styles from './ProductIntro.module.css';

export function ProductIntro({ eyebrow, title, children, image, alt, href, action, caption }: {
  eyebrow: string; title: string; children: ReactNode; image: string; alt: string; href: string; action: string; caption?: string;
}) {
  return (
    <section className={`wrap ${styles.intro}`}>
      <div className={styles.copy}>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <div className="lead">{children}</div>
        <div className={styles.actions}>
          <Link href={href} className="btn">{action}</Link>
          <a href={whatsappLink()} className="text-link" target="_blank" rel="noopener"><WhatsAppIcon className="btn__wa" /> Razgovarajmo o vašoj ideji</a>
        </div>
        <p className="note">Izrada po mjeri · Cijenu i rok dogovaramo uz ponudu</p>
      </div>
      <figure className={styles.figure}>
        <div className={styles.media}><Image src={image} alt={alt} fill sizes="(min-width: 900px) 50vw, 100vw" loading="eager" fetchPriority="high" quality={80} /></div>
        <figcaption>{caption ?? 'Vizualizacija ambijenta prema DAL proizvodu'}</figcaption>
      </figure>
    </section>
  );
}

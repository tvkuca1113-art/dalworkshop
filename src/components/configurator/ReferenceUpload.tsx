'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { REFERENCE_KINDS, REFERENCE_LIMITS, REFERENCE_TYPES, type ReferenceKind } from '@/lib/catalog/references';
import { referenceFileError } from '@/lib/config/references';
import styles from './ReferenceUpload.module.css';

export interface ReferenceImage { id: string; file: File; url: string; kind: ReferenceKind }
export function referenceText(files: readonly ReferenceImage[]) {
  return files.length ? `\n\nFotografije inspiracije (${files.length}; šaljem kao prilog):\n${files.map((ref) => `• ${REFERENCE_KINDS.find((kind) => kind.id === ref.kind)!.label}: ${ref.file.name}`).join('\n')}` : '';
}

export function useReferenceImages() {
  const [files, setFiles] = useState<ReferenceImage[]>([]);
  const items = useRef<ReferenceImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const processing = useRef(false);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; items.current.forEach((item) => URL.revokeObjectURL(item.url)); };
  }, []);

  const add = async (selected: File[], kind: ReferenceKind) => {
    if (processing.current) return;
    processing.current = true;
    setBusy(true);
    setError(null);
    let message: string | null = null;
    for (const file of selected) {
      if (items.current.length >= REFERENCE_LIMITS.count) { message = `Možete dodati najviše ${REFERENCE_LIMITS.count} fotografije. Uklonite jednu da biste dodali novu.`; break; }
      const invalid = referenceFileError(file);
      if (invalid) { message = `${file.name}: ${invalid}`; continue; }
      const url = URL.createObjectURL(file);
      try {
        const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
          img.onerror = reject;
          img.src = url;
        });
        if (!dimensions.width || dimensions.width * dimensions.height > REFERENCE_LIMITS.pixels) throw new Error('resolution');
        if (!alive.current) { URL.revokeObjectURL(url); continue; }
        items.current = [...items.current, { id: crypto.randomUUID(), file, url, kind }];
      } catch {
        URL.revokeObjectURL(url);
        message = `${file.name}: fotografiju nije moguće otvoriti. Pokušajte s manjom JPG ili PNG datotekom.`;
      }
    }
    processing.current = false;
    if (alive.current) { setFiles(items.current); setError(message); setBusy(false); }
  };
  const remove = (id: string) => {
    const item = items.current.find((entry) => entry.id === id);
    if (item) URL.revokeObjectURL(item.url);
    items.current = items.current.filter((entry) => entry.id !== id);
    setFiles(items.current);
    setError(null);
  };
  return { files, add, remove, error, busy };
}

export function ReferenceUpload({ references }: { references: ReturnType<typeof useReferenceImages> }) {
  const id = useId();
  const [kind, setKind] = useState<ReferenceKind>('base');
  return (
    <section className={styles.section} aria-labelledby={`${id}-title`} id="inspiracija">
      <p className="eyebrow">Vaša inspiracija</p>
      <h3 id={`${id}-title`}>Imate drugačiju ideju?</h3>
      <p>Dodajte primjer nogu, cijelog stola ili vašeg prostora. Ne morate pronaći gotov model da bismo započeli razgovor.</p>
      <fieldset className={styles.kinds}><legend>Šta prikazuje fotografija?</legend>{REFERENCE_KINDS.map((item) => <label key={item.id}><input type="radio" name={`${id}-kind`} checked={kind === item.id} onChange={() => setKind(item.id)} />{item.label}</label>)}</fieldset>
      <label className={styles.dropzone} htmlFor={`${id}-upload`}>
        <span className={styles.plus} aria-hidden="true">+</span>
        <strong>{references.busy ? 'Pripremamo fotografije…' : 'Dodajte fotografije'}</strong>
        <span>Do {REFERENCE_LIMITS.count} fotografije · JPG, PNG ili WebP · do {REFERENCE_LIMITS.bytes / (1024 * 1024)} MB po fotografiji</span>
        <input id={`${id}-upload`} type="file" accept={REFERENCE_TYPES.join(',')} multiple disabled={references.busy} onChange={(event) => { void references.add(Array.from(event.target.files ?? []), kind); event.target.value = ''; }} />
      </label>
      {references.files.length > 0 && <ul className={styles.previews}>{references.files.map((item) => <li key={item.id}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.url} alt={`Vaša inspiracija: ${item.file.name}`} />
        <span>{REFERENCE_KINDS.find((type) => type.id === item.kind)!.label}</span>
        <small title={item.file.name}>{item.file.name}</small>
        <button type="button" onClick={() => references.remove(item.id)} aria-label={`Ukloni fotografiju ${item.file.name}`}>Ukloni</button>
      </li>)}</ul>}
      <div aria-live="polite">{references.error && <p className={styles.error} role="alert">{references.error}</p>}</div>
      <p className={styles.privacy}>Fotografije ostaju u ovoj otvorenoj stranici do dijeljenja. Na pregledu ih podijelite s upitom ili dodajte u WhatsApp razgovor. Sačuvani izbor i link ne sadrže fotografije.</p>
    </section>
  );
}

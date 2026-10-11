'use client';

import { useMemo, useState } from 'react';
import type { BoardConfig, TableConfig } from '@/lib/config/types';
import { NOTE_MAX } from '@/lib/config/types';
import { specFor, GRAIN_NOTE, PRICE_QUOTE_COPY } from '@/lib/config/summary';
import { calculatePrice } from '@/lib/config/pricing';
import { encodeConfig, permalink } from '@/lib/config/url';
import { inquiryText } from '@/lib/config/message';
import { whatsappLink } from '@/lib/catalog/brand';
import { saveConfig } from '@/lib/config/storage';
import { formatKm } from '@/lib/config/units';
import { CUSTOM_PROPOSAL_COPY } from '@/lib/catalog/status';
import { WhatsAppIcon } from '../site/WhatsAppIcon';
import { QuoteForm } from './QuoteForm';
import { SpecList } from './ui';
import { useOrigin } from '../useClient';
import { ReferenceUpload, referenceText, type useReferenceImages } from './ReferenceUpload';
import styles from './ReviewPanel.module.css';

export function ReviewPanel({
  config,
  formEnabled,
  onNote,
  onPrint,
  blockingIssue,
  blockingActions,
  references,
}: {
  config: TableConfig | BoardConfig;
  formEnabled: boolean;
  onNote: (note: string) => void;
  onPrint: () => void;
  /** A conflict that needs the customer's decision before sending. */
  blockingIssue?: string | null;
  blockingActions?: React.ReactNode;
  references?: ReturnType<typeof useReferenceImages>;
}) {
  const origin = useOrigin();
  const lines = useMemo(() => specFor(config), [config]);
  const price = calculatePrice(config);
  const hasPersonalText = Boolean(config.note.trim()) || (config.productType === 'board' && config.personalization.enabled && config.personalization.text.trim() !== '');
  const [includeText, setIncludeText] = useState(false);
  const [copyState, setCopyState] = useState<{ kind: 'idle' } | { kind: 'copied' } | { kind: 'manual'; link: string }>({ kind: 'idle' });
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [waStarted, setWaStarted] = useState(false);
  const [photoShareStatus, setPhotoShareStatus] = useState<string | null>(null);

  const shareLink = () => permalink(origin, config, { includePersonalText: includeText && hasPersonalText });
  // The WhatsApp message carries the personalised text itself; the link inside stays public by default.
  const message = inquiryText(config, permalink(origin, config)) + referenceText(references?.files ?? []);
  const waHref = whatsappLink(message);
  const sharePhotos = async () => {
    const files = references?.files.map((item) => item.file) ?? [];
    if (!navigator.canShare?.({ files }) || !navigator.share) {
      setPhotoShareStatus('Ovaj preglednik ne može direktno dijeliti fotografije. Otvorite WhatsApp ispod i dodajte ove fotografije kao prilog, ili sačuvajte PDF upita s fotografijama.');
      return;
    }
    try {
      await navigator.share({ files, text: message, title: 'Moj stol · DAL Workshop' });
      setPhotoShareStatus('Dovršite slanje u odabranoj aplikaciji.');
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) setPhotoShareStatus('Dijeljenje nije uspjelo. Fotografije možete dodati u WhatsApp razgovor.');
    }
  };

  const copy = async () => {
    const link = shareLink();
    try {
      if (!navigator.clipboard?.writeText) throw new Error('no clipboard');
      await navigator.clipboard.writeText(link);
      setCopyState({ kind: 'copied' });
    } catch {
      setCopyState({ kind: 'manual', link });
    }
  };

  const save = () => {
    const r = saveConfig(config);
    setSaveMsg(
      r.ok
        ? `Izbor je sačuvan na ovom uređaju (${new Date().toLocaleString('bs-BA', { dateStyle: 'short', timeStyle: 'short' })}). Kontakt podaci se ne spremaju.`
        : r.message,
    );
  };

  return (
    <section className={styles.review} aria-labelledby="pregled-naslov">
      <h2 id="pregled-naslov" className={styles.heading}>
        Pregled i upit
      </h2>
      <SpecList lines={lines} />
      {references && <ReferenceUpload references={references} />}
      <div className={styles.price} data-testid="price">
        {price.status === 'priced' ? (
          <p>
            <strong className="tabular">{formatKm(price.fening)}</strong> — cjenovnik {price.priceListVersion}
          </p>
        ) : (
          <p>
            <strong>{PRICE_QUOTE_COPY}.</strong>
          </p>
        )}
        <p className="note">{CUSTOM_PROPOSAL_COPY}</p>
        <p className="note">{GRAIN_NOTE}</p>
      </div>

      <div className={styles.field}>
        <label htmlFor="poseban-zahtjev">Poseban zahtjev (neobavezno)</label>
        <textarea
          id="poseban-zahtjev"
          rows={3}
          maxLength={NOTE_MAX}
          value={config.note}
          onChange={(e) => onNote(e.target.value)}
          placeholder="Npr. druga dimenzija, posebna nijansa, rok…"
        />
        <p className="note">
          {config.note.length}/{NOTE_MAX} · Ulazi u upit. U javni link ide samo ako to izričito izaberete.
        </p>
      </div>

      {blockingIssue && (
        <div className={styles.blocking} role="alert" data-testid="blocking-issue">
          <p>{blockingIssue}</p>
          {blockingActions}
        </div>
      )}

      <div className={styles.primary}>
        {references && references.files.length > 0 && !blockingIssue && <>
          <button type="button" className="btn btn--ghost" onClick={sharePhotos} disabled={references.busy}>Podijelite upit s fotografijama ({references.files.length})</button>
          <p className="note">Na podržanim uređajima odaberite WhatsApp u izborniku dijeljenja. Ako fotografije nisu priložene, dodajte ih u razgovor.</p>
          <div role="status">{photoShareStatus && <p className="note">{photoShareStatus}</p>}</div>
        </>}
        {blockingIssue ? (
          <button type="button" className="btn" disabled aria-disabled="true">
            <WhatsAppIcon className="btn__wa" /> Pošaljite upit na WhatsApp
          </button>
        ) : (
        <a
          className="btn"
          href={waHref}
          target="_blank"
          rel="noopener"
          onClick={() => setWaStarted(true)}
          data-testid="whatsapp-cta"
          aria-describedby="wa-hint"
        >
          <WhatsAppIcon className="btn__wa" /> Pošaljite upit na WhatsApp
        </a>
        )}
        <p id="wa-hint" className="note">
          Otvara pripremljen upit. Vi dovršavate slanje u WhatsAppu.{references?.files.length ? ' Ovaj link prenosi tekst; fotografije dodajte kao prilog ili koristite dijeljenje iznad.' : ''}
        </p>
        {waStarted && (
          <p className={styles.waNotice} role="status" data-testid="wa-status">
            Dovršite slanje u WhatsAppu — pritisnite „Pošalji“ u otvorenom razgovoru.
          </p>
        )}
      </div>

      <div className={styles.secondary}>
        {hasPersonalText && (
          <label className={styles.optIn}>
            <input type="checkbox" checked={includeText} onChange={(e) => setIncludeText(e.target.checked)} />
            Uključi tekst personalizacije i poseban zahtjev u link
          </label>
        )}
        <div className={styles.buttons}>
          <button type="button" className="btn btn--ghost btn--small" onClick={copy} data-testid="copy-link">
            Kopiraj link
          </button>
          <button type="button" className="btn btn--ghost btn--small" onClick={save} data-testid="save-config">
            Sačuvaj izbor
          </button>
          <button type="button" className="btn btn--ghost btn--small" onClick={onPrint} data-testid="print">
            Ispiši / sačuvaj PDF
          </button>
        </div>
        <div aria-live="polite">
          {copyState.kind === 'copied' && <p className={styles.ok}>Link je kopiran. Otvara isti izbor na drugom uređaju.</p>}
          {copyState.kind === 'manual' && (
            <div className={styles.manual}>
              <label htmlFor="link-polje">Kopiranje nije dostupno u ovom pregledniku. Kopirajte link iz polja:</label>
              <input id="link-polje" readOnly value={copyState.link} onFocus={(e) => e.currentTarget.select()} data-testid="manual-link" />
            </div>
          )}
          {saveMsg && <p className={styles.ok}>{saveMsg}</p>}
        </div>
      </div>

      {formEnabled && !references?.files.length && <div className={styles.form} id="web-upit" hidden={Boolean(blockingIssue)}>
        <QuoteForm enabled={formEnabled} product={config.productType} configQuery={encodeConfig(config, { includePersonalText: true })} whatsappHref={waHref} />
      </div>}
    </section>
  );
}

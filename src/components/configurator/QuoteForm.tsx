'use client';

import { useId, useState } from 'react';
import { fieldErrors, QUOTE_LIMITS, quoteRequestSchema, type QuoteFieldErrors, type QuoteResponse } from '@/lib/quote/schema';
import { whatsappLink } from '@/lib/catalog/brand';
import { WhatsAppIcon } from '../site/WhatsAppIcon';
import styles from './QuoteForm.module.css';

type Status = { kind: 'idle' } | { kind: 'pending' } | { kind: 'success'; id: string } | { kind: 'error'; message: string };

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

/**
 * Web inquiry form. Only rendered as a form when the server has a real
 * e-mail provider and a shared rate-limit store; otherwise it explains the
 * WhatsApp route up front. Contact data is never stored in the browser.
 */
export function QuoteForm({
  enabled,
  product,
  configQuery,
  whatsappHref,
  title = 'Pošaljite upit putem web obrasca',
}: {
  enabled: boolean;
  product: 'table' | 'board' | 'none';
  configQuery: string;
  whatsappHref?: string;
  title?: string;
}) {
  const uid = useId();
  const [values, setValues] = useState({ name: '', phone: '', email: '', place: '', message: '', acknowledge: false, website: '' });
  const [errors, setErrors] = useState<QuoteFieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  // Not rendered, only sent with the request — safe to create on first render.
  const [submissionId, setSubmissionId] = useState(newId);

  if (!enabled) {
    return (
      <div className={styles.disabled} data-testid="form-disabled">
        <h3 className={styles.title}>Dogovor počinje porukom.</h3>
        <p>
          Pošaljite nam svoju ideju na WhatsApp. Zajedno ćemo dogovoriti detalje, cijenu i rok izrade.
        </p>
        <a className="btn" href={whatsappHref ?? whatsappLink()} target="_blank" rel="noopener">
          <WhatsAppIcon className="btn__wa" /> Pošaljite upit na WhatsApp
        </a>
      </div>
    );
  }

  const set = (key: keyof typeof values, value: string | boolean) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key as keyof QuoteFieldErrors]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status.kind === 'pending') return;
    const payload = { ...values, product, configQuery, submissionId };
    const parsed = quoteRequestSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      setStatus({ kind: 'error', message: 'Provjerite označena polja.' });
      return;
    }
    setStatus({ kind: 'pending' });
    try {
      const res = await fetch('/api/upit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const data = (await res.json().catch(() => null)) as QuoteResponse | null;
      if (res.ok && data?.ok) {
        setStatus({ kind: 'success', id: data.id });
        setSubmissionId(newId());
        return;
      }
      if (data && !data.ok) {
        if (data.fields) setErrors(data.fields);
        setStatus({ kind: 'error', message: data.message });
      } else {
        setStatus({ kind: 'error', message: 'Slanje nije uspjelo. Pokušajte ponovo ili pošaljite upit na WhatsApp.' });
      }
    } catch {
      setStatus({ kind: 'error', message: 'Nema veze sa serverom. Podaci su ostali u obrascu — pokušajte ponovo ili pošaljite upit na WhatsApp.' });
    }
  };

  const field = (key: 'name' | 'phone' | 'email' | 'place', label: string, type: string, autoComplete: string, max: number, optional = false) => {
    const id = `${uid}-${key}`;
    const err = errors[key];
    return (
      <div className={styles.field}>
        <label htmlFor={id}>
          {label}
          {optional && <span className={styles.optional}> (neobavezno)</span>}
        </label>
        <input
          id={id}
          name={key}
          type={type}
          autoComplete={autoComplete}
          maxLength={max}
          value={values[key]}
          onChange={(e) => set(key, e.target.value)}
          aria-invalid={Boolean(err)}
          aria-describedby={err ? `${id}-err` : undefined}
        />
        {err && (
          <p id={`${id}-err`} className={styles.error}>
            {err}
          </p>
        )}
      </div>
    );
  };

  if (status.kind === 'success') {
    return (
      <div className={styles.success} role="status" data-testid="form-success">
        <h3 className={styles.title}>Upit je poslan radionici</h3>
        <p>
          Server je potvrdio da je e-mail s vašim upitom poslan (oznaka {status.id}). Radionica odgovara na kontakt koji ste
          ostavili; ovo je upit za procjenu, ne narudžba.
        </p>
        <button type="button" className="btn btn--ghost btn--small" onClick={() => setStatus({ kind: 'idle' })}>
          Pošalji novi upit
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate data-testid="quote-form">
      <h3 className={styles.title}>{title}</h3>
      <p className="note">Upišite telefon ili e-mail (barem jedno). Podatke koristimo samo za odgovor na ovaj upit.</p>
      {field('name', 'Ime i prezime', 'text', 'name', QUOTE_LIMITS.name)}
      <div className={styles.pair}>
        {field('phone', 'Telefon', 'tel', 'tel', QUOTE_LIMITS.phone)}
        {field('email', 'E-mail', 'email', 'email', QUOTE_LIMITS.email)}
      </div>
      {field('place', 'Mjesto dostave', 'text', 'address-level2', QUOTE_LIMITS.place, true)}
      <div className={styles.field}>
        <label htmlFor={`${uid}-message`}>
          Kratka poruka{product !== 'none' && <span className={styles.optional}> (neobavezno)</span>}
        </label>
        <textarea
          id={`${uid}-message`}
          name="message"
          rows={4}
          maxLength={QUOTE_LIMITS.message}
          value={values.message}
          onChange={(e) => set('message', e.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? `${uid}-message-err` : undefined}
        />
        {errors.message && (
          <p id={`${uid}-message-err`} className={styles.error}>
            {errors.message}
          </p>
        )}
      </div>
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor={`${uid}-website`}>Web stranica</label>
        <input id={`${uid}-website`} name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => set('website', e.target.value)} />
      </div>
      <div className={styles.check}>
        <input
          id={`${uid}-ack`}
          type="checkbox"
          checked={values.acknowledge}
          onChange={(e) => set('acknowledge', e.target.checked)}
          aria-invalid={Boolean(errors.acknowledge)}
          aria-describedby={errors.acknowledge ? `${uid}-ack-err` : undefined}
        />
        <label htmlFor={`${uid}-ack`}>
          Razumijem da šaljem upit za procjenu, a ne narudžbu. Cijenu, rok i mogućnost izrade radionica potvrđuje u ponudi.
        </label>
      </div>
      {errors.acknowledge && (
        <p id={`${uid}-ack-err`} className={styles.error}>
          {errors.acknowledge}
        </p>
      )}
      {errors.configQuery && <p className={styles.error}>{errors.configQuery}</p>}
      <div className={styles.actions}>
        <button type="submit" className="btn" disabled={status.kind === 'pending'} aria-disabled={status.kind === 'pending'}>
          {status.kind === 'pending' ? 'Šaljem…' : 'Pošaljite upit'}
        </button>
      </div>
      <div aria-live="assertive" className={styles.live}>
        {status.kind === 'pending' && <p>Šaljem upit…</p>}
        {status.kind === 'error' && (
          <p className={styles.error} data-testid="form-error">
            {status.message}
          </p>
        )}
      </div>
    </form>
  );
}

# DAL Workshop — web stranica s 3D konfiguratorima

Web stranica za DAL Workshop iz Mostara: stolovi od masivnog drveta po mjeri i daske za rezanje i serviranje, sa stvarnim interaktivnim 3D konfiguratorima i upitom za ponudu (WhatsApp ili web obrazac).

- Specifikacija i istraživanje: `docs/reference/`
- Plan i pretpostavke: `IMPLEMENTATION-PLAN.md`
- Izvještaj o testiranju: `TEST-REPORT.md` · snimke: `docs/screenshots/`
- Redizajn verzije 1: `docs/REDESIGN-REPORT.md` · vizualna provjera: `design-qa.md`
- Licence asseta: `ASSET-LICENSES.md`
- Šta DAL treba potvrditi: `DAL-POTVRDA-PODATAKA.md`

## Tehnologija

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript strict · three.js 0.186 · @react-three/fiber 9 · @react-three/drei 10 · three-bvh-csg · Zustand · Zod 4 · Vitest · Playwright. Verzije su zaključane u `package.json` / `package-lock.json`.

## Lokalno pokretanje

Potrebno: Node.js 20.9+ (testirano na 22).

```bash
npm ci
cp .env.example .env.local   # sve varijable su neobavezne za lokalni rad
npm run dev                  # http://localhost:3000
```

Produkcijski build:

```bash
npm run build
npm start
```

## Skripte

| Komanda | Šta radi |
| --- | --- |
| `npm run dev` | razvojni server |
| `npm run build` / `npm start` | produkcijski build i server |
| `npm run typecheck` | TypeScript provjera |
| `npm run lint` | ESLint (eslint-config-next, React Compiler pravila) |
| `npm test` | Vitest — logika, geometrija, URL, cijene, server upita |
| `npm run test:e2e` | Playwright — stvarni tokovi u pregledniku (prvo `npm run build`) |
| `npm run check` | typecheck + lint + test + build |

Playwright koristi Chromium iz `PLAYWRIGHT_BROWSERS_PATH` (verzija 1.56.1 odgovara pregledniku u razvojnom okruženju). WebGL se u testovima izvršava softverski (SwiftShader).

## Varijable okruženja

Sve su opisane u `.env.example`. Ukratko:

- `NEXT_PUBLIC_SITE_URL` — javna domena (canonical, sitemap). Ne izmišljati; bez nje nema canonical/sitemap zapisa.
- `SITE_INDEXING=on` — dozvoljava indeksiranje. Bez toga je svaka objava `noindex` (demo/preview).
- Web obrazac: `RESEND_API_KEY`, `QUOTE_FROM_EMAIL` (verificirani pošiljalac na vlastitoj domeni), `QUOTE_TO_EMAIL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `RATE_LIMIT_SALT`. Obrazac se uključuje tek kad su sve postavljene; do tada stranica unaprijed nudi WhatsApp i ispis specifikacije — bez lažnog „uspješno poslano“.
- `QUOTE_TEST_OUTBOX_DIR` — samo lokalni testovi: upiti se zapisuju u JSON datoteke umjesto slanja.
- `NEXT_PUBLIC_FEATURE_END_GRAIN=1` — prikazuje end-grain dasku (tek nakon potvrde). `NEXT_PUBLIC_PERSONALIZATION=off` — sakriva editor personalizacije.

## Objava (deployment)

Preporuka je Vercel (nativna podrška za Next.js; rate limit preko Upstash Redis integracije).

1. Uvezite GitHub repozitorij u Vercel (Framework: Next.js; build `npm run build`).
2. Preview objave su automatski `noindex`. Ne postavljajte `SITE_INDEXING` na previewu.
3. Za web obrazac: verificirajte domenu pošiljaoca u Resendu, dodajte Upstash Redis i upišite varijable u Vercel → Settings → Environment Variables (Production i, po želji, Preview).
4. Kad DAL potvrdi domenu: dodajte domenu u Vercel, postavite `NEXT_PUBLIC_SITE_URL=https://…` i `SITE_INDEXING=on` za Production i ponovo objavite.
5. Prije javne objave potvrdite s vlasnikom korištenje fotografija i loga (vidi `DAL-POTVRDA-PODATAKA.md`).

Stranica ne zavisi od drugih vanjskih servisa: fontovi, slike, teksture i 3D modeli su lokalni.

## Struktura

```
src/app/                    rute (početna, stolovi, daske, radovi, odrzavanje, kontakt, privatnost,
                            konfigurator/stol, konfigurator/daska, api/upit, robots, sitemap)
src/lib/catalog/            katalog: opcije, statusi, rasponi, brend, radovi, vrste drveta
src/lib/config/             tipovi + Zod, pravila, URL kodiranje, pohrana, sažetak, WhatsApp, cijene
src/lib/geometry/           čista geometrija u mm (obrisi, nosači, utori, sigurne zone)
src/lib/engraving/          mjerenje teksta pravim fontom i smještanje u sigurnu zonu
src/lib/three/              three.js: teksture drveta, ekstruzija, CSG utori, metalni dijelovi
src/lib/quote/              server upita: schema, Resend, Upstash, handler, test transport
src/components/three/       Canvas, modeli, kamera, dimenzije, ljuska s fallbackom
src/components/configurator/ koraci, opcije, pregled, obrazac, ispis, 2D nacrt
tests/unit/                 Vitest
e2e/                        Playwright
docs/reference/             originalna specifikacija, istraživanje, manifest, seed, izvorni PNG
docs/screenshots/           snimke provjere i primjer PDF ispisa
```

## Kako radi konfigurator (kratko)

- Jedno validirano stanje (`TableConfig` / `BoardConfig`) hrani 3D, 2D nacrt, dimenzije, sažetak, WhatsApp poruku, ispis i permalink. Kamera/pogled su odvojeni.
- Unos u cm s zarezom ili tačkom („3,5“ = „3.5“ = 35 mm); stanje drži cijele milimetre.
- Svaka opcija ima status iz kataloga; nepotvrđeno se nikad ne prikazuje kao potvrđeno. Stol nema cijenu (`quote_only`); objavljene cijene dasaka su samo referenca.
- 3D se učitava dinamički samo na klijentu; dok se učitava, prikazuje se 2D nacrt istog izbora. Ako WebGL nije dostupan ili se kontekst izgubi, 2D nacrt ostaje funkcionalan i prati izbor, uz „Pokušajte ponovo“.

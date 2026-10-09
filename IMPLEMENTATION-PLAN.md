# Plan izrade i pretpostavke

Specifikacija: `docs/reference/CLAUDE-CODE-SUPERPROMPT.md` (+ istraživanje, manifest i seed katalog u `docs/reference/`). Repo je bio prazan, pa je projekt postavljen od nule.

## Redoslijed
1. **Katalog i tipovi** — seed (`CATALOG-SEED.json`) pretvoren u tipizirane module `src/lib/catalog/*` sa statusima `observed_example` / `proposed_custom` / `requires_confirmation`. Verzionirani `TableConfig` / `BoardConfig` (Zod, `schemaVersion: 1`, `productType` kao diskriminator), dimenzije u cijelim mm.
2. **Geometrija bez three.js** — `src/lib/geometry/*`: obrisi (pravougaonik, zaobljeni, elipsa, krug, prirodna ivica sa seed-om, daska s drškom), raspored nosača, utori, ručke, sigurne zone gravure. Iz istog rasporeda nastaju 3D, 2D nacrt, dimenzije i provjere.
3. **Pravila** — `src/lib/config/rules.ts`: kompatibilnost oblik/postolje, dužina centralnog postolja, utori/ručke/debljina; svaka automatska promjena vraća vidljivu obavijest s „Poništi“.
4. **3D** — React Three Fiber, render na zahtjev; ploča iz 2D obrisa (ExtrudeGeometry + profil ivice), metalni profili kao prstenovi/prizme stvarnog presjeka, utori kao CSG (three-bvh-csg), proceduralne teksture drveta s odvojenim UV-om za plohu, bokove i čela. Gravura kao decal ravan na površini.
5. **Konfiguratori** — 5 koraka za stol i dasku, sažetak, pregled, permalink, „Sačuvaj izbor“, ispis/PDF, WhatsApp, web obrazac.
6. **Stranica** — početna i podstranice, mobilni tokovi.
7. **Server** — `POST /api/upit`: Zod, limit veličine, honeypot, Upstash rate limit + jednokratni ID, Resend adapter s timeoutom; test transport za lokalne testove.
8. **Provjera** — Vitest (logika), Playwright (tokovi, mobitel, otpornost, ispis, budžet), snimke u `docs/screenshots`.

## Pretpostavke (dok DAL ne potvrdi — vidi `DAL-POTVRDA-PODATAKA.md`)
- Visina polaznog stola 75 cm (prijedlog).
- Trapezni okviri su širi pri podu nego ispod ploče (prema fotografijama i revidiranom hero vizualu); profil 40 × 60 mm; okvir 10 % dužine od kraja (100–250 mm).
- Polazne dimenzije objavljenih dasaka procijenjene s fotografija (javor/bukva 45 × 28 × 4 cm, s ručkama 48 × 25 × 2,5 cm, dvije vrste 40 × 31 × 2,5 cm); raspored traka javor/bukva procijenjen s fotografije.
- Utori daske javor/bukva: dva zasebna utora uz kraće strane, međusobno pomaknuta (kao na fotografiji), ne obodni kanal.
- Ručke: crne lučne ručke montirane odozgo, 38 mm od kraja, razmak rupa po standardnim mjerama.
- Personalizacija je želja kupca (status `requires_confirmation`), ne usluga.
- Web obrazac radi samo uz stvarni e-mail servis i zajednički rate limit; inače WhatsApp.

## Namjerno izostavljeno
Prijava, korisnički računi, baza kupaca, checkout, plaćanje, AR, admin panel, CAPTCHA, upload logotipa (umjesto toga „Poseban zahtjev“), izmišljeni brojevi narudžbi.

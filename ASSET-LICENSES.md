# Asseti i licence

Sve što se učitava u runtimeu nalazi se u ovom repozitoriju i servira se s iste domene. Nema CDN-ova trećih strana, embedova konkurencije, HDRI preuzimanja ni vanjskih fontova.

## Brend i fotografije DAL Workshopa

| Datoteka | Porijeklo | Upotreba | Status |
| --- | --- | --- | --- |
| `public/brand/dal-logo-original.jpg` (1254 × 1254) | Javna Facebook profilna grafika DAL Workshopa | Logo u zaglavlju i podnožju, prikazan kroz CSS okvir bez izmjene | Raster, nije izvorni vektor. Potrebna dozvola vlasnika za javnu objavu i izvorni SVG/PDF/AI. |
| `public/brand/dal-logo-instagram-original.jpg` (150 × 150) | Instagram avatar | Arhivska referenca, ne koristi se na stranici | — |
| `src/app/icon.png`, `src/app/apple-icon.png` | Smanjen i kvadratno izrezan isti originalni logo (ImageMagick, bez precrtavanja) | Favicon | Isto kao logo |
| `public/og/dal-og.jpg` | Izrez 1200 × 630 iz `dal-hero-desktop.webp` | Open Graph slika | Isto kao vizual ispod |
| `public/originals/*.jpg` | Objave na Instagramu @dalworkshop.ba (pregledano 9. 10. 2026) | Stvarni proizvodi, galerija, reference modela | Potvrditi korištenje s vlasnikom prije javne objave |
| `public/images/dal-stol-ambijent.webp`, `dal-daska-ambijent.webp`, `dal-detalj-hrasta.webp` | Generirani/stilizirani vizuali iz DAL fotografija (vidi `docs/reference/IMAGE-PROMPTS.json`) | Hero, sekcija dasaka, detalj materijala | Označeni na stranici kao ilustracija ambijenta, ne dokumentacija radionice |
| `docs/reference/source-images/*.png` | PNG izvori istih vizuala | Ne služe se na webu | — |
| `public/images/dal-hero-desktop.webp`, `dal-hero-mobile-close.webp` | Novi AI generisani vizuali za odabranu verziju 1; topla kamena blagovaonica, hrastov stol i crni trapezni metalni okviri prema DAL proizvodu | Responsive hero i produktni uvod stolova | Vizualizacija ambijenta, nije fotografija stvarne lokacije ili dokumentacija radionice |
| `docs/reference/selected-design-1.webp` | Odabrani AI generisani koncept početne stranice | Referenca za vizualnu provjeru; ne služi se kao pozadina stranice | Korisnik izabrao verziju 1 |

Opis porijekla svakog fajla: `docs/reference/ASSET-MANIFEST.json`.

## Fontovi (SIL Open Font License 1.1)

Lokalno hostani WOFF2 podskupovi (latin + latin-ext, uključuje č ć ž š đ Đ), kopirani iz npm paketa Fontsource. Tekst licence: `public/fonts/licenses/`.

| Font | Upotreba | Izvor |
| --- | --- | --- |
| Cormorant Garamond 500/600 (+500 italic) | Naslovi, font gravure „Klasični serif“ | `@fontsource/cormorant-garamond` 5.3.0 — © The Cormorant Project Authors |
| Manrope (variable 200–800) | Tekst, font gravure „Jednostavni sans“ | `@fontsource-variable/manrope` 5.3.0 — © The Manrope Project Authors |
| Great Vibes 400 | Font gravure „Rukopis“ (učitava se tek kad se koristi) | `@fontsource/great-vibes` 5.3.0 — © The Great Vibes Pro Project Authors |

## 3D

- Modeli su proceduralna geometrija iz koda (`src/lib/geometry`, `src/lib/three`) — nema GLB datoteka.
- Teksture drveta (hrast, orah, jasen, javor, bukva) generišu se u pregledniku iz koda (`src/lib/three/wood-texture.ts`); nema preuzetih komercijalnih tekstura.
- Osvjetljenje okoline: drei `Environment` s `Lightformer` pločama, renderovano lokalno — bez HDRI datoteka.

## Biblioteke (npm, licence prema paketima)

next, react, react-dom (MIT) · three (MIT) · @react-three/fiber, @react-three/drei (MIT) · three-bvh-csg, three-mesh-bvh (MIT) · zustand (MIT) · zod (MIT). Razvoj: typescript (Apache-2.0), eslint (MIT), vitest (MIT), @playwright/test (Apache-2.0).

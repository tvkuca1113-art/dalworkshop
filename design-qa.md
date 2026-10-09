# Design QA — DAL Workshop, verzija 1

Final result: passed

## Referenca i okruženje

- Odabrana referenca: `docs/reference/selected-design-1.webp` (1536 × 1024), verzija 1 koju je korisnik izabrao.
- Implementacija: postojeći Next.js 16 / React 19 projekt. Lokalni pregled: `http://terminal.local:4173/`; automatizovane provjere koriste produkcijski build na lokalnim portovima 3200 i 3201.
- Desktop referenca: sadržaj laptopa izrezan na `(58, 99, 1230, 867)`, 1172 × 768. Implementacija snimljena u CSS viewportu 1172 × 768, DPR 1.
- Mobilna referenca: sadržaj telefona izrezan na `(1219, 239, 1496, 905)` i proporcionalno normalizovan na 390 × 938. Implementacija: CSS viewport 390 × 938, Pixel 7 DPR 2.625; raster 1024 × 2462 normalizovan na 390 × 938. Okviri uređaja nisu dio web stranice.
- Standardne snimke: desktop 1440 × 900 i mobilni 390 × 844. Dodatno provjereno prelijevanje na 360 × 740 i 844 × 390, kroz svih devet ruta.

## Zajedničke slike usporedbe

Referenca i implementacija pregledane su na istoj slici, lijevo/desno, uz isti sadržajni okvir:

| Dokaz | Svrha |
| --- | --- |
| `docs/screenshots/comparison-desktop.jpg` | Cijeli desktop hero: fotografija, zaglavlje, tekst i akcije |
| `docs/screenshots/comparison-mobile.jpg` | Cijeli mobilni hero: kadar, prelom naslova i vertikalni raspored |
| `docs/screenshots/comparison-type-actions.jpg` | Uvećan tekst, serif, kontrast, razmaci i CTA |
| `docs/screenshots/pocetna-reference-1440.png` | Izvorna snimka implementacije za desktop usporedbu |
| `docs/screenshots/pocetna-reference-390.png` | Izvorna mobilna snimka implementacije za usporedbu |
| `docs/screenshots/pocetna-1440.png`, `pocetna-390.png` | Završni uobičajeni desktop i mobilni viewporti |
| `docs/screenshots/konfigurator-*.png`, `pregled-*.png` | Usklađen dizajn oba konfiguratora i završnih pregleda |

## Provjera pet površina

| Površina | Nalaz nakon dorada |
| --- | --- |
| Tipografija | Lokalni Cormorant Garamond za naslove, Manrope za tijelo i kontrole. H1 i ključni CTA tekst iz odabrane verzije; čitljiv prelom na obje širine. |
| Raspored i razmaci | Hero preko cijele širine, lijevo poravnat tekst, CTA uz tekst na desktopu i ispod na mobitelu. Ujednačeni rubovi, sekcije, kartice i podnožje kroz sve rute. |
| Boje i kontrast | Topla krem, charcoal i prigušeni bakreni tonovi. Svijetli tekst na foto hero-u sa solidnim tamnim slojem. Puna tamna pozadina zaglavlja pri skrolanju. |
| Asseti i kadar | Zasebna čista ambijentalna fotografija za desktop i mobitel; stvarne DAL fotografije ostaju u radovima. Fotografije nisu screenshot pozadine s ugrađenim tekstom. Produktni uvodi imaju 3:2 kadar na desktopu, bez rezanja ključnih rubova proizvoda. |
| Copy i komponente | Odabrani naslov, poruka i glavni CTA su implementirani. Proizvodne stranice, pitanja, kontakt, koraci i konfigurator govore istim tonom; cijene, rasponi i statusi ostaju zasnovani na katalogu. |

## Iteracije i zatvoreni nalazi

| Prioritet | Nalaz | Dorada i dokaz |
| --- | --- | --- |
| P2 | Desktop uvodni tekst bio je niže i sitniji od reference. | Smanjen gornji razmak, povećan uvodni tekst i CTA razmak; ponovo snimljena i pregledana desktop i fokusirana usporedba. |
| P2 | Mobilni naslov i tijelo bili su sitniji, a udaljeni kadar umanjivao je proizvod. | H1 povećan na 13.2vw, tijelo na 1rem; izabrana bliža mobilna fotografija i podignut tekst. Završna mobilna usporedba pregledana. |
| P2 | Kvadratni kadar produktnog uvoda rezao je rub stola/daske. | Desktop omjer promijenjen na 3:2; obje stranice vizualno pregledane u cloud pregledniku. |
| P1 | Početno zaglavlje nestajalo je nakon skrolanja hero-a. | Zaglavlje je fiksirano i dobija punu tamnu pozadinu nakon 32px. E2E provjerava vidljivost pri skrolanju i zatim navigaciju na vrh stranice stolova. |
| P1 | Poster fotografija u 3D dijalogu mogla je ostati iza sloja. | Lokalni z-index postera ispravljen; hero dijalog provjeren uz normalni 3D i 2D fallback. |

Otvoreni P0/P1/P2 nalazi: 0.

## Namjerne prilagodbe

- Fotografije su zasebno generisane prema odabranom toplom ambijentu i DAL tipu stola; scena nije identična mockupu. Fotografski sadržaj je označen kao vizualizacija ambijenta u opisima i produktnim uvodima.
- Zadržan je originalni DAL raster logo umjesto precrtavanja brenda. Mobilni meni ima jasnu tekstualnu kontrolu „Meni“.
- Dodatni diskretni 3D CTA u hero-u čuva postojeću funkciju. Native dialog ima izlaz, Escape, blokadu pozadinskog skrolanja i povrat fokusa.
- Sekcije ispod hero-a i ostale stranice razvijene su u istom vizualnom sistemu jer izabrana slika ne definiše njihov kompletan sadržaj.

## Funkcionalna provjera

- `npm run check`: TypeScript, ESLint, 111 unit testova i produkcijski build — prošli.
- Cijeli `npm run test:e2e`: 35/35 prošlo, bez preskočenih, nestabilnih ili neuspjelih testova.
- Nakon završnog kadra, tipografije i fiksiranog zaglavlja: dodatnih 9/9 homepage, mobile i screenshot testova prošlo.
- Završna provjera konzole, asseta, 404 i SEO-a: 3/3 prošlo. Nema runtime/hydration grešaka aplikacije, 404 asseta ili WebGL grešaka.
- Cloud preglednik: početna, stolovi, daske, 3D otvaranje/zatvaranje, FAQ i tok konfigurator → izbor drveta → pregled provjereni ručno. Ovaj cloud preglednik nema WebGL2, pa ispravno dobija 2D prikaz; stvarni 3D je zasebno provjeren Playwright/SwiftShader testovima.
- WhatsApp tekst, permalink, povrat konfiguracije, štampa, gravura i lokalni test transport upita prolaze postojeće testove. Tokovi provjereni bez slanja stvarnih poruka ili e-mailova.

Zaključak vizualne i funkcionalne provjere: passed.

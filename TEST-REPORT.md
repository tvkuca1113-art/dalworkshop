# Izvještaj o testiranju

Datum: 9. 10. 2026. Okruženje: Linux kontejner, Node.js 22.22, Chromium 141 (Playwright 1.56.1), WebGL preko SwiftShadera (softverski renderer). Fizički telefon i Safari/WebKit nisu bili dostupni — vidi „Ograničenja“.

## Sažetak

| Provjera | Komanda | Rezultat |
| --- | --- | --- |
| TypeScript (strict) | `npm run typecheck` | prolazi, 0 grešaka |
| ESLint (next core-web-vitals + typescript + React Compiler pravila) | `npm run lint` | prolazi, 0 grešaka / 0 upozorenja |
| Unit testovi (Vitest) | `npm test` | **111 / 111** prolazi (7 datoteka) |
| Produkcijski build | `npm run build` | prolazi (Next.js 16.4, Turbopack) |
| E2E (Playwright, Chromium desktop 1440 × 900 + mobilni Pixel 7 390 × 844) | `npm run test:e2e` | **33 / 33 prolazi** (završni puni prolaz, 16,2 min na softverskom WebGL-u). U prvom punom prolazu 32 / 33 — vidi napomenu ispod tabele tokova |
| npm audit (produkcijske zavisnosti) | `npm audit --omit=dev` | 0 ranjivosti |

Napomena o `npm audit` bez `--omit=dev`: 5 „high“ nalaza u razvojnim alatima (`braces`/`micromatch` preko `eslint-config-next` → `fast-glob`). Ne ulaze u build ni runtime stranice; predloženi „fix“ bi vratio eslint-config-next na 14.x, pa nije primijenjen.

## Unit testovi (Vitest) — šta dokazuju

`tests/unit/`:
- **units** — cm → mm s zarezom i tačkom („3,5“ i „3.5“ → 35 mm); odbijanje praznog, negativnog, nule, `NaN`, `Infinity`, `1e3`, dvije decimale; formatiranje KM iz feninga.
- **geometry** — obrisi bez samopresijecanja (uključujući 200 seed-ova prirodne ivice), determinizam seed-a; za svaki oblik × postolje × min/srednje/max dimenzije: ploča na ukupnoj visini, nosači od poda (Y = 0) do donje plohe, nijedan dio iznad donje plohe, dodirne tačke unutar obrisa s marginom, stope ispod ploče; profil ivice < pola debljine; trapez širi pri podu; pravila (okrugli → centralno postolje s obavijesti i „Poništi“, dugi stol ne zadržava centralno postolje, onemogućeno postolje se ne može izabrati, oval prilagođava dimenzije uz obavijest).
- **three-geometry** — stvarna three.js geometrija: gornja ploha tačno na 0,75 m, debljina 35 mm, nosači 0 → 0,715 m unutar tlocrta ploče, tri grupe materijala (ploha/bok/čelo); promjena dužine/debljine ne skalira profil čelika (dubina 60 mm ostaje); utor stvarno izdubljen do zadane dubine i ostavlja ≥ 60 % debljine; obodni kanal je stvarni rez; ručke stoje na gornjoj plohi.
- **url-storage** — permalink → ponovno otvaranje daje identično stanje i seed; okrugli stol bez nepotrebnih polja; napomena i tekst gravure nisu u javnom linku bez izričitog izbora; odbijanje nepoznatih enum vrijednosti, `NaN`, negativnih, `Infinity`, decimala, vrijednosti izvan raspona, nepoznatih i ponovljenih parametara, nekompatibilnih kombinacija, predugog linka; nepoznata verzija s razumljivom porukom; end-grain skriven iza zastavice; `localStorage` čuva samo konfiguraciju, blokirana/oštećena pohrana ne ruši ništa.
- **pricing-message** — stol uvijek `quote_required` i nikad 0 KM; trenutni katalog ne cijeni ništa; testni potvrđeni cjenovnik računa feninge i vraća verziju; nepotvrđen dodatak daje „ponuda potrebna“ umjesto djelimičnog zbira; WhatsApp link na +387 62 704 560 s tačnim, ispravno enkodiranim tekstom izbora i permalinkom.
- **engraving** — tekst ostaje tačno kako je napisan, č ć ž š đ broje se kao jedan znak; limiti 40 znakova / 2 reda / nepodržani znakovi; natpis unutar sigurne zone i bez dodira s utorima; prevelik natpis daje najveću veličinu koja stane i alternativna mjesta; zona izbjegava ručke (gore) i vijke (poleđina); okrugla daska nema „ugao“; promjena modela čuva tekst.
- **quote** — server šalje poruku izgrađenu iz serverski ponovo validirane konfiguracije; neispravan zahtjev → 400 s poljima; telefon ili e-mail obavezni; nepoznato polje (npr. cijena s klijenta) odbijeno; neispravan JSON, prevelik zahtjev (413), honeypot; timeout providera → 504, greška providera → 502 (nikad uspjeh); Resend adapter s timeoutom; bez konfiguracije → 503; rate limit (429) i duplikat (409); pad pohrane za rate limit → greška.

## E2E (Playwright) — tokovi iz specifikacije

`e2e/` (server: produkcijski build; :3200 bez e-mail varijabli, :3201 s test transportom):

| # | Tok | Test | Rezultat |
| --- | --- | --- | --- |
| 1 | Početna → stol → dimenzije, drvo (orah), ivica, postolje (X) → sažetak → „Kopiraj link“ → novi tab s istim izborom | `table.spec.ts` | prolazi |
| 2 | Početna → daska → dimenzije i obodni kanal → „Čaršija • Džemal“ → rotacija mišem → gravura ostaje na površini → pregled | `board.spec.ts` | prolazi |
| 3 | WhatsApp href dekodiran i upoređen s izborom; klik ne prikazuje „uspješno poslano“ nego „Dovršite slanje u WhatsAppu“ (wa.me presretnut, ništa nije poslano firmi) | `table.spec.ts` | prolazi |
| 4 | „Vrati pogled“ čuva konfiguraciju; „Vrati početne opcije“ traži potvrdu u aplikaciji i vraća 150 × 70 cm | `table.spec.ts` | prolazi |
| 5 | Server: neispravan zahtjev 400, prevelik 413, greška providera 502, timeout 504; pravi put obrasca preko test adaptera (pending → stvarni uspjeh, e-mail sadrži serverski provjerenu konfiguraciju); greška zadržava upisane podatke | `quote.spec.ts` | prolazi |
| 6 | Bez e-mail varijabli: obrazac se ne nudi, odmah WhatsApp; API vraća 503 | `quote.spec.ts` | prolazi |
| 7 | WebGL nedostupan → 2D nacrt koji prati oblik/dimenzije/postolje; izgubljen kontekst → 2D nacrt s gravurom → izmjena → „Pokušajte ponovo“ → 3D, izbor i tekst sačuvani | `resilience.spec.ts` | prolazi |
| 8 | Refresh, nazad/naprijed, clipboard nedostupan (polje za kopiranje), blokiran `localStorage`, loš link, nepoznata verzija, nepoznati parametar, „Sačuvaj izbor“ samo na klik | `resilience.spec.ts` | prolazi |
| 9 | Mobitel: bez horizontalnog prelijevanja na 9 stranica u 360 × 740, 390 × 844 i 844 × 390; scena oko 44 % visine ekrana (test traži 30–50 %); stranica se skrola preko canvasa dok se ne uključi „Rotirajte model“; ljepljiva traka se skriva dok je tastatura otvorena; prošireni prikaz s izlazom (Escape); meni tastaturom vraća fokus | `mobile.spec.ts` | prolazi |
| 10 | Ispis/PDF: render scene (namjenski render, bez stalnog `preserveDrawingBuffer`) + 2D nacrt + mjere + č ć ž š đ; canvas sakriven; PDF sačuvan u `docs/screenshots/ispis-daska.pdf` | `print.spec.ts` | prolazi |
| — | Konzola: 0 runtime/hydration grešaka, 0 odgovora ≥ 400 (assets), 0 WebGL grešaka na svim stranicama i oba konfiguratora; 404 stranica | `console.spec.ts` | prolazi |
| — | SEO: jedan H1 po stranici, meta opis, `noindex` u demo načinu, JSON-LD bez adrese/ocjena/radnog vremena, `robots.txt` blokira demo | `console.spec.ts` | prolazi |
| — | 3D budžet i curenje memorije: trokuti/draw callovi za 6 scena; 100 promjena dimenzija ne povećava broj geometrija ni tekstura u rendereru | `budget.spec.ts` | prolazi |
| — | Snimke 1440 i 390 px: početna, 3D na početnoj, oba konfiguratora, detalj ivice, gravura, pregled | `screens.spec.ts` | prolazi |

Napomena o padu u prvom punom prolazu: test „vraćanje pogleda“ je nakon fiksnih 900 ms očekivao kameru u pogledu odozgo; u softverskom WebGL-u animacija kamere još nije bila završena, a „Vrati pogled“ ispravno udaljava kameru za veći stol. Test sada čeka stanje kamere (smjer pogleda) umjesto fiksnog vremena; ponovljen 3 puta — prolazi. Kod aplikacije nije mijenjan.

Dokaz 3D funkcionalnosti nije samo tekst: testovi upoređuju piksele canvasa prije i poslije izbora (stol: > 3 % piksela vidljivo različito; daska: gravura i rotacija), a ponovno otvoren link daje sliku unutar 3 % razlike pod istim kadrom. Pozicija gravure provjerena je u world koordinatama scene (0,2 mm iznad gornje plohe, unutar obrisa daske, nepromijenjena nakon rotacije kamere).

## 3D budžet (izmjereno u sceni)

| Scena | Trokuti (vidljive mreže) | Draw callovi (glavni prolaz) |
| --- | --- | --- |
| Stol polazni (hrast, trapez) | 382 | 6 |
| Stol prirodna ivica 280 × 110, X nosači | 5 758 | 6 |
| Okrugli stol Ø 150, centralno postolje | 6 614 | 6 |
| Daska javor/bukva s utorima | 967 | 5 |
| Daska 80 × 40 s obodnim kanalom | 1 315 | 5 |
| Daska s metalnim ručkama | 3 262 | 6 |

Cilj ≤ 100 000 trokuta i ≤ 100 draw callova ispunjen s velikom rezervom (sjenčani prolaz dodaje po jedan poziv za svaku mrežu koja baca sjenu). Renderer radi na zahtjev (`frameloop="demand"`), DPR 1–1,5 na mobitelu / do 2 na desktopu, adaptivno (`PerformanceMonitor`). FPS na fizičkom telefonu **nije izmjeren** (vidi ograničenja); mjerenje vremena rendera u SwiftShaderu nije pouzdano pa nije navedeno.

## Brzina sadržajnih stranica (izmjereno)

Chromium, emulacija Pixel 7, CPU usporen 4×, mreža ~1,6 Mbit/s i 150 ms RTT, `next start` lokalno (`PerformanceObserver`, LCP i CLS):

| Stranica | LCP | CLS | LCP element |
| --- | --- | --- | --- |
| `/` | 1 172 ms | 0 | hero fotografija (učitana varijanta 1080 px AVIF, 37 KB) |
| `/stolovi` | 752 ms | 0 | tekst |
| `/daske` | 736 ms | 0 | H1 |
| `/radovi` | 652 ms | 0 | tekst |
| `/odrzavanje` | 736 ms | 0 | tekst |
| `/kontakt` | 696 ms | 0 | tekst |

Cilj LCP < 2,5 s i CLS < 0,1 ispunjen u ovoj emulaciji. 3D nije uslov za LCP (učitava se tek na zahtjev na početnoj, a u konfiguratoru iza 2D postera). Lighthouse i INP nisu mjereni; nema tvrdnji o „Lighthouse 100“.

## Ručne vizuelne provjere

Pregledane snimke (`docs/screenshots/`) i dodatni kadrovi tokom razvoja:
- Stol: ravna ploča na ispravnoj visini, trapezni okviri širi pri podu kao na fotografijama, stope na podu, kontaktne sjene, uzdužne daske s vlaknima uz dužinu, vlakna se nastavljaju preko ivice, čela s poprečnim vlaknom; prirodna ivica i X nosači; detalj zaobljene ivice.
- Daska: trake javora i bukve u rasporedu s fotografije, dva zasebna utora uz krajeve (stvarni rez), ručke pričvršćene na plohu s prostorom za prste, gravura tamna i priljubljena uz plohu.
- Gravura u sva tri fonta (Cormorant Garamond, Manrope, Great Vibes) ispravno prikazuje Đ đ Ć ć Ž ž Š š Č č na 3D dasci.
- Kontrast boja (WCAG): tekst #1d1c1a na #f1ede5 14,6:1; sekundarni #5a5249 6,6:1; bakar #7d5236 5,7:1; svijetli tekst na ugljenu 15,3:1; mesing na ugljenu 6,7:1. Mesing na svijetloj podlozi (2,3:1) koristi se samo za linije.

Ispravke nastale iz ovih provjera: kontaktne sjene (drei `ContactShadows`) zatamnjivale su cijeli pod u ovom rendereru → zamijenjene statičnom AO plohom; drei `OrbitControls` je postavljao `touch-action: none` i blokirao skrol na mobitelu → kontrole se spajaju na canvas tek nakon „Rotirajte model“; mobilni toolbar je širio grid → `minmax(0, 1fr)`; `sizes` heroja s `clamp()` nije bio podržan → pojednostavljeno.

## Poznata upozorenja u konzoli (biblioteke, ne greške aplikacije)

- `THREE.Clock: This module has been deprecated` — interno u @react-three/fiber 9.8.
- `BVH: "maxLeafSize" option has been deprecated` — interno u three-bvh-csg 0.0.18 (pri prvom CSG rezu).

## Ograničenja provjere (šta nije testirano i zašto)

- **WebKit / Safari / fizički iPhone**: WebKit preglednik nije instaliran u okruženju (instalacija preglednika nije dozvoljena), pa su svi testovi izvršeni u Chromiumu. Mobilni testovi su Chromium emulacija (Pixel 7, touch, `pointer: coarse`) — to nije fizički iPhone. Preporuka: prije objave proći tokove 1, 2 i 9 na stvarnom iPhoneu (Safari) i Android telefonu.
- **FPS na telefonu**: nije izmjeren; SwiftShader nije reprezentativan za GPU telefona.
- **Stvarno slanje e-maila**: Resend i Upstash nisu povezani (nema ključeva). Pravi serverski put dokazan je test transportom i unit testovima s lažnim providerom (uspjeh, timeout, greška); sama Resend isporuka nije testirana.
- **WhatsApp**: link je provjeren dekodiranjem; poruke stvarnoj firmi nisu slane (namjerno).
- **Lighthouse / INP**: nisu mjereni.

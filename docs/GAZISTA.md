# DAL gazišta — ponuda, istraživanje i izvedba

10. 10. 2026. Izvor ponude: cjenovnik koji je korisnik dostavio u ovoj sesiji. Gazišta 100 × 30 cm; hrast, jasen, javor; uljena završna obrada. Debljina 4 cm: 110 KM; 6 cm: 160 KM; 8 cm: 210 KM po komadu. Ne dodajemo nepoznate rokove, lager, cijenu montaže ili dostave.

## Primjeri i primijenjeni principi

| Službeni izvor | Pregledano | Primjena u DAL izvedbi |
| --- | --- | --- |
| [ILICUT, Francuska](https://ilicut.com/en_US/products-list/stair-treads) | Izbor vrsta drveta, dimenzija i debljine; prikaz cijene po izboru | Tri potvrđene vrste, stvarna promjena teksture i debljine; jasna standardna mjera |
| [WoodStairCo, USA](https://www.woodstairco.com/stair-treads-and-risers/wood-stair-treads/white-oak-stair-treads.html) | Razlike modela, završna obrada, prirodne razlike drveta | Potvrđena uljena obrada; objašnjenje prirodnih nijansi i zasebnog upita za drugu mjeru |
| [StairBox, UK](https://www.stairbox.com/stair-treads.html) | Ambijentalni prikaz, izdvojene informacije o proizvodu, FAQ i direktna pomoć | Vlastita nova fotografija stepenica i kratki odgovori prije upita |

Koristimo vlastitu izvedbu, slike i copy. Tuđe slike, obećanja, certifikati, rokovi i konstruktivni savjeti nisu preneseni.

## Implementacija

- Ponuda u `src/lib/catalog/treads.ts`; validacija, integer iznosi u feningima, cijena, poruka i URL izbora u `src/lib/config/tread.ts`.
- `/gazista` obnavlja drvo, debljinu i broj komada iz sigurnog linka. Nepostojeća vrsta, debljina, nevažeća količina i duplirani parametri vraćaju početni izbor uz jasnu poruku.
- Prostorni preview je kodom projektovana ploča 1000 × 300 mm, s debljinom 40/60/80 mm. Nije fotografija gotovog naručenog komada. Ne zahtijeva WebGL. Pogled odozgo i bočne strane prikazuju isti izbor.
- Teksture gornje, uzdužne i poprečne površine koriste postojeći proceduralni generator drveta, s različitim godovima, porama i tonovima za hrast, jasen i javor. Izbor nije CSS promjena boje jedne fotografije. Keš je ograničen na tri vrste.
- Broj komada 1–100 je raspon ovog obračuna, nije tvrdnja o lageru. Količine izvan raspona traže zaseban upit.
- Iznos vrijedi za standardna gazišta. Druga mjera u napomeni ne dobiva izmišljenu proporcionalnu cijenu.
- WhatsApp link sadrži specifikaciju, cijenu po komadu, ukupan iznos gazišta, napomenu i obnovljiv link. Korisnik sam šalje upit. Nema lažne naplate ili potvrde narudžbe.
- Početna dobiva povezano poglavlje o gazištima; navigacija, mobilni meni, podnožje, kontakt, metadata i sitemap uključuju novu kategoriju.

## Nova ambijentalna slika

Ugrađeni imagegen, nova generacija; konačno `public/images/dal-gazista-ambijent.webp`, WebP kvalitet 88. PNG izvor: `generated_images/exec-43638902-9d62-42e9-8bbf-5f9a692df6cb.png` u radnom prostoru. Slika je označena kao vizualizacija ambijenta.

Finalni prompt:

> Use case: photorealistic-natural. Asset type: DAL Workshop stair-tread product section editorial photograph, landscape 1536x1024. Primary request: a beautiful believable close architectural photograph of wooden stair treads in a warm modern Mostar Mediterranean interior, visually consistent with honey plaster and travertine DAL furniture website. Show a REAL straight staircase, 6 visible natural oiled European oak rectangular treads, each modest 100cm wide and30cm deep and4cm thick. Each tread is mounted on SOLID continuous concrete steps with warm plaster risers, fully supported; no floating slabs, no impossible support. View from the bottom sideways, close enough to appreciate grain and satin oiled finish and subtly eased straight front edge. Continuous discreet charcoal steel handrail on the wall, safe believable geometry, all steps equal rise and equal depth, correct perspective. Warm creamy lime plaster, no busy furnishings, sunlight from side outside frame. Restrained architectural magazine photograph, natural 50mm perspective, realistic scale. The stair sequence fills right two-thirds, quieter plaster area on left. No people, NO logo, no letters, no price labels, no ruler or dimension annotations, no watermark. Natural longitudinal oak staves with distinct grain, not fake plastic orange wood. This is a visual inspiration, not a technical construction plan.

## Provjera

- `npm run check`: TypeScript, ESLint, 123 unit testa i produkcijski build prolaze. Build ponovljen nakon završne mobilne CSS dorade.
- Osam ciljnih browser scenarija provjereno: sedam prošlo u zajedničkom pokretanju, jedan nakon korekcije testnog lokatora koji je uključivao i Next route announcer. Funkcionalni obračun, različite teksture, promjena geometrije debljine, pogled odozgo, WhatsApp specifikacija i odbijanje decimalne količine prolaze.
- Mobilni prikaz i navigacija provjereni na 360 × 740, 390 × 844, 844 × 390 i 1024 × 768, bez horizontalnog prelijevanja. Vizualno pregledani meni na 390 px te izbor na 390 i 1440 px.
- Provjeren rad bez WebGL-a i siguran povratak na početni izbor za nevažeći link.

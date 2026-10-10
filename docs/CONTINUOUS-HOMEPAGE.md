# DAL Workshop — kontinuirana početna stranica

## Smjer

Izabrana topla verzija 1 ostaje vizuelna osnova. Najnovije korekcije korisnika imaju prednost: fotografija preko cijelog prvog ekrana, tekst u praznom prostoru, drugi stol potpuno drugačijeg oblika, cjelovit interaktivni prikaz ivica i miran prelazak između sekcija.

Početni kadar i interaktivni detalji prikazuju pravougaoni hrastov stol **150 × 70 cm**, debljine 3,5 cm, prema konačnoj mjeri koju je korisnik potvrdio. Perspektiva fotografija je mirnija i proporcije prirodnije prema standardnim stolicama. Druga fotografija prikazuje mali **okrugli stol** od oraha s jednim centralnim postoljem, umjesto druge fotografije istog pravougaonog stola. Link uz fotografiju prenosi okrugli oblik, orah, promjer 100 cm, zaobljenu ivicu i centralno postolje u postojeći konfigurator. Fotografija je ilustracija ambijenta; mogućnost izrade potvrđuje radionica.

## Istraživanje i primijenjeni principi

Pregledane su službene stranice, ne preuzete tuđe fotografije, tekst ili kod. Ovo je izbor relevantnih kvalitetnih uzora, ne tvrdnja o objektivnom rangiranju “najboljih”.

| Uzor | Zapažanje / primjena na DAL |
| --- | --- |
| [TAKT — Arc Dining Table](https://taktcph.com/products/arc-dining-table/) | Proizvod, fotografije, materijal i priča o svakodnevnoj upotrebi imaju zajednički ritam. Interaktivni prikaz proizvoda vizuelno pregledan u pregledniku; DAL detalji sada prikazuju cijeli stol, zadnju stranu i približenu ivicu. |
| [TEAM 7 — stolovi](https://www.team7-home.com/ch/en/dining/tables/) | Masivno drvo, izbor oblika i prilagodljivost predstavljeni kroz ambijente i proizvod. Vizuelno pregledana stranica; DAL predloženi model u fotografiji otvara odgovarajući oblik u konfiguratoru. |
| [Audo Copenhagen](https://audocph.com/) | Fotografije ambijenta, materijali i kolekcije čine uredničku priču. Za DAL: asimetrične fotografije, manje pravougaonih CTA blokova i zajednička topla podloga. |
| [FYRN — Keyhole Dining Table](https://fyrn.com/pages/keyhole-table) | Američki primjer pažnje prema konstrukciji i detalju proizvoda. Za DAL: prikaz materijala uz jasno objašnjenje odabira ivice. |
| [Room & Board — Top + Base](https://www.roomandboard.com/design/inspiration/top-plus-base-tables) | Izbor ploče i postolja povezan s konkretnim proizvodom. Za DAL: direktan nastavak iz pregleda materijala sa sačuvanim izborom. |
| [Pickawood — konfigurator](https://www.pickawood.com/eu/configurator/7f1147b785fd559c50d03a7181ae2643) | Oblik, mjere, postolje i profil ivice kao povezani izbori. DAL koristi vlastiti postojeći validirani katalog i geometriju. |

## Implementacija

- Hero je fotografija visine prvog ekrana; 3D nije na početnom kadru. Mobilni kadar je posebno komponovan s praznim zidom za naslov i podom za akcije.
- Jedna postepena topla podloga povezuje izbor, materijal, proces, originalne radove i FAQ. Završni poziv prelazi iz iste podloge u tamno podnožje.
- Asimetričan raspored i blago pojavljivanje fotografija pri listanju dodaju ritam bez preuzimanja skrola. Animacije poštuju reduced-motion.
- “Ljepota je u detaljima” koristi postojeći TableConfig, computeTableLayout i pravi TableModel. Ravna i zaobljena ivica mijenjaju profil cijelog oboda ploče, uključujući prednju, bočne i zadnju stranu.
- Cijeli stol / druga strana / detalj ivice su pogledi iste geometrije. Drvo se mijenja kroz katalog. Nastavak prenosi izbor u konfigurator.
- 3D modul se učitava tek kad se sekcija približi ekranu. Rotacija se aktivira izričitim klikom, do tada dodir i točkić miša listaju stranicu.
- Bez WebGL-a se prikazuje promjenjiva prostorna SVG ilustracija iz istog validiranog layouta. To nije tvrdnja da je aktivan 3D.
- Originalni radovi, kontakti, cijene i statusi kataloga ostaju iz prethodno provjerenih izvora.

## Novi slikovni asseti

Generisani ugrađenim imagegen alatom; PNG izvori pretvoreni u WebP radi web isporuke. Nema tuđih preuzetih fotografija.

- `public/images/dal-hero-desktop-150-70.webp`: finalni desktop kadar s prirodnijim proporcijama stola 150 × 70 cm; PNG izvor `exec-a672d04e-8f7d-4c78-90e7-ffc95ca534cc.png`.
- `public/images/dal-hero-mobile-150-70.webp`: finalni mobilni kadar za cijeli prvi ekran; PNG izvor `exec-b4f8a73c-3051-44a3-8503-15ccfe70b42e.png`.
- `public/images/dal-stol-round.webp`: drugi, mali okrugli model u drugačijem ambijentu.

### Finalni prompt za drugi stol

Use case: photorealistic-natural. Asset type: editorial furniture website secondary photograph. Primary request: a completely different SMALL ROUND DINING TABLE, not a rectangular table. Subject: a compact circular solid walnut table, diameter 100 cm, thin 3.5 cm round top with gently rounded edge, a SINGLE central matte black square metal pedestal column on a square flat metal floor plate; absolutely no paired trapezoid frames or X legs. The entire circular top and pedestal must be clearly visible. Backdrop: intimate bright contemporary European apartment dining nook, warm ivory limewashed curved wall, tall window on left opening to soft green garden, warm stone floor, two slender beige upholstered dining chairs behind the round table only, one small ceramic bowl on tabletop. Composition: 3:2 landscape editorial photograph, table centered with full silhouette entirely inside frame, tabletop appears elliptical due camera but truly circular, leave floor room around pedestal; natural eye-level 3/4 perspective, 50mm interior photography. Soft morning light, restrained warm cream and walnut palette, physically believable wood grain and shadows, premium architectural magazine quality. No text, no logo, no watermark, no long rectangular or oval top, no black loop-frame legs, no large table.

### Finalni prompt za mobilni kadar

Edit the reference into a tall mobile full-screen furniture hero, portrait aspect ratio 9:20 approximately 841x1870. Preserve this warm plaster and travertine Mediterranean room, right window, mountains, sunny lighting. Correct the dining table scale: real modest 150cm long x70cm deep x75cm high, top3.5cm, natural oak, two black trapezoidal steel loop frames. Make it visibly less oversized than the reference: shorter tabletop and natural perspective, NOT a banquet table and NOT a close foreground slab. Keep two normal adult chairs with 47cm wide seats as realistic scale reference, do not miniaturize chairs. Natural 50mm camera view, enough room around the furniture. Keep the upper 48% of the composition as empty warm plaster wall for text, chair backs begin around50%, tabletop around55%, all feet finish by70%. The entire table including ALL four corners and ALL feet must be fully visible with at least12% margin left and right; nothing clipped. Lower29% remains empty sunlit travertine floor for website buttons. A single small ceramic bowl and small28cm board. Beautiful convincing real-world furniture dimensions and authentic wood grain. NO text, NO logo, NO dimension overlays, NO interface.

### Finalni prompt za desktop kadar

Edit the reference into a refined photorealistic furniture website hero, landscape 1536x1024. Preserve the warm Mostar Mediterranean room, textured ochre plaster, travertine floor, large window on right, soft late afternoon sun and mountain view. Correct ONLY the dining table scale and staging: it is a modest real table EXACTLY 150 cm long by 70 cm deep, 75 cm high, 3.5 cm oak top, two black trapezoidal steel loop frames. It must look visibly shorter and less oversized than this reference, about 20 percent less apparent length; NOT a 200-240cm banquet table. Keep two normal adult chairs around 47cm seat width as an honest scale reference, with realistic dining clearance, do not shrink the chairs to make the table look huge. No extreme wide angle or exaggerated foreground perspective; use natural 50mm architectural product photography. Whole table and every foot fully in frame, small ceramic bowl and smaller 28cm cutting board. The table should sit on the right half of the room with its left tabletop corner no farther left than 53 percent of frame and right corner inside 94 percent. Preserve the left 46 percent as beautiful uncluttered warm wall and floor negative space for website text. Airy realistic proportions, premium natural grain and joinery. Do not add any letters, logos, labels, dimensions or interface.

Hero kadrovi su uređeni ugrađenim imagegen alatom u režimu lokalne reference (`referenced_image_paths`); drugi stol je nova generacija. WebP isporuka: kvalitet 88, bez naknadnog crtanja fotografije kodom.

## Provjera

Rezultati završne provjere i snimke navedeni su u [design-qa.md](../design-qa.md).


## Revizija zaglavlja i menija — 10. 10. 2026.

Pregledani službeni primjeri [TAKT](https://taktcph.com/) (EU) i [FYRN](https://fyrn.com/) (USA): prepoznatljiv jednostavan znak, kratka glavna navigacija, odvojene kategorije proizvoda i prateće informacije. TAKT je dodatno vizuelno pregledan u pregledniku. Primijenjena je vlastita izvedba, bez preuzimanja njihovih slika ili koda.

- Logo koristi originalne oblike slova iz postojeće fotografije. SVG filter odvaja tamnu teksturiranu pozadinu i prikazuje svijetlu jednobojnu web varijantu, bez pravougaonika na hero fotografiji. Izvorni JPG ostaje sačuvan. Svaka instanca ima svoj filter ID.
- Mobilni meni zauzima cijelu širinu; topla tamna podloga odgovara završetku stranice. Stolovi i daske imaju postojeće DAL ambijentalne fotografije, ostali linkovi su u kompaktnom rasporedu.
- Jasan kružni izlaz, izvorni dialog focus trap, Escape, vraćanje fokusa i zaključavanje pozadinskog skrolanja. Automatski fokus na izlazu pokazuje samo mali fokusni prsten.
- Desktop navigacija ima prozirnu tamnu podlogu radi čitljivosti preko svijetlog prozora; smanjena je težina cijelog zaglavlja.
- Mali ekrani i pejzažni prikaz ostaju skrolabilni; animacija poštuje reduced-motion postavku.

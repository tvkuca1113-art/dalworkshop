# Design QA — kontinuirana DAL početna

Završna provjera: produkcijski build i pregled nove početne završeni; objava se provjerava.

## Zahtjevi i provjera

| Zahtjev | Implementacija | Dokaz |
| --- | --- | --- |
| Slika preko cijelog prvog ekrana | Hero 100svh, poseban mobilni kadar; naslov u zidu i akcije na podu | 360×740, 390×844, 390×938; snimke početne 390 i 1440 |
| Drugi stol, potpuno drugačiji oblik | Mali okrugli stol od oraha s centralnim postoljem | Druga ambijentalna fotografija; link otvara okrugli oblik / promjer 100 cm |
| Nema 3D u hero kadru | Fotografija; dinamički 3D se učitava tek blizu sekcije detalja | Test bez početnog canvas elementa / viewer modula |
| Cijeli stol i sve ivice | Validirani TableConfig i TableModel; profil cijelog oboda, dva ugla i detalj | Stvarna promjena piksela i geometryKey; kamera zadnje strane; snimke ravne i zaobljene ivice |
| Normalno listanje na mobitelu | Touch pan-y; rotacija na izričit klik; promjena pogleda završava rotaciju | Mobilni test listanja i rotacije |
| Stranica iz jednog komada | Zajednička topla podloga, blage promjene tona, asimetričan ritam fotografija i prelaz u završni blok | Cijela početna 390 i 1440 |
| Sačuvan izbor | Drvo i ivica iz detalja prenose se u konfigurator | E2E do specifikacije istog izbora |
| Bez WebGL-a | Prostorna SVG ilustracija iz istog layouta, promjena ivice i pogleda | Test bez WebGL-a, bez runtime greške |

## Okruženje

Produkcijski Next.js build. Desktop Chromium 1440×900 i mobilni Chromium 390×844; dodatno 360×740, 390×938 i pejzaž 844×390. WebGL u automatizovanim testovima koristi SwiftShader. To nije test fizičkog iPhone uređaja.

## Završni rezultati

- npm run check: prošlo — TypeScript, ESLint, 111/111 unit testova i produkcijski build.
- Puni E2E ciklus: 40/42 prošlo. Test upita zatekao je poruku iz prethodnog testiranja; test sa 100 promjena dimenzija prekoračio je vrijeme u softverskom WebGL okruženju. Ponovna provjera koristi zaseban direktorij upita i manju scenu uz iste provjere 100 promjena i isti limit resursa.
- Mobilna i desktop početna, cijela stranica i prikaz ivica vizuelno pregledani. Ranije snimke u docs/screenshots ostaju historijski zapis prethodnih iteracija.
- GitHub i javna objava: provjera nakon ažuriranja grane.

## Istraživanje i slike

[CONTINUOUS-HOMEPAGE.md](docs/CONTINUOUS-HOMEPAGE.md) sadrži službene evropske i američke uzore, primijenjene principe, lokacije oba nova asseta i finalne imagegen promptove.

## Historija

Ovaj QA zamjenjuje prethodni raspored u kojem je mobilna fotografija bila iznad krem tekstualnog bloka. Korisnik sada traži fotografiju preko cijelog prvog ekrana. Prethodne comparison-*.jpg snimke ostaju historijski dokaz prethodne iteracije.

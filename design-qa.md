# Design QA — mobilna kompozicija i usklađivanje DAL stranice

Final result: passed

## Izvor i opseg

Topli ambijent odabrane verzije 1 (`docs/reference/selected-design-1.webp`) plus najnovije korisnikove mobilne snimke i izričite korekcije: tekst ne smije prekrivati stol, nema 3D na početnoj, logo/meni/podnožje moraju biti uklopljeni, konfigurator treba bolje vizuale.

Mobilni raspored namjerno odstupa od starog overlay koncepta: fotografija je iznad tekstualnog bloka. To je tražena korekcija, ne pokušaj identične reprodukcije starog mockupa. Stare `comparison-type-actions.jpg` i referentni mockup dokumentuju prethodni koncept.

## Vizuelni i funkcionalni kriteriji

| Površina | Provedena korekcija | Dokaz |
| --- | --- | --- |
| Fotografija i tekst | Mobilni naslov i oba CTA su ispod slike; desktop tekst u praznom lijevom zidu | `pocetna-390.png`, `pocetna-1440.png`, test fizičke granice slike na 360 i 390px |
| Logo i zaglavlje | Originalni raster, uklonjena tamna pozadina kroz SVG filter, manja veličina i mirnije kontrole | Snimke početne i oba konfiguratora |
| Meni | Svijetli panel; kraći linkovi i akcije; Escape/fokus/skrol/current-page close | `meni-390.png`, mobilni testovi |
| Prelazak kroz stranice | Iste krem površine, serif naslovi, fotografija prije copy-ja u mobilnim uvodima proizvoda | Cijela početna; ručni pregled proizvoda i materijala |
| Podnožje | Dvije mobilne kolone; nema fixed step trake preko kontakta | `podnozje-konfigurator-390.png`, oba konfiguratora u regresijskom testu |
| 3D | Blaže sjene, prirodniji ugao, neutralna studijska paleta i finiji materijali | Snimke oba konfiguratora, oraha, ivice i gravure |
| Funkcije | Postojeći validirani katalog, geometrija, mjere, stanja, fallback, upiti i štampa | Cijeli E2E paket; memorijski i geometrijski budžet |

## Okruženja

Produkcijski build: desktop 1440×900 i mobilni 390×844; dodatno sve rute na 360×740, 390×844 i 844×390. WebGL u automatizovanim testovima koristi SwiftShader. Cloud preglednik je dodatna provjera desktop UI-ja i 2D fallback-a jer nema WebGL2.

## Provjere

- `npm run check`: prošlo, uključujući 111/111 unit testova.
- Cijeli `npm run test:e2e`: 38/38 prošlo. Nakon završnih dorada: 23/23 relevantna E2E testa prošla, bez retry-a.
- Završni pregled mobilnih i desktop snimki: prošao. Fotografija, meni, podnožje i oba 3D konfiguratora vizuelno pregledani.


## Usporedbe na istom okviru

`comparison-mobile.jpg` i `comparison-desktop.jpg`: prethodno objavljeni commit `3f4d842` lijevo, nova implementacija desno, normalizovani na isti CSS viewport. Mobilni okvir 390×844; desktop 1440×900 proporcionalno prikazan na 720×450. `comparison-configurator.jpg` poredi isti početni stol, mobitel 390×844. Nema okvira uređaja ili browser chrome-a u usporedbama.

`pocetna-cijela-1440.jpg` i `pocetna-cijela-390.jpg` dokumentuju sve sekcije (direktne browser snimke, JPEG 85). Standardni viewporti i 3D dokazi ostaju PNG.

## Zatvoren nalaz završne provjere

P1: smooth skrolanje pri izmjeni koraka i fokusiranju polja moglo je pomjeriti gravura radio opciju tokom klika. Konfigurator sada skrola neposredno; dokument ima scroll-padding za sticky scenu i mobilnu traku, bez dvostrukog pomaka na panelu. Ponovljeni tokovi stolova, dasaka, gravure i mobilne snimke prolaze u završnih 23/23 testova.

Nema otvorenih P0/P1/P2 nalaza u provjerenom opsegu. Cloud preglednik dodatno potvrđuje usklađen desktop UI; WebGL scene i materijali provjereni su automatizovanim produkcijskim snimkama.

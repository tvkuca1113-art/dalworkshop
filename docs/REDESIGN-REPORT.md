# DAL Workshop — dorada prema mobilnim snimkama

Korisnik je zadržao toplu ambijentalnu verziju 1, zatražio uklanjanje početnog 3D prikaza, bolju kompoziciju na mobitelu, usklađen logo/meni/podnožje, bolje vizuale konfiguratora i GitHub objavu.

## Primijenjene promjene

- Na mobitelu fotografija stola ima zaseban prostor, prije naslova i akcija. Tekst ne prekriva proizvod. Desktop koristi prazni lijevi dio ambijenta za kraći, dvoredni naslov.
- Početna je sada server-renderovana fotografija bez 3D dijaloga, WebGL canvasa ili uvoza ViewerShell-a.
- Originalni DAL logo je manji; SVG filter u prikazu uklanja tamnu pozadinu, bez izmjene originalnog raster fajla. Zaglavlje ima diskretan fotografski sloj, slim CTA i punu tamnu pozadinu pri skrolanju.
- Mobilni meni je svijetli panel sa sažetim linkovima i dvije akcije. Escape, fokus, blokada skrolanja i zatvaranje linkom na trenutnu stranicu rade.
- Mobilno podnožje koristi dvije kolone i manji brend blok. Traka koraka konfiguratora se skriva kada je podnožje vidljivo, kao i dok korisnik unosi tekst.
- Materijali na početnoj su na toploj svijetloj površini, uz iste tipografske proporcije i tanke linije. Završni poziv i podnožje dijele jednu tamnu cjelinu.
- Uvodi za stolove i daske na mobitelu također daju prednost fotografiji, pa tok od početne do proizvoda i konfiguratora ostaje usklađen.
- 3D prikaz: prirodniji ugao kamere, blaže osvjetljenje, svjetlija studijska pozadina, VSM sjene s blur-om, niža intenzivnost sjene i kontaktne sjenke, finiji bump drveta i satin metal. Prikaz se renderuje na zahtjev; geometrija, mjere i statusi opcija ostaju zasnovani na istom validiranom izboru.
- Kontrole prikaza imaju manje vizuelne težine; mobilna scena zauzima 44svh uključujući alatnu traku. Odabrane kartice imaju jasan bočni marker.

## Istraženi primarni primjeri

Ovo su relevantni primjeri, bez tvrdnje da postoji objektivno rangiranje „najboljih“ stranica. Primijenjeni su obrasci, a nisu kopirani njihovi kod, fotografije ili poslovne tvrdnje.

| Primjer | Ideja primijenjena na DAL |
| --- | --- |
| [TAKT, Danska](https://taktcph.com/) | Fotografija u fokusu, kratka poruka, mirna navigacija i jasan put do proizvoda |
| [TEAM 7, Austrija](https://www.team7-home.com/de/en/configurable-products/) | Poseban prostor za konfiguraciju, jasni materijali i kontrolisan pregled izbora |
| [Room & Board, SAD](https://www.roomandboard.com/design/inspiration/top-plus-base-tables) | Razdvajanje izbora ploče, postolja i dimenzija; isti princip ostaje u DAL koracima |
| [Fyrn, SAD](https://fyrn.com/pages/keyhole-table) | Fokus na proizvod, izradu i prilagodbu prostoru, uz sažet copy |
| [Benchmark, UK](https://benchmarkfurniture.com/bespoke-furniture/) | Jasno objašnjenje prilagodbe i direktnog dogovora za izradu po mjeri |
| [HEM, Švedska](https://hem.com/en-eu/furniture/tables-and-side-tables) | Fotografije i kratke kategorijske poruke uz ujednačene rubove i razmake |

Tehnički oslonac za VSM blur/intenzivnost: [Three.js LightShadow](https://threejs.org/docs/pages/LightShadow.html). Provjera na instaliranom Next.js 16.4, React 19.3 i Three.js 0.186.1.

## Validacija

TypeScript, ESLint, svih 111 unit testova i produkcijski build su prošli. Cijeli E2E paket: 38/38 prošlo. Nakon završne dorade skrolanja, kontrasta i touch kontrola: 23/23 relevantna E2E testa prošla bez ponavljanja. Završna vizuelna provjera i usporedbe su zabilježene u `design-qa.md`, rezultat passed. Statistike: `docs/qa-results.json`.

Stvarne fotografije radionice, originalni raster logo, izabrane ambijentalne slike, katalog, statusi dostupnosti, cijene, mjere, upiti, permalink, gravura i štampa ostaju povezani s postojećim izvorima. Testni upiti ne šalju stvarne poruke radionici.

Konfigurator koristi neposredno skrolanje između koraka i razmake koji čuvaju polja od sticky scene/trake; time je zatvoren nalaz pomicanja gravura opcije tokom mobilnog klika.

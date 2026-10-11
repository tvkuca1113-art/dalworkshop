# DAL Workshop — podaci koje radionica treba potvrditi

Stranica radi i bez ovih potvrda: sve što nije potvrđeno prikazano je kao „Prijedlog po mjeri“ ili „Potrebna potvrda radionice“, a cijena stola je uvijek „prema ponudi“. Potvrde služe da prijedlozi postanu stvarna ponuda.

Gdje se mijenja: katalog `src/lib/catalog/*.ts` (statusi, rasponi, opcije), cijene `src/lib/config/pricing.ts`, kontakti `src/lib/catalog/brand.ts`.

## 1. Oblici i postolja stolova
- Koje oblike izrađujete: pravougaoni (objavljen), zaobljeni uglovi, ovalni (prava elipsa), okrugli, prirodna ivica?
- Koja postolja nudite: trapezni okviri (objavljeni), U okviri, X okviri, A metalni nosači, četiri sužene drvene noge, puni drveni nosači, centralno postolje? Tri nova modela su vizuelni prijedlozi, a ne potvrđena ponuda. Profili čelika (konfigurator koristi 40 × 60 mm za trapez, 40 × 80 mm za U, 40 × 40 mm za X, stub Ø 90 mm).
- Pravilo za centralno postolje (konfigurator: do 160 cm dužine i za okrugle stolove).
- Da li je ivica objavljenog stola blago oborena (konfigurator: 2 mm), i radijus zaobljene ivice (konfigurator: 8 mm).

## 2. Vrste drveta po kategoriji
- Stolovi: hrast je potvrđen primjerom; orah i jasen su prijedlozi.
- Daske: javor + bukva potvrđeni objavom; „orah i jasen“ samo iz oznaka uz objavu; vrsta drveta daske s ručkama nije navedena (konfigurator predlaže hrast).
- End-grain (kockasta) daska je skrivena iza zastavice `NEXT_PUBLIC_FEATURE_END_GRAIN` dok je ne potvrdite.

## 3. Personalizacija
- Da li je nudite i kojim postupkom (laser, žig, ručno graviranje)?
- Dozvoljena mjesta (gornja ploha, ugao, poleđina), najmanja/najveća visina slova, fontovi.
- Ako je ne nudite: postavite `NEXT_PUBLIC_PERSONALIZATION=off` i editor nestaje.

## 4. Dimenzijski limiti
Razvojni rasponi (nisu vaši proizvodni limiti):
- Stol pravougaoni 120–280 × 60–110 cm, ovalni 140–260 × 80–110 cm, okrugli Ø 80–150 cm, ploča 2,5–5 cm, visina 72–78 cm.
- Daska 25–80 × 15–40 cm, debljina 1,5–4 cm, okrugla Ø 20–40 cm, daska s drškom ukupno 30–80 cm (drška 11 cm).
- Utori: dubina do 6 mm i najmanje 65 % debljine ispod utora; obodni kanal 20 mm od ruba, širina 10 mm.
- Metalne ručke: razmak rupa 96/128/160/192 mm, 38 mm od kraja.

## 5. Visina objavljenog stola
Nije objavljena. Konfigurator koristi 75 cm i označava je kao prijedlog.

## 6. Premaz / završna obrada
- Daske: objave spominju „ulje i vosak pogodne za hranu“ i „mineralno ulje“ — koji tačno proizvodi i za koje daske?
- Stolovi: koji premaz koristite (ulje, vosak, lak)? Do potvrde se nijanse prikazuju samo kao vizuelni prijedlog.

## 7. Važenje cjenovnika dasaka
Objava: 50 × 20 cm — 25 KM; 60 × 20 cm — 35 KM; 80 × 20 cm — 50 KM. Nepoznato: debljina, varijanta, uključenost ručki/utora/gravure, da li cijene važe danas. Do potvrde se ne primjenjuju u konfiguratoru (`appliesToConfigurator: false`).
Kad potvrdite cjenovnik, upisuje se u `PRICE_CATALOG` (verzija + pravila u feningima); `calculatePrice` već računa samo potvrđene stavke.

## 8. Rok izrade i dostava
Nije objavljeno. Stranica govori samo „rok i isporuka po dogovoru“, bez obećanja dostave van BiH.

## 9. Kontakt i pravni podaci
- Primarni broj +387 62 704 560 (WhatsApp) i e-mail dalworkshop@hotmail.com — potvrditi.
- Sekundarni broj +387 63 810 946 (iz jedne objave) — prikazan samo kao dodatni broj; da li ga zadržati?
- Pravni naziv i adresa (za politiku privatnosti; na stranici trenutno samo „DAL Workshop, Mostar“).
- Dozvola za objavu fotografija i loga na webu.

## 10. Izvorni vektorski logo
Na webu je preuzeti JPG raster 1254 × 1254 (Facebook). Za oštar prikaz na malim veličinama i favicon potreban je izvorni SVG/PDF/AI.

## 11. Integracije
- Domena (za `NEXT_PUBLIC_SITE_URL`) i uključivanje indeksiranja (`SITE_INDEXING=on`).
- Resend nalog s verificiranom domenom pošiljaoca i Upstash Redis baza — tek tada web obrazac radi.

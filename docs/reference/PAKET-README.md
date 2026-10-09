# DAL Workshop — paket za Claude Code

Ovaj paket sadrži superprompt, istraživanje, originalni logo, fotografije proizvoda i tri pripremljena vizuala. Ovo nije gotova web aplikacija.

## Kako pokrenuti izradu

1. Raspakuj ZIP.
2. Otvori novi projektni folder u Claude Codeu ili folder postojeće aplikacije.
3. Dodaj sadržaj foldera `public` u projekt, bez prepisivanja drugih postojećih asseta. Dodaj i priložene Markdown/JSON datoteke u referentni folder.
4. Otvori `CLAUDE-CODE-SUPERPROMPT.md` i kopiraj kompletan tekst ispod razdjelnika u Claude Code.
5. Navedi gdje se nalaze datoteke i pokreni izradu. Ako Claude može čitati folder, dovoljno je: „Pročitaj CLAUDE-CODE-SUPERPROMPT.md i priložene reference. Izradi aplikaciju do kraja prema specifikaciji, provjeri je u browseru i predaj izvještaj o testiranju.“

## Datoteke

| Datoteka/folder | Namjena |
| --- | --- |
| `CLAUDE-CODE-SUPERPROMPT.md` | Cjelovita specifikacija izrade i provjere |
| `ISTRAZIVANJE.md` | Nalazi, reference, izvori i ograničenja provjere |
| `CATALOG-SEED.json` | Provjerene činjenice i odvojeni razvojni prijedlozi; nije gotov backend katalog |
| `ASSET-MANIFEST.json` | Porijeklo i namjena slika |
| `IMAGE-PROMPTS.json` | Promptovi za izrađene vizuale |
| `public/brand` | Originalni Facebook logo 1254 × 1254 px i mali Instagram avatar |
| `public/images` | Tri finalna vizuala, PNG i WebP |
| `public/originals` | Originalne DAL objave i fotografije |

## Podrazumijevani način rada

Kupac konfigurira proizvod i traži ponudu. WhatsApp: +387 62 704 560. Web forma radi nakon povezivanja stvarnog e-mail servisa. Stolovi nemaju izmišljenu cijenu. Objavljeni cjenovnik dasaka sačuvan je kao izvor za potvrdu, bez primjene na sve varijante.

Prije stvarne prodaje DAL treba potvrditi cijene, proizvodne opcije, personalizaciju, premaze, rokove i dostavu. To je predviđeno promptom i ne sprječava izradu funkcionalnog prezentacijskog konfiguratora.

Logo je preuzeti JPG raster, ne izvorni vektor. Stilizirane fotografije ambijenta nisu dokumentacija radionice; čiste originale koristi za vjernost stvarnim proizvodima. Prije javnog korištenja DAL fotografija i brenda potvrditi korištenje s vlasnikom; za privatni pregled i pripremu prijedloga ne treba slati upite firmi.

Vizual stola je revidiran: prirodniji niži ugao kamere, svijetli ambijent i mekše sjene. Superprompt je usklađen s novim kadrom; naslov i CTA su iznad fotografije da stol ostane potpuno vidljiv.

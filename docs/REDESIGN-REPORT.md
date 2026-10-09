# Redizajn DAL Workshop — odabrana verzija 1

Korisnik je izabrao toplu ambijentalnu verziju 1 i odobrio usklađivanje cijele stranice te GitHub objavu.

## Šta je promijenjeno

- Početna: responsive ambijentalni hero bez ugrađenog teksta u fotografiji, naslov i CTA iz odabrane verzije, diskretno otvaranje 3D dijaloga.
- Cijela stranica: zajednička krem/charcoal paleta, serif naslovi, bolji razmaci i jasniji copywriting.
- Stolovi i daske: produktni uvodi s fotografijom, direktan ulaz u konfigurator i kontakt, odvojene originalne fotografije izrađenih proizvoda.
- Navigacija: aktivna stranica, početno fiksirano zaglavlje, čitljiv meni tokom skrolanja, ispravan povrat na vrh kod prelaska na proizvodnu stranicu.
- Konfiguratori i pregled: tople površine, jasnije oznake i objašnjenja; postojeće mjere, geometrija, 3D/2D, gravura, permalink i slanje upita zadržani.
- Kontakt: korisniku razumljiv WhatsApp tok kad e-mail infrastruktura nije konfigurirana; stvarni obrazac ostaje aktivan kada su postavljene postojeće servisne varijable.
- Hero fotografije optimizovane u lokalni WebP (~230KB desktop, ~215KB mobile), nova Open Graph fotografija. Fontovi i asseti lokalni.

## Validacija

| Provjera | Rezultat |
| --- | --- |
| TypeScript, ESLint, produkcijski build | prošlo |
| Unit testovi | 111/111 |
| Kompletna E2E provjera | 35/35, bez retry-a |
| Završni homepage/mobile/screenshot testovi nakon dorada | 9/9 |
| Završni runtime/asset/SEO testovi | 3/3 |
| Vizualna usporedba verzije 1 | `design-qa.md`: passed |

E2E pokriva tokove upita, sve opcije stolova/dasaka, graviranje, ispis, WebGL fallback, vraćanje stanja, memorijski budžet nakon 100 izmjena, mobilni meni i prelijevanje. Upiti u testu koriste lokalni transport i ne šalju poruke radionici.

Lokalni build bez Vercel/site URL varijabli prikazuje postojeće upozorenje o metadataBase; produkcija koristi postojeći `deploymentOrigin()` i Vercel URL. Postojeći prekidač indeksiranja nije mijenjan.

Snimke završne implementacije i kombinovane usporedbe dostupne su u `docs/screenshots/`. Izvorni odabrani koncept čuva se u `docs/reference/selected-design-1.webp`.

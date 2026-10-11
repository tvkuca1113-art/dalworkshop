# DAL Workshop — unapređenje iskustva izbora, 11. 10. 2026.

Cilj: kupac može zamisliti komad u svom domu, zabilježiti ono što još ne zna i poslati razumljiv upit radionici. Prikaz konfiguracije je prijedlog; konačnu izradu, cijenu i rok potvrđuje DAL.

## Referentne stranice i preuzeti principi

- [Pickawood, Evropa](https://www.pickawood.com/en/configurator/tables): pomoć s mjerama uz samu odluku, oko 60–70 cm po osobi, provjera vlastitih stolica i njihovih naslona. DAL koristi orijentacionu pomoć; ne preuzima njihove konstrukcijske limite ili proizvodna obećanja.
- [Brick Mill Furniture, SAD](https://brickmillfurniture.com/products/the-palmer-dining-table): kombinacija ambijenta, krupnih detalja i pregleda proizvoda. DAL proširuje priču o materijalu i drži konfiguraciju vizuelno dominantnom.
- [Ethnicraft, Belgija](https://inspiration.ethnicraft.com/en/bok-collection): jednostavna prezentacija karaktera masivnog drveta i skulpturalnog postolja. DAL zadržava vlastitu paletu, logo, tipografiju i fotografije.
- [Hardtwood, SAD](https://www.hardtwoodus.com/pages/dining-tables): individualni karakter ploče i izbor detalja kroz razgovor. Kod DAL-a kupac može označiti „Nisam siguran“ bez prekida upita.
- [TableLegs.com, SAD](https://www.tablelegs.com/shop-by-products/table-bases/): vizuelno poređenje više stilova postolja. Dodana su tri parametarska prijedloga u DAL katalog, bez kopiranja tuđih fotografija ili komercijalnih modela.

Ovo je kvalitativno istraživanje referenci, ne rang-lista svih stranica u SAD-u i Evropi, niti dokaz izmjerenog povećanja konverzija.

## Reddit i forumi

- [Reddit: pomoć pri kupovini stola po mjeri](https://www.reddit.com/r/woodworking/comments/soj7og): konkretan zahtjev za metalno postolje i okvir. Poticaj za slanje vlastite fotografije i zahtjeva, umjesto ograničavanja kupca na gotove modele.
- [Reddit: potraga za odgovarajućim stilom i veličinom](https://www.reddit.com/r/woodworking/comments/zwvtwn): željeni stil nogu može biti neusklađen s prostorom, uz neodlučenost oko drveta. Poticaj za zasebne reference nogu, cijelog stola i prostora, te izbor „Nisam siguran“.
- [Wood Talk Online: X postolje i prostor za noge](https://www.woodtalkonline.com/topic/22955-x-base-rustic-dining-table-design-help/): pitanja o rasporedu sjedenja, uvlačenju nosača i konstrukciji. DAL traži podatke o stolicama i sjedenju na krajevima; 3D model se ne predstavlja kao proračun stabilnosti.

Reddit stranice bile su dostupne kroz indeksirane rezultate; direktno otvaranje tih rasprava nije uspjelo. Zaključci su dizajnerske interpretacije navedenih primjera, ne tvrdnja o svim kupcima.

## Implementacija

- Topla početna s detaljem drveta i sekcijama koje prelaze preko prethodne scene. Mirnija varijanta za smanjeno kretanje.
- Kontakt na početnoj, uz izbor vrste upita i kratku ličnu poruku za WhatsApp.
- Vizuelne opcije oblika i sedam postolja; tri nova: A metalno, četiri sužene drvene noge, puni drveni nosači.
- Fine pore i mirnija završna obrada u stvarnom WebGL 3D prikazu; fizički skalirane teksture drvenih nogu.
- Prostorni rezervni prikaz i nacrt s mjerama koriste isti raspored u milimetrima kao 3D.
- „Nisam siguran“ za oblik, drvo, svaku aktivnu mjeru, ivicu, postolje i nijansu. Stanje ide u sačuvani izbor, link, PDF i tekst upita. Konkretan izbor uklanja samo svoju oznaku neodlučenosti.
- Reference: tri fotografije do 8 MB, JPG/PNG/WebP, stvarna provjera otvaranja slike, pregled i uklanjanje.
- Fotografije ostaju lokalno: native Web Share prenosi datoteke i tekst na podržanim uređajima; WhatsApp link prenosi tekst i zahtijeva ručno dodavanje priloga. PDF uključuje fotografije. Ne postoji lažna potvrda serverskog uploada ili dostave.

## Šta pratiti nakon objave

U analitici je korisno mjeriti ulazak u konfigurator, dolazak do pregleda i klik za kontakt. Posljednji klik nije dokaz poslanog upita ili narudžbe. Poslovni rezultat treba povezati sa stvarnim razgovorima i dogovorenim ponudama. Ovim izmjenama nisu dodani vanjski tracker-i.

Uz odabrane fotografije prikazuju se WhatsApp, sistemsko dijeljenje i PDF; postojeći e-mail obrazac ostaje dostupan za upite bez fotografija, kako ne bi obećavao dostavu priloga koje ne prenosi.

## Provjera prije objave

`npm run check` prolazi: TypeScript, ESLint, 164 jedinična testa i produkcijski build. Svih 52 scenarija u pregledniku prošlo je kroz puno i ciljana Playwright pokretanja, uključujući 3D, mobilni raspored, oporavak bez WebGL-a, neodlučenost, fotografije, kontakt i ispis. PDF s fotografijom vizuelno je pregledan na obje stranice.

Odabrani snimci novog prikaza nalaze se u `docs/screenshots/redesign-*`: početni izbor, drvene noge, prostorni prikaz, detalj drveta, kontakt i mobilni izbor. Mobilna provjera koristi emulaciju preglednika; ne predstavlja test na svakom fizičkom telefonu.

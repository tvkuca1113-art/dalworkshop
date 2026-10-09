# DAL Workshop — superprompt za Claude Code

Kopiraj sve ispod razdjelnika u Claude Code. Prije pokretanja dodaj priloženi folder `public` u projekt i priloži `ISTRAZIVANJE.md`, `ASSET-MANIFEST.json` i `CATALOG-SEED.json`. Ovo je specifikacija za izradu; web aplikacija još nije izrađena niti testirana.

---

Ti si senior full-stack developer, stručnjak za Three.js i konfiguratore proizvoda, art director za premium namještaj i UX dizajner. Napravi kompletnu, originalno dizajniranu web stranicu za DAL Workshop iz Mostara sa STVARNIM interaktivnim 3D konfiguratorima stolova i dasaka za rezanje/serviranje. Radi do završenog rezultata: implementacija, pokretanje, provjera u browseru, ispravke i dokumentacija. Nemoj završiti samo planom ili lijepom početnom stranicom.

## 1. Poslovni cilj i granice

Kupac treba za manje od nekoliko minuta razumjeti ponudu, izabrati proizvod, podesiti izgled i dimenzije, pregledati rezultat iz više uglova i poslati potpun upit DAL Workshopu. Glavni tok je konfiguracija → pregled → zahtjev za ponudu. Direktno plaćanje nije zahtjev ovog projekta.

Obje kategorije moraju biti jasne već u prvom ekranu: STOLovi PO MJERI i DASKE ZA REZANJE I SERVIRANJE. Ne predstavi DAL kao proizvođača samo stolova. Primarni CTA: „Kreirajte svoj stol“. Sekundarni CTA: „Kreirajte svoju dasku“. Kontaktni CTA: „Zatražite ponudu“.

Koristi bosanski jezik i pravopis, prirodan i kratak tekst, izraze „ručna izrada“, „masivno drvo“, „dimenzije“, „postolje“, „završna obrada“, „ponuda“. Sve dimenzije prikaži u cm; novac u KM. Nazive tehnologija zadrži u razvojnoj dokumentaciji.

Napravi potpuno funkcionalan frontend bez potrebe za korisničkim računom. Slanje upita putem WhatsAppa mora raditi uz korisnikov završni klik u WhatsAppu. Za web obrazac implementiraj stvarni serverski put i dokumentiraj potrebne varijable. Ako nisu podešene, koristi pošten WhatsApp tok; ne simuliraj uspješnu dostavu obrasca.

## 2. Provjerene činjenice o DAL Workshopu

Izvori su pregledani 9. 10. 2026. Pročitaj priloženo istraživanje i manifest.

- Instagram: https://www.instagram.com/dalworkshop.ba/ — osam objava u trenutku pregleda.
- Brend: DAL Workshop; lokacija Mostar, BiH; izrada drvenih proizvoda po mjeri i dogovoru.
- Facebook: https://www.facebook.com/p/DAL-Workshop-61583287752988/
- Primarni javni telefon: +387 62 704 560. Facebook izričito navodi WhatsApp za upite.
- Javni poslovni e-mail na Facebooku: dalworkshop@hotmail.com.
- Jedna Instagram objava navodi i +387 63 810 946; zadrži ga u podacima kao sekundarni broj, ne koristi ga kao primarni WhatsApp broj.
- Stvarni objavljeni stol: hrast, 150 × 70 cm, debljina ploče 3,5 cm, crno metalno postolje. Tekst opisuje „blagu nijansu brijesta“; to je opis nijanse, ne dokaz da je ploča mješavina hrasta i brijesta.
- Fotografije pokazuju pravougaonu ploču i dva crna metalna okvirna nosača blago trapezoidnog oblika. Polazni 3D model napravi prema `stol-hrast.jpg`, `stol-hrast-02.jpg` i `stol-hrast-03.jpg`.
- Fotografija i opis potvrđuju dasku od javora i bukve, s uzdužnim trakama. Opis spominje ulje i vosak za hranu. Druga objava spominje mineralno ulje.
- Druge objave prikazuju dasku s crnim ručkama i dvije vrste drveta; hashtagovi spominju orah, jasen i hrast. Hashtag nije dovoljan dokaz dostupnosti svih materijala u svim proizvodima.
- Objavljeni cjenovnik dasaka: 50 × 20 cm — 25 KM; 60 × 20 cm — 35 KM; 80 × 20 cm — 50 KM. Nisu potvrđeni debljina, tačna varijanta, uključenost ručke/gravure ni važenje cijena danas.
- Nema potvrđene cijene stolova, roka izrade, područja dostave, garancije, dugogodišnje tradicije ili certifikata. Ne izmišljaj ih, broj kupaca, ocjene, svjedočanstva, adresu radionice ni tim.

Razdvoji činjenice, prijedloge dizajna i stavke koje radionica treba potvrditi. Fotografija ambijenta nije dokaz da taj prostor pripada DAL-u.

## 3. Šta preuzeti iz istraživanja

Primijeni principe i tokove, uz vlastiti izgled. Ne kopiraj tuđe logotipe, fotografije, tekstove, gotove modele ili komercijalne teksture.

- Table du Sud, Nizozemska: pregledan raspored sa velikim prikazom i panelom za oblik, materijal, dimenzije, postolje i obradu; ukupni pregled i dijeljenje. Njihov 3D viewer u istraživačkom browseru ostao je na učitavanju, pa to nije potvrda da je njihov cijeli tok uspješno testiran. Za DAL posebno riješi učitavanje i oporavak.
- vitamin design, Njemačka: precizne dimenzije, vrste drveta i tehničke informacije uz 3D opciju. Preuzmi jasnoću specifikacije.
- Refine Kitchenware, SAD: uživo pregledani koraci „proizvod → personalizacija → pregled“, vizuelne opcije konstrukcije, oblika, materijala i dodataka. Koristi isti princip kratkih razumljivih koraka. Njihov prikaz je zasnovan na fotografijama; DAL-ov glavni prikaz mora biti pravi 3D.
- ZEITRAUM, Njemačka: referenca za mirnu prezentaciju masivnog drveta i materijala; nije dokaz 3D konfiguratora.
- SENTIENT, SAD: kontekst proizvoda u prostoru i konsultativni put narudžbe po mjeri.
- John Boos, SAD: razdvojene namjene dasaka i upute za održavanje.
- Skinner Designs, UK: personalizacija kao poseban korak i pregled prije izrade.
- Deer Park Woodwork, Kanada: dopunska referenca za dimenzije, uzorke i kompatibilnost dodataka. Ne svrstavaj ovu firmu u SAD ili Evropu.

Sarizza i HOFMEISTER su sekundarne reference iz istraživanja. Ne zasnivaj arhitekturu na neprovjerenom embed widgetu treće strane.

## 4. Vizuelni smjer: drvo, preciznost i miran luksuz

Izgled treba djelovati kao web autorske radionice namještaja. Drvo i proizvod nose stranicu. Napravi autorsku tipografsku kompoziciju, velike korisne fotografije, tanku grafiku dimenzija, promišljen ritam tamnih i svijetlih površina i umjerene animacije.

Paleta: tamni ugljen `#171816`, topla kost `#F1EDE5`, kamen `#D9D1C4`, bakreno smeđa `#7D5236`, diskretni mesing `#B69A6F`. Osnovni tekst na svijetloj podlozi gotovo crn. Mesing koristi za linije i detalje; male tekstove učini dovoljno kontrastnim. WhatsApp ikona koristi prepoznatljivu zelenu. Provjeri kontrast svih stvarnih kombinacija.

Odaberi jedan karakteran serif za glavne naslove, npr. Cormorant Garamond, i jedan čitljiv sans-serif za sadržaj, npr. Manrope, uz potvrđenu licencu i lokalno hostanje. Obavezna podrška za č, ć, ž, š, đ i Đ; ne učitavaj fontove s vanjskih servisa u runtimeu. Brojeve dimenzija i specifikacije postavi jasno, sa tabularnim numeričkim znakovima gdje je korisno.

Izbjegni generičke SaaS kartice na svakoj sekciji, neon, staklene panele, pretjerano zaobljene pill kontrole, lažne luksuzne zlatne efekte i praznine bez svrhe. Radio opcije proizvoda mogu biti male vizuelne pločice, ali cijela stranica ne treba izgledati kao mreža kartica.

## 5. Originalni logo i slike

Koristi ORIGINALNI logo `public/brand/dal-logo-original.jpg`, preuzet iz javne Facebook profilne fotografije, 1254 × 1254 px. Instagram avatar je dodatna arhivska verzija od 150 × 150 px.

Logo nije izvorni vektor. Nemoj ga označiti kao SVG, rekonstruirati drugim slovima, precrtavati AI-em ili izmisliti novi znak. Originalna tekstura i izgled moraju ostati. Za zaglavlje odaberi tamnu podlogu koja se uklapa u izvor, sa CSS prikazom kadra i kontrolisanim razmakom, bez istezanja. Ako ograničenje rastera ometa malu upotrebu, ostavi uredan original i zapiši zahtjev za izvorni SVG/PDF/AI u završnom izvještaju.

Priložene slike za web:

- `public/images/dal-stol-ambijent.webp` — NOVI prirodniji ambijentalni vizual za hero: niži ugao kamere, ravna ploča, neutralan ton hrasta i mekše dnevno svjetlo. Stol zauzima većinu širine; fotografija nema veliku praznu lijevu zonu za tekst. Naslov i CTA postavi iznad slike na toploj svijetloj podlozi, unutar jedne povezane hero kompozicije. Sačuvaj cijeli stol i postolje u kadru.
- `public/images/dal-daska-ambijent.webp` — sekcija dasaka i ambijent kuhinje.
- `public/images/dal-detalj-hrasta.webp` — detalj materijala i završne obrade.
- PNG verzije istih vizuala su izvori veće kvalitete; koristi WebP na stranici.
- `public/originals/*` su preuzete stvarne objave i fotografije za provjeru. Originalne čiste fotografije proizvoda koristi za katalog i radove.

Tri nova vizuala su generirani/stilizirani iz DAL fotografija, s vizuelnom provjerom. Tretiraj ih kao ambijentalne ilustracije proizvoda, ne kao fotografsku dokumentaciju njihove radionice ili već izvedenih enterijera. Ne koristi ih kao tehničke mjerne nacrte niti kao jedini dokaz identiteta proizvoda. Precizne detalje uvijek uporedi sa originalima.

Objave s ugrađenim marketinškim tekstom nisu hero slike. Ne lijepi cijeli Instagram plakat u glavnu kompoziciju. Naslove i CTA napravi u HTML-u. Ne pretvaraj generiranu fotografiju u 3D model. 3D mora biti geometrija s odgovarajućim materijalima.

## 6. Struktura stranice

Rute:

1. `/` — početna.
2. `/stolovi` — kategorija i stvarni primjer stola.
3. `/daske` — kategorija dasaka za rezanje/serviranje.
4. `/konfigurator/stol` i `/konfigurator/daska` — dvije pune konfiguratorske stranice.
5. `/radovi` — skromna, stvarna galerija; bez izmišljenih projekata.
6. `/odrzavanje` — razumljive upute za drvene proizvode, uz izvore i potvrdu radionice za konkretni premaz.
7. `/kontakt` — kontakt i upit.
8. `/privatnost` — stvaran nacrt politike uz popis podataka i servisa koji se zaista koriste; označi poslovne podatke koji trebaju potvrdu u razvojnoj dokumentaciji.

Početna, redoslijed:

**Hero:** povezana editorial kompozicija na toploj svijetloj podlozi: integrisano zaglavlje, karakteran HTML naslov i CTA iznad široke fotografije, proizvod u fokusu. Mali red „DAL Workshop · Mostar“. H1: „Drvo s karakterom. Izrađeno po vašoj mjeri.“ Podnaslov: „Stolovi od masivnog drveta i daske za rezanje i serviranje, oblikovani prema vašim željama.“ Oba kategorijska CTA vidljiva. Koristi novu fotografiju stola u prirodnom enterijeru, bez nametnutog tamnog filtera i bez prekrivanja stola tekstom. Cijeli stol i nosači moraju ostati vidljivi; ne rasteži sliku, ne forsiraj crop i ne mijenjaj perspektivu. Materijal drva i 3D scena trebaju zadržati neutralno prirodnu boju i realnu geometriju iz originalnih fotografija.

Na hero dodaj „Pogledajte u 3D“ kao stvarnu opciju. Početno prikaži brz poster. Klik učitava isti polazni 3D stol koji koristi konfigurator. Kad se scena uspješno učita, zamijeni vizual kompletnim 3D prikazom sa usklađenom scenom; ne ostavi fotografisani stol iza drugog 3D stola. DOM naslov i CTA ostaju čitljivi izvan aktivne površine za rotiranje. Nema obaveznog neprekidnog automatskog okretanja.

**Odabir proizvoda:** dva velika editorial prikaza „Stol po vašoj mjeri“ i „Daska za svaki dan“, kratak smislen opis i direktan ulaz u odgovarajući konfigurator.

**Materijal i detalj:** veliki kadar drveta, kratak tekst o prirodnim šarama, geometrijski ispravna usporedba ravne i zaobljene ivice iz modela. Može „Pogledajte razliku“ s dvije stvarne postavke iste ploče.

**Kako nastaje vaš komad:** 1. Birate proizvod i detalje. 2. Šaljete konfiguraciju. 3. Dogovaramo mogućnost izrade, cijenu i rok. 4. Izrada i dogovorena isporuka. Bez nepodržane tvrdnje „gotovo za 7 dana“.

**Stvarni proizvodi:** nekoliko čistih DAL fotografija s opisom, ne 12 izmišljenih proizvoda iz jednog stola. Fotografije istog stola iz tri ugla su jedan proizvod.

**FAQ:** drvo se razlikuje po šarama; izbor dimenzija; dogovor cijene i roka; njega; kako poslati poseban zahtjev. Ne obećavaj dostavu u cijeloj Evropi.

**Završni CTA:** „Imate svoju ideju? Pretvorimo je u komad od drveta.“ Kontakti i oba konfiguratora. Footer uredan i kratak.

## 7. Konfigurator stola

Desktop: veliki 3D prikaz na približno 60–68% širine i panel na ostatku. Kontrole organizuj u 5 koraka: Oblik → Drvo i dimenzije → Ivica i postolje → Detalji → Pregled. Izabrane vrijednosti vide se i u sažetku. Povratak na prethodni korak ne resetuje izbor.

Polazni model: pravougaoni hrastov stol, 150 × 70 × 3,5 cm ploča, crni okvirni nosači prema fotografiji. Visina stola nije potvrđena; početnih 75 cm označi kao prijedlog dimenzije u konfiguratoru i dokumentaciji. Izmjerena polazna geometrija treba sačuvati odnos dužine i širine iz izvora.

Opcije implementiraj stvarno, ali katalogom razlikuj potvrđeni primjer od prijedloga po mjeri:

- Oblik: pravougaoni i pravougaoni sa zaobljenim uglovima; okrugli, ovalni i prirodna ivica kao prijedlozi za konsultaciju dok radionica ne potvrdi proizvodnju. Ne označi ih kao „na stanju“.
- Drvo: hrast kao potvrđeni stol; orah i jasen kao prijedlozi po mjeri, sa realno različitim teksturama i jasnim statusom. Ne primjenjuj cijenu drugog drveta bez potvrđenog pravila.
- Dužina, širina ili promjer, debljina ploče i ukupna visina; numeričko polje + kontrola na korake. Za okrugli stol sakrij dužinu/širinu i koristi promjer; za ovalni prikaži dužinu i širinu.
- Ivica: ravna i zaobljena. Prirodna ivica je poseban obris s jasno objašnjenom procjenom širine.
- Postolje: originalni crni trapezoidni okvir; U i X metalni nosači, te centralno postolje kao prijedlozi uz konfiguracijska pravila. Različite opcije moraju imati stvarno različite modele.
- Završna obrada: prirodan izgled i odabrana nijansa kao vizuelni prijedlog; ne tvrdi koji DAL premaz koristi za stol dok nije potvrđeno. Nemoj kupcu nuditi „food-safe lak“ na osnovu pretpostavke.

Početni rasponi za vizuelni prijedlog: pravougaoni 120–280 cm dužine, 60–110 cm širine, ploča 2,5–5 cm i ukupna visina 72–78 cm; okrugli 80–150 cm promjera; ovalni 140–260 × 80–110 cm. Ovo NISU potvrđeni proizvodni limiti. Centralizuj ih u podacima; u UI koristi „Prijedlog po mjeri — mogućnost izrade potvrđujemo uz ponudu“. Korisnik može zatražiti i dimenziju izvan raspona preko posebnog zahtjeva, bez lažne geometrije ili cijene.

3D alati: rotacija 360°, približavanje i udaljavanje, „Sprijeda“, „Odozgo“, „Detalj ivice“, „Vrati pogled“, „Prikaži dimenzije“, „Vrati početne opcije“. Reset pogleda ne resetuje konfiguraciju. Reset konfiguracije ima jasan naziv i traži potvrdu unutar UI-a kad bi izbrisao upisan izbor.

## 8. Konfigurator daske

Odvojen model i posebna pravila, ne umanjena verzija stola.

Koraci: Model i namjena → Drvo i dimenzije → Detalji → Personalizacija ako je dostupna → Pregled.

Polazni modeli iz originala:

1. Pravougaona daska od uzdužnih traka javora i bukve, sa detaljima površine kao na fotografiji. Ne izmišljaj pun obodni kanal jer izvor pokazuje zasebne utore uz krajeve. Očuvaj raspored traka u polaznom primjeru.
2. Pravougaona daska s dvije crne metalne ručke kao na `daske-rucni-rad.jpg`, sa proporcijama iz fotografije. Ručke moraju stvarno biti pričvršćene na dasku, uz prostor za prihvat; ne lebde.
3. Jednostavna pravougaona daska s kombinacijom drveta prema `daske-orah-jasen.jpg`; materijalni sastav potvrditi prije proizvodnog kataloga.

Dodatne opcije po mjeri: pravougaona sa zaobljenim uglovima, okrugla i daska s drvenom drškom; prikaži ih kao prijedlog gdje nisu dokumentirane. End-grain/checkerboard konstrukciju drži iza zastavice i statusa „potrebna potvrda“; ne predstavi je kao postojeći DAL proizvod.

Dimenzije: dužina, širina/promjer i debljina. Za prijedloge dužina 25–80 cm, širina 15–40 cm, debljina 1,5–4 cm; ovo su razvojni rasponi, ne katalog radionice. Za dasku s drškom jasno navedi uključuje li ukupna dužina dršku i prikaži i korisnu plohu. Nema skrivene promjene značenja dimenzije.

Dodaci: bez utora / utori kao na originalu / obodni kanal kao prijedlog; bez ručki / crne metalne ručke gdje je kompatibilno / integrisana drška na posebnom obliku. Promjena mora mijenjati geometriju, ne samo opis.

Personalizacija je željena NOVA funkcija, nije potvrđena DAL usluga. Implementiraj editor, sa `availability: requires_confirmation`. Tekst „Personalizacija po dogovoru“; u zahtjev ulazi kao želja kupca. Ako radionica isključi tu opciju, sakrij editor u proizvodnom modu.

Editor: tekst do 40 znakova, 1–2 reda, tri lokalno dostupna fonta sa B/H/S slovima, položaj, veličina i pregled. Gravuru prikaži tamnom i suptilnom, priljubljenom uz gornju površinu i vezanom za model. Mora ostati na istom mjestu kad se proizvod rotira. Ne smije biti HTML natpis koji pluta iznad canvas-a. Podrazumijevana lokacija može biti poleđina ili kut; objasni da finalno mjesto i način izrade potvrđuje radionica.

Tekst zadrži tačno kako je kupac napisao; nema tihog ispravljanja imena. Izračunaj stvarni bounding box fonta, uračunaj znakove čćžšđ i razmak, ograniči unutar dozvoljene plohe, bez dodira s utorima/ručkama. Za velike natpise ponudi manju veličinu ili drugi položaj s objašnjenjem. Za poseban logotip koristi „Poseban zahtjev“ uz poruku; upload nije obavezan dio prve verzije. Ako ipak radiš upload, prihvati samo provjerene slikovne formate s limitom; sanitizuj ili odbij SVG, ne učitavaj proizvoljni kod.

## 9. Precizna geometrija i materijali

Koristi metarski 3D koordinatni sistem: 1 jedinica = 1 metar; u stanju drži cijele milimetre. UI pretvara cm u mm jednom na granici. Prihvati decimalni zarez i tačku: „3,5“ i „3.5“ oba daju 35 mm. Ne koristi floating point cijene.

Tlocrt modela: X dužina, Z širina, Y visina. Pod je Y=0. Gornja površina stola je Y=ukupna visina; donja Y=visina−debljina. Nosači dodiruju donju površinu/ploču za montažu i pod, nikad ne prolaze kroz drvo. Visina nogu mijenja se s ukupnom visinom i debljinom ploče, uz pravilne montažne elemente.

Dimenzije moraju mijenjati geometriju u stvarnim proporcijama. Ne rasteži cijelu grupu pa zajedno deformišeš debljinu metalnih profila, radijuse rubova i teksturu. Generiši ploču iz 2D obrisa uz pravilnu ekstruziju i bevel. Nosače izraditi kao geometriju realnih profila s dosljednim presjekom; orijentaciju kosih profila izračunaj između njihovih krajnjih tačaka.

Bevel/radijus mora biti manji od relevantne debljine i poludimenzija; validacija sprječava samopresijecanje. Za oval koristi ispravno definiranu elipsu ili capsule obris, a naziv uskladi sa stvarnim oblikom. Okruglo postolje mora podržavati krug, a izbor obostrano postavljenih nogu za okrugli model ili sakrij ili objasni zašto nije ponuđen.

Prirodna ivica: deterministički obris sa seed-om, bez promjene slučajnog uzorka pri svakom renderu. Prikaži da prirodne šare i obris konačnog drveta variraju. Nijedan live-edge model ne smije imati presijecajuće konture.

Za daske: stvarna debljina, rupe/drške i kanali kao izdubljena geometrija gdje su uključeni. Nemoj kao „kanal“ prikazati tamnu crtu ili izdignutu cijev. Ako koristiš CSG, računaj geometriju samo po promjeni konfiguracije, ne po frame-u. Utor mora ostaviti dovoljno materijala; drška i rupe moraju ostati unutar granica, sa marginama određenim razvojnom validacijom i odvojenim od proizvodne potvrde.

PBR: uvjerljive lokalne teksture za hrast, orah, jasen, javor i bukvu iz izvora koji dozvoljavaju upotrebu ili vlastite proceduralne teksture uz poboljšanje do kvalitetnog rezultata. Drvo nije samo jednobojni smeđi materijal. Uzdužna vlakna na plohi, uvjerljiva poprečna vlakna na krajevima; odvojeno UV mapiranje za gornju plohu i rubove. Tekstura održava približno fizičku skalu pri promjeni dimenzija.

Kolorne teksture u sRGB, normal/roughness podaci bez kolornog prostora; ispravan izlazni prostor i tone mapping, bez dvostruke korekcije boje. Drvo: metalness=0, prirodan satin sjaj; metalni okvir: odgovarajuća roughness i metalness. Rasvjeta treba pokazati volumen i materijal, bez pregorjele narančaste površine.

## 10. Jedno stanje za sve funkcije

Kreiraj verzionirane, tipizirane diskriminisane strukture `TableConfig` i `BoardConfig`. `productType` određuje schema-u. Stavke i statusi dolaze iz jednog kataloga, ne iz hardkodiranih vrijednosti u komponentama.

Iz validirane konfiguracije izvodi se: 3D geometrija, dimenzijske oznake, sažetak, tekst WhatsApp poruke, PDF/ispis, permalink i eventualna cijena. Nema zasebne nepovezane kopije konfiguracije za canvas.

Parametri include: modelId, woodId/constructionId, dimenzije u mm, edgeId, baseId ili handleId, finishId, grooveId, personalization, schemaVersion i procedural seed gdje je relevantan. View/camera stanje odvoji od konfiguracije proizvoda.

Validiraj URL/localStorage podatke prije primjene. Odbij nepoznate enum vrijednosti, NaN, negativne/beskonačne dimenzije, preveliki payload i nepoznatu verziju. Migriraj podržane stare verzije; za ostale prikaži razumljivu poruku i valjanu početnu konfiguraciju. Linkovi koriste dopuštene parametre, bez eval, bez učitavanja proizvoljnih asset URL-ova.

Spremanje na uređaj neka bude eksplicitan klik „Sačuvaj izbor“. Čuvaj konfiguraciju lokalno; ne čuvaj ime, telefon, e-mail ili poruku kontakt obrasca. Personalizirani tekst ne uključuj u javni share link po defaultu; omogućiti ga samo uz jasan korisnikov izbor. Izbrisana pohrana i private mode ne smiju rušiti aplikaciju.

„Kopiraj link“ mora zaista generisati i kopirati obnovljiv izbor. Ako clipboard nije dostupan, pokaži polje koje kupac može kopirati. „Preuzmi pregled“ napravi kao kvalitetan ispis u PDF preko `window.print()` sa @media print, uključujući stvarni render/2D pregled i specifikaciju; naziv gumba jasno „Ispiši / sačuvaj PDF“. Direktan PDF download dodaj samo ako ga zaista implementiraš i podržava B/H/S fontove. Export zahtijeva namjenski render; ne drži preserveDrawingBuffer stalno radi jednog downloada.

## 11. Pravila kompatibilnosti i cijene

Svaka vidljiva opcija ima geometrijsko značenje i status: `observed_example`, `proposed_custom` ili `requires_confirmation`. Status fotografisane varijante nije obećanje trenutne dostupnosti. Svojstva koja nedostaju ne smiješ popuniti kao potvrđena.

Pravila provjeravaju: oblik i postolje, radijus i debljinu, smještaj nogu, širinu okvira, overhang, postojeće ručke i utore, prostor za gravuru. Ako promjena uzrokuje konflikt, objasni ga odmah. Izaberi valjanu opciju samo uz vidljivo objašnjenje; za promjenu koja briše korisnikovu personalizaciju sačuvaj tekst i zatraži jasan izbor unutar aplikacije. Ništa ne nestaje neprimjetno.

Ove provjere osiguravaju smislen vizuelni prijedlog; nisu statički proračun ili potvrda nosivosti. Konačnu konstrukciju potvrđuje radionica. Ne ispisuj nosivost u kg bez potvrđenih podataka.

Stolovi: `pricingMode: quote_only`. Cijena je `null`, UI „Cijena prema odabranoj konfiguraciji — šaljemo ponudu“, nikad 0 KM. Za daske sa objavljenim dimenzijama možeš prikazati odvojen blok „Objavljene cijene standardnih dimenzija“ uz datum izvora i napomenu da varijantu i cijenu potvrđuju uz ponudu. Ne primjenjuj te cijene na svaku dasku ili gravuru.

Za buduće potvrđene cijene napravi čistu funkciju `calculatePrice(config,catalog)` koja vraća valjanu cijenu u feningima samo za potvrđena pravila, verziju cjenovnika i stavke; inače status ponude i `null`. Za nepotvrđen dodatak vraća „ponuda potrebna“, ne zbroj bez tog dodatka. Server opet validira proizvod i cijenu; cijena iz klijenta nije autoritativna.

## 12. Slanje potpunog upita

Na završnom pregledu kupac vidi proizvod, sve dimenzije, drvo, dodatke, personalizaciju i napomenu o šarama. CTA „Pošaljite upit na WhatsApp“ otvara `https://wa.me/38762704560?text=` s pravilno URL-enkodiranom porukom, tek nakon korisnikovog klika. U poruci uključiti tačno validirano stanje i permalink bez kontaktnih podataka. Za dasku uključi tačan tekst personalizacije u poruku koju kupac sam šalje, ako ga je unio.

Primjer početka poruke: „Pozdrav, zainteresovan/a sam za izradu po mjeri. Šaljem svoju konfiguraciju:“ zatim konkretne specifikacije i „Molim potvrdu mogućnosti izrade, cijene i roka.“ Otvaranje WhatsAppa ne smije prikazati „Narudžba uspješno poslana“. Prikaži „Dovršite slanje u WhatsAppu“ ili slično.

Za web formu: ime, telefon ili e-mail (najmanje jedno), mjesto dostave kao opcionalno polje, kratka poruka, priložena konfiguracija i potvrda da je upit/procjena. Klijent i server imaju Zod validaciju. Prikaži pending, stvarni uspjeh i korisnu grešku, zadrži upisane podatke kod greške. Pristupačne oznake grešaka.

E-mail adapter npr. Resend uz server-only ključ, potvrđeni sender i konfigurisan recipient. `QUOTE_TO_EMAIL` može biti javni poslovni Hotmail, ali `QUOTE_FROM_EMAIL` mora biti stvarno verificiran pošiljalac. Ne koristi Hotmail kao lažan verificirani sender. Secrets nikad nisu `NEXT_PUBLIC_*`. `.env.example` s nazivima bez stvarnih tajni.

Za zaštitu obrasca: ograničenje veličine i dužine, honey-pot i pouzdana serverska zaštita od ponavljanih zahtjeva. Ako koristiš rate limit, koristi održivo rješenje za serverless okruženje; mapa u memoriji nije globalni rate limiter. Nemoj dodati CAPTCHA samo za ukras. Provider timeout/greška ne daju success. Ako e-mail nije podešen, obrazac se prije slanja jasno prebacuje na WhatsApp ili preuzimanje specifikacije.

Ne dodaj admin panel, prijavu, bazu kupaca, checkout, AR ili naplatu ako ih nije potrebno za ovaj tok. Sačuvani lokalni izbor nije trajna serverska narudžba. Ako kasnije uvedeš trajno čuvanje i reference, koristi stvaran backend; ne napravi lažni broj narudžbe.

## 13. Mobitel i pristupačnost

Stranica mora izgledati osmišljeno na 360, 375, 390, 430, 768, 1024 i 1440 px. Izbjegni 100vh probleme na iOS-u; koristi svh/dvh s fallbackom i safe-area-inset za donje kontrole.

Mobilni hero: naslov i dvije opcije čitljivi, proizvod ne odsiječeš nepromišljenim centriranim cropom. Ako jedan kadar ne može sačuvati i tekst i proizvod, napravi mobilni raspored sa tekstom iznad i širokim kompletnim prikazom proizvoda ispod u istom vizuelnom bloku. Ne zatrpavaj proizvod overlay-em.

Mobilni konfigurator: vidljiva scena otprilike 35–45% dostupne visine, jedan aktivan korak i kratak sticky završni CTA. Panel se prirodno pomjera; nema dvije nejasne unutrašnje scroll zone. Sticky elementi ne prekrivaju inpute, stepper ili otvorenu tastaturu. Mogućnost proširenja scene preko ekrana i jasan izlaz.

U početnom stanju stranica se normalno skrola. U 3D vieweru kupac uključuje „Rotirajte model“ za namjensku touch interakciju; pinch radi unutar scene. Ponudi i dugmad za pogled kako bi korisnik mogao koristiti konfigurator bez gesti. Canvas ne zarobljava scroll po cijelom ekranu.

Sve opcije imaju semantic button/radio/label, `aria-pressed` ili ispravna radio stanja, fokus vidljiv, dodirna površina najmanje 44 × 44 px. Kolor swatch ima tekstualni naziv i stanje. Konfiguracija i opis dostupni su u DOM-u, jer canvas nije pristupačna specifikacija proizvoda. Obrazac, meni, modal, FAQ i lightbox rade tastaturom. Escape zatvara modal; fokus se vraća na trigger.

Poštuj prefers-reduced-motion. Nema audio efekata, scroll hijackinga ni lažnog custom cursora koji ometa upotrebu.

## 14. Tehnologija i performanse

Prvo pročitaj postojeći repo i AGENTS.md ako postoji. Ako postoji održiva aplikacija, prilagodi je uz minimalnu promjenu stacka. Ako je folder nov: koristi stabilnu kompatibilnu verziju Next.js App Routera, TypeScript strict, React, Three.js, @react-three/fiber i @react-three/drei; CSS modules ili Tailwind uz vlastiti dizajn. Pin kompatibilne verzije i sačuvaj lockfile. Provjeri aktuelnu dokumentaciju umjesto nagađanja API-ja.

Server components za sadržaj/SEO; konfigurator kao izolovana client komponenta. WebGL učitaj dinamički isključivo na klijentu; bez hydration mismatcha. Zustand ili pažljivo organizovan reducer za izbor, ne state po svakom frame-u. Vitest za logiku; Playwright za stvarne korisničke tokove.

Modeli mogu biti kvalitetna proceduralna geometrija iz istih podataka; nemoj čekati nepostojeći GLB ili koristiti placeholder kocku kao gotov stol. Ako radiš GLB varijante, dimenzije i podrške moraju ostati parametarske i realne. Sve runtime teksture, HDRI, fontovi i modeli lokalni i s dokumentiranom dozvolom. Ne zavisi od embed-a konkurencije ili njihovog CDN-a.

Jedan WebGL canvas po aktivnom iskustvu; ne učitavaj zaseban canvas za svaku karticu. Na početnoj ga aktiviraj namjerno; u konfiguratoru učitaj rano uz brz poster. DPR početno 1–1,5 na mobitelu i maksimalno 2 na jačem uređaju, adaptivno prema mjerenju. Renderer na zahtjev kada scena miruje; pravilno invalidate za kontrole, tween i promjene.

Materijale/geometrije memoiziraj i pravilno upravljaj njihovim životnim ciklusom. Ne dispose-uj cache resurse koje dijele drugi modeli. Oslobodi vlastite stare geometrije nakon promjene; ne akumuliraj objekte pri 100 promjena dimenzija. Teške CSG operacije debounce i, ako je potrebno, worker. Nema novih texture/geometry objekata u svakoj render petlji.

Daj ograničen broj shadow mapa i primjerene segmente. Vizuelni budžet: oko 100k trokuta ili manje za jednu scenu i do 100 draw callova kao početni cilj, pa mjeri. Kvalitet ne rješavaj ogromnim detaljem koji telefon ne može prikazati. Cilj glatkog reagovanja barem oko 30 FPS na razumnom mobilnom uređaju treba izmjeriti; ne proglasi ga postignutim iz desktop emulacije.

Poster i HTML sadržaj nikad ne čekaju WebGL. Loader ima stvarnu fazu/status, timeout i „Pokušajte ponovo“; ne izmišljaj postotak. Na init error, neuspjeh teksture ili webglcontextlost prikaži funkcionalan 2D parametarski prikaz vezan za ISTU konfiguraciju, uz kratko objašnjenje i opciju oporavka. 2D fallback treba mijenjati oblik, dimenzije i detalje, ne pokazivati stalnu istu sliku za sve izbore. Izbor, upit i tekst personalizacije prežive oporavak.

Optimiziraj slike s ispravnim sizes i dimenzijama; preload samo hero. Za generirane WebP vizuale napravi responsive izvedenice bez oštećenja proizvoda gdje treba. Ciljevi sadržajnih stranica u dokumentovanom mobilnom testu: LCP <2,5 s, CLS <0,1, bez preduvjeta da 3D mora biti učitan za LCP. Zabilježi stvarna mjerenja, ne izmišljaj Lighthouse 100 ili INP bez dovoljnog testiranja.

## 15. SEO i sadržaj

Jedan H1 po stranici, smisleni meta title/description, stvarni alt tekstovi, Open Graph, favicon iz odobrenog brand izvora, robots i sitemap. `metadataBase`/canonical iz konfigurisanog javnog URL-a; ako produkcijska domena nije poznata, nemoj hardkodirati izmišljenu. Demo neka ima noindex putem jasne deployment postavke.

Strukturirani podaci samo za potvrđene činjenice: naziv, Mostar kao područje i javni kontakti. Nema izmišljene ulice, radnog vremena, aggregateRating ili cijene. Product/Offer JSON-LD samo kada postoje stvarni provjereni podaci za tu ponudu. Nemoj stavljati 0 u price za proizvode na upit.

Bez engleskih placeholdera i lorem ipsuma. Održavanje napiši praktično: blago ručno pranje i brzo sušenje za daske, izbjegavanje dugog potapanja i mašine za suđe, njega prema potvrđenoj završnoj obradi. Ne predstavljaj opšte savjete kao garanciju konkretnog proizvoda.

## 16. Obavezna provjera prije završetka

Dokazi trebaju pokazati ponašanje, ne samo prisustvo kontrole. Napiši i izvrši testove koji imaju smisla za konfigurator.

**Logika:** pretvaranje cm/mm s zarezom; minimalne/maksimalne i nedozvoljene dimenzije; samopresijecanje obrisa; noge na podu i pravilna visina ploče; postolje ne prolazi kroz plohu; pravilni konflikt i status custom ponude; utor ne probija dasku; gravura ostaje u sigurnoj zoni; nulirana cijena na nepotvrđen dodatak; permisivni URL se ne primjenjuje; serializacija i ponovno otvaranje daju isto stanje i seed. Za potvrđeni budući cjenovnik testiraj račun u feningima i verziju. Ne potvrđuj nosivost geometrijskim testom.

**Tokovi u browseru:**

1. Početna → stol → promjena dimenzija, materijala, ivice i postolja → sažetak → kopiranje linka → novi tab sa istim izborom.
2. Početna → daska → promjena dimenzija i detalja → tekst „Čaršija • Džemal“ → rotacija i provjera da gravura ostaje na površini → pregled.
3. WhatsApp href dekodiran i upoređen sa stvarnim izborom. Za test ne šalji poruke stvarnoj firmi.
4. Reset pogleda zadržava konfiguraciju; reset opcija zaista vraća valjanu početnu konfiguraciju.
5. Server validacija neispravnog zahtjeva, provider timeout i provider greška daju error; test adapter ili sandbox dokazuje pravi put bez slanja neželjenih produkcijskih upita.
6. Bez e-mail varijabli aplikacija prije pokušaja jasno nudi WhatsApp, bez lažnog successa.
7. Simulirani WebGL init error/lost context → promjenjiv 2D prikaz → sačuvane specifikacije → oporavak bez gubitka izbora.
8. Refresh, back/forward, clipboard unavailable, blokirani localStorage, loš URL i nepoznata verzija.
9. Mobilni portrait/landscape i otvorena tastatura; nema horizontalnog overflowa, odsječenog CTA ili scroll zamke.
10. Print/PDF pregled sadrži ispravan proizvod, sve relevantne dimenzije i čćžšđ; nema praznog canvas-a.

Provjeri Chromium i WebKit emulaciju, uz napomenu da emulator nije fizički iPhone. Na 390 px i 1440 px snimi početnu, oba konfiguratora i pregled. Slike canvas-a moraju pokazati vidljivo različite modele prije i poslije izbora; test koji provjeri samo promijenjen tekst nije dokaz 3D funkcionalnosti. Ručno provjeri UV, rubove, montažu, sjene, perspektivu i proporcije.

Pokreni typecheck, lint, testove i production build. Provjeri stvarne dostupne skripte i ne navodi komandu kao prošlu ako nije izvršena. U konzoli nema neriješenih runtime/hydration grešaka, missing asset 404 ili WebGL grešaka. Ako nešto nije moguće testirati u okruženju, navedi konkretno šta i zašto.

## 17. Redoslijed izrade i predaja

1. Pročitaj repo, priložene datoteke i originalne fotografije. Napravi `IMPLEMENTATION-PLAN.md` i kratki popis pretpostavki; zatim nastavi rad, ne čekaj odobrenje rutinskog plana.
2. Uredi katalog, tipove i validaciju. Seed je činjenična polazna datoteka koju pretvaraš u tipizirane module; nije unaprijed gotova implementacija.
3. Napravi kvalitetan polazni stol i dasku; provjeri konstrukciju i materijale u browseru prije svih animacija.
4. Implementiraj sve vidljive promjene i jedinstveno stanje, pa pregled, dijeljenje, ispis i WhatsApp.
5. Izradi kompletnu stranicu i mobilne tokove; uvedi web obrazac/adaptaciju po stvarnoj konfiguraciji.
6. Izvrši provjere, pregledaj screenshotove, ispravi vizuelne i funkcionalne probleme.
7. Predaj runnable repo, README za lokalno pokretanje, `.env.example`, objašnjenje objave, `TEST-REPORT.md`, `ASSET-LICENSES.md`, snimke provjere i `DAL-POTVRDA-PODATAKA.md`.

U `DAL-POTVRDA-PODATAKA.md` navedi samo preostale poslovne potvrde: proizvedivi oblici/postolja, vrste drveta po kategoriji, personalizacija i njen način, dimenzijski limiti, visina originalnog stola, premaz, važenje cjenovnika, rok/dostava, kontakt i izvorni vektorski logo. One ne smiju zaustaviti izradu funkcionalne verzije koja pošteno koristi upit po mjeri.

Ne mijenjaj postojeću produkcijsku domenu niti objavljuj na nju bez instrukcije. Pripremi preview ako dostupni workflow dopušta. U završnom izvještaju jasno razdvoji: funkcije koje si implementirao i testirao, vanjske integracije koje trebaju konfiguraciju, te poslovne opcije koje DAL treba potvrditi.

Gotovo je kada kupac može na desktopu i mobitelu stvarno promijeniti proizvod, vidjeti geometrijski smislen rezultat, otvoriti isti izbor iz linka, dobiti tačan pregled i pokrenuti potpun upit, uz pošteno prikazanu cijenu/status. Premium izgled i funkcionalnost moraju biti provjereni u istom rezultatu.

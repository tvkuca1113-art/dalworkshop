/**
 * Real, published DAL products (Instagram, reviewed 9. 10. 2026).
 * Photos of the same table from three angles are ONE product.
 */
export interface WorkPhoto {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface Work {
  id: string;
  category: 'stol' | 'daska';
  title: string;
  facts: string[];
  note?: string;
  source: string;
  photos: WorkPhoto[];
  configurator: string;
}

export const WORKS: readonly Work[] = [
  {
    id: 'hrastov-stol',
    category: 'stol',
    title: 'Hrastov stol 150 × 70 cm',
    facts: ['Hrast, ploča 3,5 cm', 'Dva crna metalna okvira blago trapeznog oblika'],
    note: 'Visina stola nije objavljena.',
    source: 'https://www.instagram.com/p/DdZfSIajC34/',
    configurator: '/konfigurator/stol',
    photos: [
      { src: '/originals/stol-hrast.jpg', width: 1088, height: 1456, alt: 'Hrastov stol DAL na terasi, pogled iskosa odozgo' },
      { src: '/originals/stol-hrast-02.jpg', width: 720, height: 964, alt: 'Isti hrastov stol, pogled duž ploče' },
      { src: '/originals/stol-hrast-03.jpg', width: 720, height: 964, alt: 'Isti hrastov stol, ploča odozgo s uzdužnim daskama' },
    ],
  },
  {
    id: 'daska-javor-bukva',
    category: 'daska',
    title: 'Daska od javora i bukve',
    facts: ['Uzdužne trake javora i bukve', 'Zasebni utori uz kraće strane', 'Opis spominje ulje i vosak pogodne za hranu'],
    note: 'Dimenzije nisu objavljene.',
    source: 'https://www.instagram.com/p/DQ4n6NAjKE4/',
    configurator: '/konfigurator/daska',
    photos: [{ src: '/originals/daska-javor-bukva.jpg', width: 1440, height: 1305, alt: 'Daska od svijetlog javora i bukve s utorima uz krajeve' }],
  },
  {
    id: 'daska-rucke',
    category: 'daska',
    title: 'Daska s crnim ručkama',
    facts: ['Dvije crne metalne ručke na gornjoj strani', 'Izrada po dimenzijama na upit'],
    note: 'Vrsta drveta nije navedena u objavi.',
    source: 'https://www.instagram.com/p/DQ5NcRXDKRH/',
    configurator: '/konfigurator/daska',
    photos: [{ src: '/originals/daske-rucni-rad.jpg', width: 1440, height: 1698, alt: 'Drvena daska za serviranje s dvije crne metalne ručke, odozgo' }],
  },
  {
    id: 'daska-dvije-vrste',
    category: 'daska',
    title: 'Daska od dvije vrste drveta',
    facts: ['Svijetle i tamne uzdužne trake', 'Jednostavan pravougaoni oblik'],
    note: 'Oznake uz objavu spominju orah i jasen; sastav potvrđuje radionica.',
    source: 'https://www.instagram.com/p/DRSbYiljPqC/',
    configurator: '/konfigurator/daska',
    photos: [{ src: '/originals/daske-orah-jasen.jpg', width: 1440, height: 1440, alt: 'Pravougaona daska sa svijetlim i tamnim drvom' }],
  },
];

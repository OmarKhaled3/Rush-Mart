export type Offer = {
  id: string;
  num: number;
  en: string;
  ar: string;
  items: Array<{ en: string; ar: string }>;
  price: number | null;
  badge: string | null;
  restriction: { en: string; ar: string } | null;
  limited: { en: string; ar: string } | null;
};

export const offersData: Offer[] = [
  {
    id: 'rush-desert',
    num: 1,
    en: 'Rush Desert',
    ar: 'راش ديزرت',
    items: [
      { en: 'Ice cream', ar: 'آيس كريم' },
      { en: 'Brownies', ar: 'براونيز' },
      { en: 'Chocolate, Lotus, or Caramel sauce', ar: 'صوص شوكولاتة أو لوتس أو كراميل' },
    ],
    price: 150,
    badge: null,
    restriction: null,
    limited: null,
  },
  {
    id: 'morning-rush',
    num: 2,
    en: 'Morning Rush',
    ar: 'مورنينج راش',
    items: [
      { en: 'Any large Americano, Cappuccino, Latte, or Hot Chocolate', ar: 'أي أمريكانو أو كابتشينو أو لاتيه أو هوت شوكليت كبير' },
      { en: 'Plain croissant', ar: 'كرواسون سادة' },
    ],
    price: 125,
    badge: null,
    restriction: { en: '7am – 11am', ar: 'من ٧ إلى ١١ صباحاً' },
    limited: null,
  },
  {
    id: 'rush-combo',
    num: 3,
    en: 'Rush Combo',
    ar: 'راش كومبو',
    items: [
      { en: 'Large Iced Spanish Latte', ar: 'سبانيش لاتيه آيس كبير' },
      { en: 'Plain cookies', ar: 'كوكيز سادة' },
    ],
    price: 150,
    badge: null,
    restriction: { en: 'Sun – Wed', ar: 'الأحد إلى الأربعاء' },
    limited: null,
  },
  {
    id: 'nutella-lovers',
    num: 4,
    en: 'Nutella Lovers Combo',
    ar: 'نوتيلا لافرز كومبو',
    items: [
      { en: 'Nutella Frappe', ar: 'فرابي نوتيلا' },
      { en: 'Brownies with extra Nutella', ar: 'براونيز إكسترا نوتيلا' },
    ],
    price: 160,
    badge: null,
    restriction: null,
    limited: null,
  },
  {
    id: 'rush-friends',
    num: 5,
    en: 'Rush Friends',
    ar: 'راش فريندز',
    items: [
      { en: 'Any coffee or double espresso', ar: 'أي قهوة أو إسبريسو دابل' },
      { en: 'Get the second one free', ar: 'الثانية مجاناً' },
    ],
    price: null,
    badge: '1+1',
    restriction: { en: '7am – 11am', ar: 'من ٧ إلى ١١ صباحاً' },
    limited: { en: 'Limited time offer', ar: 'عرض لفترة محدودة' },
  },
];

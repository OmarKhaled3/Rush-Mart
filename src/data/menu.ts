export type MenuItem = {
  en: string;
  ar: string;
  small: number | null;
  large: number | null;
  price: number | null;
};

export type MenuCategory = {
  id: string;
  en: string;
  ar: string;
  type: 'two-col' | 'single';
  items: MenuItem[];
};

export const menuData: MenuCategory[] = [
  {
    id: 'coffee',
    en: 'Coffee',
    ar: 'قهوة',
    type: 'two-col',
    items: [
      { en: 'Mocha', ar: 'موكا', small: 70, large: 100, price: null },
      { en: 'White mocha', ar: 'موكا أبيض', small: 70, large: 100, price: null },
      { en: 'Cappuccino', ar: 'كابتشينو', small: 80, large: 100, price: null },
      { en: 'Cortado', ar: 'كورتادو', small: null, large: 80, price: null },
      { en: 'Latte', ar: 'لاتيه', small: 90, large: 110, price: null },
      { en: 'Matcha latte', ar: 'لاتيه ماتشا', small: 80, large: 110, price: null },
      { en: 'Spanish latte', ar: 'لاتيه إسباني', small: 100, large: 120, price: null },
      { en: 'Flat white', ar: 'فلات وايت', small: null, large: 110, price: null },
      { en: 'Macchiato', ar: 'ماكياتو', small: 70, large: 90, price: null },
      { en: 'Caramel macchiato', ar: 'ماكياتو كراميل', small: null, large: 110, price: null },
      { en: 'American coffee', ar: 'قهوة أمريكية', small: 50, large: 70, price: null },
      { en: 'Americano', ar: 'أمريكانو', small: 70, large: 90, price: null },
      { en: 'Espresso single', ar: 'إسبريسو سينجل', small: null, large: 60, price: null },
      { en: 'Espresso double', ar: 'إسبريسو دبل', small: null, large: 80, price: null },
      { en: 'Turkish coffee', ar: 'قهوة تركي', small: 40, large: 60, price: null },
      { en: 'French coffee', ar: 'قهوة فرنسية', small: 45, large: 70, price: null },
    ],
  },
  {
    id: 'iced-coffee',
    en: 'Iced Coffee',
    ar: 'قهوة باردة',
    type: 'two-col',
    items: [
      { en: 'Mocha', ar: 'موكا', small: 90, large: 110, price: null },
      { en: 'White mocha', ar: 'موكا أبيض', small: 80, large: 100, price: null },
      { en: 'Caramel macchiato', ar: 'ماكياتو كراميل', small: 80, large: 110, price: null },
      { en: 'Cafe americano', ar: 'أمريكانو', small: 60, large: 80, price: null },
      { en: 'Cafe latte', ar: 'لاتيه', small: 65, large: 85, price: null },
      { en: 'Spanish latte', ar: 'لاتيه إسباني', small: 100, large: 120, price: null },
    ],
  },
  {
    id: 'hot-beverages',
    en: 'Hot Beverages',
    ar: 'مشروبات ساخنة',
    type: 'two-col',
    items: [
      { en: 'Hot chocolate', ar: 'شوكولاتة ساخنة', small: 80, large: 100, price: null },
      { en: 'White chocolate', ar: 'شوكولاتة بيضاء', small: 80, large: 100, price: null },
      { en: 'Matcha', ar: 'ماتشا', small: 80, large: 100, price: null },
      { en: 'Honey matcha', ar: 'ماتشا بالعسل', small: 90, large: 110, price: null },
      { en: 'Spanish matcha', ar: 'ماتشا إسباني', small: 110, large: 130, price: null },
    ],
  },
  {
    id: 'frappe',
    en: 'Frappe',
    ar: 'فرابيه',
    type: 'two-col',
    items: [
      { en: 'Latte', ar: 'لاتيه', small: 80, large: 100, price: null },
      { en: 'Latte flavour', ar: 'لاتيه بنكهة', small: 80, large: 110, price: null },
      { en: 'Double espresso', ar: 'إسبريسو دبل', small: 70, large: 90, price: null },
      { en: 'Mocha', ar: 'موكا', small: 110, large: 130, price: null },
      { en: 'White mocha', ar: 'موكا أبيض', small: 80, large: 100, price: null },
      { en: 'Spanish latte', ar: 'لاتيه إسباني', small: 110, large: 130, price: null },
      { en: 'Caramel frappe', ar: 'فرابيه كراميل', small: 100, large: 120, price: null },
      { en: 'Nutella frappe', ar: 'فرابيه نوتيلا', small: 90, large: 110, price: null },
    ],
  },
  {
    id: 'tea',
    en: 'Tea & Herbs',
    ar: 'شاي وأعشاب',
    type: 'single',
    items: [
      { en: 'Red tea', ar: 'شاي أحمر', small: null, large: null, price: 20 },
      { en: 'Flavored tea', ar: 'شاي بنكهة', small: null, large: null, price: 30 },
      { en: 'Milk tea', ar: 'شاي بالحليب', small: null, large: null, price: 30 },
      { en: 'Karrak tea', ar: 'شاي كرك', small: null, large: null, price: 45 },
      { en: 'Mint tea', ar: 'شاي نعنع', small: null, large: null, price: 25 },
      { en: 'Anise', ar: 'يانسون', small: null, large: null, price: 25 },
    ],
  },
  {
    id: 'fresh-juices',
    en: 'Fresh Juices',
    ar: 'عصائر طبيعية',
    type: 'single',
    items: [
      { en: 'Oranges', ar: 'برتقال', small: null, large: null, price: 80 },
      { en: 'Mango', ar: 'مانجو', small: null, large: null, price: 90 },
      { en: 'Lemon', ar: 'ليمون', small: null, large: null, price: 80 },
      { en: 'Guava', ar: 'جوافة', small: null, large: null, price: 90 },
      { en: 'Strawberry', ar: 'فراولة', small: null, large: null, price: 90 },
      { en: 'Watermelon', ar: 'بطيخ', small: null, large: null, price: 100 },
    ],
  },
  {
    id: 'fruit-punch',
    en: 'Fruit Punch',
    ar: 'عصائر فواكه',
    type: 'single',
    items: [
      { en: 'Peach Mango', ar: 'خوخ مانجو', small: null, large: null, price: 140 },
      { en: 'Kiwi Mango', ar: 'كيوي مانجو', small: null, large: null, price: 130 },
      { en: 'Passion Orange', ar: 'باشن اورنج', small: null, large: null, price: 150 },
      { en: 'Pina Colada Guava', ar: 'بينا كولادا جوافة', small: null, large: null, price: 140 },
      { en: 'Vanilla Ice Guava', ar: 'فانيلا آيس جوافة', small: null, large: null, price: 170 },
    ],
  },
  {
    id: 'cold-beverages',
    en: 'Cold Beverages',
    ar: 'مشروبات باردة',
    type: 'two-col',
    items: [
      { en: 'Smoothies', ar: 'سموذي', small: 100, large: 120, price: null },
      { en: 'Cherry cola', ar: 'كولا بالكرز', small: null, large: 80, price: null },
      { en: 'Rush summer drink', ar: 'مشروب رش الصيفي', small: 130, large: 150, price: null },
      { en: 'Mojito', ar: 'موهيتو', small: null, large: 95, price: null },
      { en: 'Milk shake', ar: 'ميلك شيك', small: 100, large: 120, price: null },
    ],
  },
  {
    id: 'bakery',
    en: 'Bakery',
    ar: 'مخبوزات',
    type: 'single',
    items: [
      { en: 'Croissant plain', ar: 'كرواسان سادة', small: null, large: null, price: 45 },
      { en: 'Croissant cheese', ar: 'كرواسان بالجبنة', small: null, large: null, price: 65 },
      { en: 'Patte plain', ar: 'باتيه سادة', small: null, large: null, price: 40 },
      { en: 'Patte cheese', ar: 'باتيه بالجبنة', small: null, large: null, price: 60 },
      { en: 'Cookies plain', ar: 'كوكيز سادة', small: null, large: null, price: 40 },
      { en: 'Cookies stuffed', ar: 'كوكيز محشو', small: null, large: null, price: 60 },
      { en: 'Brownies', ar: 'براونيز', small: null, large: null, price: 55 },
    ],
  },
  {
    id: 'extras',
    en: 'Extras',
    ar: 'إضافات',
    type: 'single',
    items: [
      { en: 'Espresso shot', ar: 'شوت إسبريسو', small: null, large: null, price: 35 },
      { en: 'Milk', ar: 'حليب', small: null, large: null, price: 25 },
      { en: 'Flavour syrup', ar: 'شراب نكهة', small: null, large: null, price: 20 },
      { en: 'Whipped cream', ar: 'كريمة مخفوقة', small: null, large: null, price: 25 },
      { en: 'Sauces', ar: 'صوص', small: null, large: null, price: 25 },
      { en: 'Nutella/Lotus', ar: 'نوتيلا/لوتس', small: null, large: null, price: 40 },
      { en: 'Oreo', ar: 'أوريو', small: null, large: null, price: 25 },
    ],
  },
];

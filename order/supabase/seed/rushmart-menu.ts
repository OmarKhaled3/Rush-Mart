/**
 * Rush Mart seed menu. Prices in EGP.
 *
 * Copied from the marketing site's menu on 2026-11-04 so this app has no dependency on it.
 * Edit prices here (then re-run `npm run db:seed`) or directly in the Supabase dashboard.
 * The marketing "Extras" list became the modifier options below, at the same prices.
 * Items marked `placeholder: true` have sample prices for the owner to confirm.
 */

export type SeedVariant = { nameEn: string; nameAr: string; price: number };

export type SeedItem = {
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  /** Single price. Mutually exclusive with `variants`. */
  price?: number;
  variants?: SeedVariant[];
  /** Modifier group keys, in display order. */
  groups?: ModifierGroupKey[];
  placeholder?: boolean;
};

export type SeedCategory = { key: string; nameEn: string; nameAr: string; items: SeedItem[] };

export type SeedOption = { nameEn: string; nameAr: string; priceDelta: number; placeholder?: boolean };

export type SeedModifierGroup = {
  nameEn: string;
  nameAr: string;
  minSelect: number;
  maxSelect: number;
  options: SeedOption[];
};

export type ModifierGroupKey = 'milk' | 'sugar' | 'extra-shot' | 'syrup' | 'toppings';

export const modifierGroups: Record<ModifierGroupKey, SeedModifierGroup> = {
  milk: {
    nameEn: 'Milk',
    nameAr: 'نوع اللبن',
    minSelect: 0,
    maxSelect: 1,
    options: [
      { nameEn: 'Full cream', nameAr: 'كامل الدسم', priceDelta: 0 },
      { nameEn: 'Skimmed', nameAr: 'خالي الدسم', priceDelta: 0 },
      { nameEn: 'Lactose free', nameAr: 'خالي من اللاكتوز', priceDelta: 25, placeholder: true },
      { nameEn: 'Oat', nameAr: 'لبن الشوفان', priceDelta: 25, placeholder: true },
    ],
  },
  sugar: {
    nameEn: 'Sugar',
    nameAr: 'السكر',
    minSelect: 0,
    maxSelect: 1,
    options: [
      { nameEn: 'No sugar', nameAr: 'من غير سكر', priceDelta: 0 },
      { nameEn: 'Light', nameAr: 'سكر خفيف', priceDelta: 0 },
      { nameEn: 'Medium', nameAr: 'سكر مظبوط', priceDelta: 0 },
      { nameEn: 'Extra', nameAr: 'سكر زيادة', priceDelta: 0 },
    ],
  },
  'extra-shot': {
    nameEn: 'Extra shot',
    nameAr: 'شوت زيادة',
    minSelect: 0,
    maxSelect: 1,
    options: [{ nameEn: 'Espresso shot', nameAr: 'شوت إسبريسو', priceDelta: 35 }],
  },
  syrup: {
    nameEn: 'Flavour syrup',
    nameAr: 'شراب نكهة',
    minSelect: 0,
    maxSelect: 1,
    options: [
      { nameEn: 'Vanilla', nameAr: 'فانيليا', priceDelta: 20 },
      { nameEn: 'Caramel', nameAr: 'كراميل', priceDelta: 20 },
      { nameEn: 'Hazelnut', nameAr: 'بندق', priceDelta: 20 },
    ],
  },
  toppings: {
    nameEn: 'Toppings',
    nameAr: 'إضافات',
    minSelect: 0,
    maxSelect: 3,
    options: [
      { nameEn: 'Whipped cream', nameAr: 'كريمة مخفوقة', priceDelta: 25 },
      { nameEn: 'Sauce', nameAr: 'صوص', priceDelta: 25 },
      { nameEn: 'Oreo', nameAr: 'أوريو', priceDelta: 25 },
      { nameEn: 'Nutella or Lotus', nameAr: 'نوتيلا أو لوتس', priceDelta: 40 },
    ],
  },
};

const S = (price: number): SeedVariant => ({ nameEn: 'Small', nameAr: 'صغير', price });
const L = (price: number): SeedVariant => ({ nameEn: 'Large', nameAr: 'كبير', price });

export const categories: SeedCategory[] = [
  {
    key: 'coffee',
    nameEn: 'Coffee',
    nameAr: 'قهوة',
    items: [
      { nameEn: 'Mocha', nameAr: 'موكا', variants: [S(70), L(100)], groups: ['milk', 'sugar', 'extra-shot', 'syrup'] },
      { nameEn: 'White mocha', nameAr: 'موكا أبيض', variants: [S(70), L(100)], groups: ['milk', 'sugar', 'extra-shot', 'syrup'] },
      { nameEn: 'Cappuccino', nameAr: 'كابتشينو', variants: [S(80), L(100)], groups: ['milk', 'sugar', 'extra-shot', 'syrup'] },
      { nameEn: 'Cortado', nameAr: 'كورتادو', variants: [L(80)], groups: ['milk', 'sugar', 'extra-shot', 'syrup'] },
      { nameEn: 'Latte', nameAr: 'لاتيه', variants: [S(90), L(110)], groups: ['milk', 'sugar', 'extra-shot', 'syrup'] },
      { nameEn: 'Matcha latte', nameAr: 'لاتيه ماتشا', variants: [S(80), L(110)], groups: ['milk', 'sugar', 'extra-shot', 'syrup'] },
      { nameEn: 'Spanish latte', nameAr: 'لاتيه إسباني', variants: [S(100), L(120)], groups: ['milk', 'sugar', 'extra-shot', 'syrup'] },
      { nameEn: 'Flat white', nameAr: 'فلات وايت', variants: [L(110)], groups: ['milk', 'sugar', 'extra-shot', 'syrup'] },
      { nameEn: 'Macchiato', nameAr: 'ماكياتو', variants: [S(70), L(90)], groups: ['milk', 'sugar', 'extra-shot', 'syrup'] },
      { nameEn: 'Caramel macchiato', nameAr: 'ماكياتو كراميل', variants: [L(110)], groups: ['milk', 'sugar', 'extra-shot', 'syrup'] },
      { nameEn: 'American coffee', nameAr: 'قهوة أمريكية', variants: [S(50), L(70)], groups: ['sugar', 'extra-shot'] },
      { nameEn: 'Americano', nameAr: 'أمريكانو', variants: [S(70), L(90)], groups: ['sugar', 'extra-shot'] },
      { nameEn: 'Espresso single', nameAr: 'إسبريسو سينجل', variants: [L(60)], groups: ['sugar', 'extra-shot'] },
      { nameEn: 'Espresso double', nameAr: 'إسبريسو دبل', variants: [L(80)], groups: ['sugar', 'extra-shot'] },
      { nameEn: 'Turkish coffee', nameAr: 'قهوة تركي', variants: [S(40), L(60)], groups: ['sugar', 'extra-shot'] },
      { nameEn: 'French coffee', nameAr: 'قهوة فرنسية', variants: [S(45), L(70)], groups: ['sugar', 'extra-shot'] },
    ],
  },
  {
    key: 'iced-coffee',
    nameEn: 'Iced Coffee',
    nameAr: 'قهوة باردة',
    items: [
      { nameEn: 'Mocha', nameAr: 'موكا', variants: [S(90), L(110)], groups: ['milk', 'sugar', 'extra-shot', 'syrup'] },
      { nameEn: 'White mocha', nameAr: 'موكا أبيض', variants: [S(80), L(100)], groups: ['milk', 'sugar', 'extra-shot', 'syrup'] },
      { nameEn: 'Caramel macchiato', nameAr: 'ماكياتو كراميل', variants: [S(80), L(110)], groups: ['milk', 'sugar', 'extra-shot', 'syrup'] },
      { nameEn: 'Cafe americano', nameAr: 'أمريكانو', variants: [S(60), L(80)], groups: ['sugar', 'extra-shot', 'syrup'] },
      { nameEn: 'Cafe latte', nameAr: 'لاتيه', variants: [S(65), L(85)], groups: ['milk', 'sugar', 'extra-shot', 'syrup'] },
      { nameEn: 'Spanish latte', nameAr: 'لاتيه إسباني', variants: [S(100), L(120)], groups: ['milk', 'sugar', 'extra-shot', 'syrup'] },
    ],
  },
  {
    key: 'hot-beverages',
    nameEn: 'Hot Beverages',
    nameAr: 'مشروبات ساخنة',
    items: [
      { nameEn: 'Hot chocolate', nameAr: 'شوكولاتة ساخنة', variants: [S(80), L(100)], groups: ['milk', 'sugar', 'toppings'] },
      { nameEn: 'White chocolate', nameAr: 'شوكولاتة بيضاء', variants: [S(80), L(100)], groups: ['milk', 'sugar', 'toppings'] },
      { nameEn: 'Matcha', nameAr: 'ماتشا', variants: [S(80), L(100)], groups: ['milk', 'sugar', 'toppings'] },
      { nameEn: 'Honey matcha', nameAr: 'ماتشا بالعسل', variants: [S(90), L(110)], groups: ['milk', 'sugar', 'toppings'] },
      { nameEn: 'Spanish matcha', nameAr: 'ماتشا إسباني', variants: [S(110), L(130)], groups: ['milk', 'sugar', 'toppings'] },
    ],
  },
  {
    key: 'frappe',
    nameEn: 'Frappe',
    nameAr: 'فرابيه',
    items: [
      { nameEn: 'Latte', nameAr: 'لاتيه', variants: [S(80), L(100)], groups: ['milk', 'extra-shot', 'syrup', 'toppings'] },
      { nameEn: 'Latte flavour', nameAr: 'لاتيه بنكهة', variants: [S(90), L(110)], groups: ['milk', 'extra-shot', 'syrup', 'toppings'] },
      { nameEn: 'Double espresso', nameAr: 'إسبريسو دبل', variants: [S(70), L(90)], groups: ['milk', 'extra-shot', 'syrup', 'toppings'] },
      { nameEn: 'Mocha', nameAr: 'موكا', variants: [S(110), L(130)], groups: ['milk', 'extra-shot', 'syrup', 'toppings'] },
      { nameEn: 'White mocha', nameAr: 'موكا أبيض', variants: [S(80), L(100)], groups: ['milk', 'extra-shot', 'syrup', 'toppings'] },
      { nameEn: 'Spanish latte', nameAr: 'لاتيه إسباني', variants: [S(110), L(130)], groups: ['milk', 'extra-shot', 'syrup', 'toppings'] },
      { nameEn: 'Caramel frappe', nameAr: 'فرابيه كراميل', variants: [S(100), L(120)], groups: ['milk', 'extra-shot', 'syrup', 'toppings'] },
      { nameEn: 'Nutella frappe', nameAr: 'فرابيه نوتيلا', variants: [S(90), L(110)], groups: ['milk', 'extra-shot', 'syrup', 'toppings'] },
    ],
  },
  {
    key: 'tea',
    nameEn: 'Tea & Herbs',
    nameAr: 'شاي وأعشاب',
    items: [
      { nameEn: 'Red tea', nameAr: 'شاي أحمر', price: 20, groups: ['sugar'] },
      { nameEn: 'Flavored tea', nameAr: 'شاي بنكهة', price: 30, groups: ['sugar'] },
      { nameEn: 'Milk tea', nameAr: 'شاي بالحليب', price: 30, groups: ['sugar'] },
      { nameEn: 'Karrak tea', nameAr: 'شاي كرك', price: 45, groups: ['sugar'] },
      { nameEn: 'Mint tea', nameAr: 'شاي نعنع', price: 25, groups: ['sugar'] },
      { nameEn: 'Anise', nameAr: 'يانسون', price: 25, groups: ['sugar'] },
    ],
  },
  {
    key: 'fresh-juices',
    nameEn: 'Fresh Juices',
    nameAr: 'عصائر طبيعية',
    items: [
      { nameEn: 'Oranges', nameAr: 'برتقال', price: 80, groups: ['sugar'] },
      { nameEn: 'Mango', nameAr: 'مانجو', price: 80, groups: ['sugar'] },
      { nameEn: 'Lemon', nameAr: 'ليمون', price: 80, groups: ['sugar'] },
      { nameEn: 'Guava', nameAr: 'جوافة', price: 80, groups: ['sugar'] },
      { nameEn: 'Strawberry', nameAr: 'فراولة', price: 90, groups: ['sugar'] },
      { nameEn: 'Watermelon', nameAr: 'بطيخ', price: 110, groups: ['sugar'] },
    ],
  },
  {
    key: 'fruit-punch',
    nameEn: 'Fruit Punch',
    nameAr: 'عصائر فواكه',
    items: [
      { nameEn: 'Peach Mango', nameAr: 'خوخ مانجو', price: 140 },
      { nameEn: 'Kiwi Mango', nameAr: 'كيوي مانجو', price: 130 },
      { nameEn: 'Passion Orange', nameAr: 'باشن اورنج', price: 150 },
      { nameEn: 'Pina Colada Guava', nameAr: 'بينا كولادا جوافة', price: 140 },
      { nameEn: 'Vanilla Ice Guava', nameAr: 'فانيلا آيس جوافة', price: 170 },
    ],
  },
  {
    key: 'cold-beverages',
    nameEn: 'Cold Beverages',
    nameAr: 'مشروبات باردة',
    items: [
      { nameEn: 'Smoothies', nameAr: 'سموذي', variants: [S(100), L(120)], groups: ['toppings'] },
      { nameEn: 'Cherry cola', nameAr: 'كولا بالكرز', variants: [L(80)], groups: ['toppings'] },
      { nameEn: 'Rush summer drink', nameAr: 'مشروب رش الصيفي', variants: [S(130), L(150)], groups: ['toppings'] },
      { nameEn: 'Mojito', nameAr: 'موهيتو', variants: [L(95)], groups: ['toppings'] },
      { nameEn: 'Milk shake', nameAr: 'ميلك شيك', variants: [S(100), L(120)], groups: ['toppings'] },
    ],
  },
  {
    key: 'bakery',
    nameEn: 'Bakery',
    nameAr: 'مخبوزات',
    items: [
      { nameEn: 'Croissant plain', nameAr: 'كرواسان سادة', price: 70 },
      { nameEn: 'Croissant roumy', nameAr: 'كرواسان رومي', price: 80 },
      { nameEn: 'Croissant cheddar', nameAr: 'كرواسان شيدر', price: 85 },
      { nameEn: 'Croissant lotus', nameAr: 'كرواسان لوتس', price: 90 },
      { nameEn: 'Croissant nutella', nameAr: 'كرواسان نوتيلا', price: 90 },
      { nameEn: 'Patte white cheese', nameAr: 'باتيه بيضا', price: 80 },
      { nameEn: 'Patte roumy', nameAr: 'باتيه رومي', price: 80 },
      { nameEn: 'Patte plain', nameAr: 'باتيه سادة', price: 70 },
      { nameEn: 'Danish cinnamon', nameAr: 'دانش قرفة', price: 60 },
      { nameEn: 'Danish fruit', nameAr: 'دانش فاكهة', price: 60 },
      { nameEn: 'Cookies plain', nameAr: 'كوكيز سادة', price: 70 },
      { nameEn: 'Cookies double', nameAr: 'كوكيز دبل', price: 70 },
      { nameEn: 'Cookies nutella', nameAr: 'كوكيز نوتيلا', price: 70 },
      { nameEn: 'Cookies lotus', nameAr: 'كوكيز لوتس', price: 70 },
      { nameEn: 'Brownies', nameAr: 'براونيز', price: 75 },
    ],
  },
  {
    key: 'hot-food',
    nameEn: 'Hot Food',
    nameAr: 'أكل سخن',
    items: [
      { nameEn: 'Cheese toastie', nameAr: 'توست جبنة', descriptionEn: 'Cheddar and mozzarella, pressed hot.', descriptionAr: 'شيدر وموتزاريلا، متحمص سخن.', price: 85, placeholder: true },
      { nameEn: 'Turkey and cheese toastie', nameAr: 'توست تركي وجبنة', descriptionEn: 'Smoked turkey and cheddar.', descriptionAr: 'تركي مدخن وشيدر.', price: 110, placeholder: true },
      { nameEn: 'Croissant sandwich', nameAr: 'ساندوتش كرواسان', descriptionEn: 'Roumy cheese and turkey, warmed.', descriptionAr: 'جبنة رومي وتركي، متسخن.', price: 120, placeholder: true },
      { nameEn: 'Chicken wrap', nameAr: 'راب فراخ', descriptionEn: 'Grilled chicken, lettuce, garlic sauce.', descriptionAr: 'فراخ مشوية، خس، صوص توم.', price: 135, placeholder: true },
      { nameEn: 'Hot dog', nameAr: 'هوت دوج', descriptionEn: 'Beef sausage, mustard, ketchup.', descriptionAr: 'سجق بقري، مستردة، كاتشب.', price: 90, placeholder: true },
      { nameEn: 'Mini pizza', nameAr: 'ميني بيتزا', descriptionEn: 'Tomato, mozzarella, olives.', descriptionAr: 'طماطم، موتزاريلا، زيتون.', price: 95, placeholder: true },
    ],
  },
];

export type Localized = { en: string; ar: string };

export type MenuOption = {
  id: string;
  name: Localized;
  priceDelta: number;
  inStock: boolean;
};

export type MenuGroup = {
  id: string;
  name: Localized;
  minSelect: number;
  maxSelect: number;
  options: MenuOption[];
};

export type MenuVariant = { id: string; name: Localized; price: number };

export type MenuItem = {
  id: string;
  categoryId: string;
  name: Localized;
  description: Localized | null;
  imageUrl: string | null;
  /** Single price; null when sold by variant. */
  basePrice: number | null;
  variants: MenuVariant[];
  groups: MenuGroup[];
  inStock: boolean;
};

export type MenuCategory = { id: string; name: Localized; items: MenuItem[] };

export type Menu = { categories: MenuCategory[] };

export function localized(value: Localized, locale: string): string {
  return locale === 'ar' ? value.ar : value.en;
}

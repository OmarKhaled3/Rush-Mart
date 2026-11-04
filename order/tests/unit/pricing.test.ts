import { describe, expect, it } from 'vitest';
import { fromPrice, priceSelection } from '@/lib/menu/pricing';
import type { MenuItem } from '@/lib/menu/types';

const n = (en: string) => ({ en, ar: en });
const latte: MenuItem = {
  id: 'latte',
  categoryId: 'c',
  name: n('Latte'),
  description: null,
  imageUrl: null,
  basePrice: null,
  inStock: true,
  variants: [
    { id: 's', name: n('Small'), price: 90 },
    { id: 'l', name: n('Large'), price: 110 },
  ],
  groups: [
    {
      id: 'milk',
      name: n('Milk'),
      minSelect: 0,
      maxSelect: 1,
      options: [
        { id: 'full', name: n('Full'), priceDelta: 0, inStock: true },
        { id: 'oat', name: n('Oat'), priceDelta: 25, inStock: true },
        { id: 'almond', name: n('Almond'), priceDelta: 25, inStock: false },
      ],
    },
    {
      id: 'tops',
      name: n('Toppings'),
      minSelect: 0,
      maxSelect: 2,
      options: [
        { id: 'cream', name: n('Cream'), priceDelta: 25, inStock: true },
        { id: 'nutella', name: n('Nutella'), priceDelta: 40, inStock: true },
        { id: 'oreo', name: n('Oreo'), priceDelta: 25, inStock: true },
      ],
    },
  ],
};
const croissant: MenuItem = { ...latte, id: 'croissant', basePrice: 70, variants: [], groups: [] };

describe('priceSelection', () => {
  it('prices variants plus options', () => {
    expect(priceSelection(latte, { variantId: 'l', optionIds: ['oat', 'cream', 'nutella'] })).toEqual({ ok: true, unitPrice: 200 });
  });
  it('prices single-price items', () => {
    expect(priceSelection(croissant, { variantId: null, optionIds: [] })).toEqual({ ok: true, unitPrice: 70 });
  });
  it.each([
    ['missing variant', latte, { variantId: null, optionIds: [] }, 'invalid_variant'],
    ['variant on single-price item', croissant, { variantId: 's', optionIds: [] }, 'invalid_variant'],
    ['unknown option', latte, { variantId: 's', optionIds: ['nope'] }, 'invalid_option'],
    ['out-of-stock option', latte, { variantId: 's', optionIds: ['almond'] }, 'option_out_of_stock'],
    ['too many in a group', latte, { variantId: 's', optionIds: ['full', 'oat'] }, 'invalid_option_selection'],
    ['over max', latte, { variantId: 's', optionIds: ['cream', 'nutella', 'oreo'] }, 'invalid_option_selection'],
    ['out-of-stock item', { ...croissant, inStock: false }, { variantId: null, optionIds: [] }, 'item_out_of_stock'],
  ] as const)('rejects %s', (_l, item, sel, error) => {
    expect(priceSelection(item, { ...sel, optionIds: [...sel.optionIds] })).toEqual({ ok: false, error });
  });
  it('enforces min_select', () => {
    const required = { ...latte, groups: [{ ...latte.groups[0]!, minSelect: 1 }] };
    expect(priceSelection(required, { variantId: 's', optionIds: [] })).toEqual({ ok: false, error: 'invalid_option_selection' });
  });
});

describe('fromPrice', () => {
  it('uses the cheapest variant or the base price', () => {
    expect(fromPrice(latte)).toBe(90);
    expect(fromPrice(croissant)).toBe(70);
  });
});

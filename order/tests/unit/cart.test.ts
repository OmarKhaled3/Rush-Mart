import { describe, expect, it } from 'vitest';
import { repriceCart } from '@/lib/cart/reprice';
import { lineKey } from '@/lib/cart/store';
import type { Menu } from '@/lib/menu/types';

const n = (en: string) => ({ en, ar: en });
const menu: Menu = {
  categories: [
    {
      id: 'c',
      name: n('Coffee'),
      items: [
        { id: 'tea', categoryId: 'c', name: n('Tea'), description: null, imageUrl: null, basePrice: 20, inStock: true, variants: [], groups: [] },
        { id: 'gone', categoryId: 'c', name: n('Gone'), description: null, imageUrl: null, basePrice: 30, inStock: false, variants: [], groups: [] },
      ],
    },
  ],
};

describe('lineKey', () => {
  it('ignores option order', () => {
    expect(lineKey('a', null, ['y', 'x'])).toBe(lineKey('a', null, ['x', 'y']));
  });
});

describe('repriceCart', () => {
  it('prices valid lines and drops unavailable ones', () => {
    const { priced, dropped, subtotal } = repriceCart(
      [
        { key: 'k1', itemId: 'tea', variantId: null, optionIds: [], quantity: 3 },
        { key: 'k2', itemId: 'gone', variantId: null, optionIds: [], quantity: 1 },
        { key: 'k3', itemId: 'deleted', variantId: null, optionIds: [], quantity: 1 },
      ],
      menu,
    );
    expect(priced.map((l) => [l.itemId, l.lineTotal])).toEqual([['tea', 60]]);
    expect(dropped.map((l) => l.itemId)).toEqual(['gone', 'deleted']);
    expect(subtotal).toBe(60);
  });
});

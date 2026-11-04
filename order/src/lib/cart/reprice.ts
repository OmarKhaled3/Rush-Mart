import { priceSelection, roundMoney } from '@/lib/menu/pricing';
import type { Menu, MenuItem } from '@/lib/menu/types';
import type { CartLine } from './store';

export type PricedLine = CartLine & { item: MenuItem; unitPrice: number; lineTotal: number };

/** Prices cart lines against the live menu; lines that no longer work are returned separately. */
export function repriceCart(lines: CartLine[], menu: Menu) {
  const items = new Map(menu.categories.flatMap((c) => c.items).map((i) => [i.id, i]));
  const priced: PricedLine[] = [];
  const dropped: CartLine[] = [];

  for (const line of lines) {
    const item = items.get(line.itemId);
    const result = item && priceSelection(item, { variantId: line.variantId, optionIds: line.optionIds });
    if (!item || !result || !result.ok) {
      dropped.push(line);
      continue;
    }
    priced.push({ ...line, item, unitPrice: result.unitPrice, lineTotal: roundMoney(result.unitPrice * line.quantity) });
  }

  const subtotal = roundMoney(priced.reduce((sum, l) => sum + l.lineTotal, 0));
  return { priced, dropped, subtotal };
}

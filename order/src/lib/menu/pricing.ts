import type { MenuItem } from './types';

export type SelectionError =
  | 'item_out_of_stock'
  | 'invalid_variant'
  | 'invalid_option'
  | 'option_out_of_stock'
  | 'invalid_option_selection';

export type Selection = { variantId: string | null; optionIds: string[] };

/**
 * Mirrors the checks and pricing in `public.place_order`. The database recomputes everything;
 * this keeps the UI honest (disable Add, show the right price) and reprices the cart.
 */
export function priceSelection(
  item: MenuItem,
  selection: Selection,
): { ok: true; unitPrice: number } | { ok: false; error: SelectionError } {
  if (!item.inStock) return { ok: false, error: 'item_out_of_stock' };

  let unit: number;
  if (item.variants.length) {
    const variant = item.variants.find((v) => v.id === selection.variantId);
    if (!variant) return { ok: false, error: 'invalid_variant' };
    unit = variant.price;
  } else {
    if (selection.variantId !== null || item.basePrice === null) return { ok: false, error: 'invalid_variant' };
    unit = item.basePrice;
  }

  const chosen = new Set(selection.optionIds);
  const options = item.groups.flatMap((g) => g.options);
  for (const id of chosen) {
    const option = options.find((o) => o.id === id);
    if (!option) return { ok: false, error: 'invalid_option' };
    if (!option.inStock) return { ok: false, error: 'option_out_of_stock' };
    unit += option.priceDelta;
  }

  for (const group of item.groups) {
    const count = group.options.filter((o) => chosen.has(o.id)).length;
    if (count < group.minSelect || count > group.maxSelect) return { ok: false, error: 'invalid_option_selection' };
  }

  return { ok: true, unitPrice: roundMoney(unit) };
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Lowest price a customer could pay for the item (for "from" labels). */
export function fromPrice(item: MenuItem): number | null {
  if (item.variants.length) return Math.min(...item.variants.map((v) => v.price));
  return item.basePrice;
}

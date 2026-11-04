'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useCart, useCartHydrated } from '@/lib/cart/context';
import { repriceCart } from '@/lib/cart/reprice';
import { formatNumber, formatPrice } from '@/lib/format';
import type { MenuItem } from '@/lib/menu/types';
import { BagIcon } from '@/components/ui/icons';

/** Floating "View order" bar on the menu; hidden while the cart is empty. */
export function CartBar({ menuItems }: { menuItems: Map<string, MenuItem> }) {
  const t = useTranslations('Cart');
  const locale = useLocale();
  const hydrated = useCartHydrated();
  const lines = useCart((s) => s.lines);

  if (!hydrated || lines.length === 0) return null;

  const { priced, subtotal } = repriceCart(lines, { categories: [{ id: '_', name: { en: '', ar: '' }, items: [...menuItems.values()] }] });
  const count = priced.reduce((n, l) => n + l.quantity, 0);
  if (count === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <Link
        href="/cart"
        className="mx-auto flex h-14 w-full max-w-xl items-center justify-between gap-3 rounded-[var(--radius-pill)] bg-primary px-5 font-semibold text-on-primary shadow-lg shadow-black/20"
      >
        <span className="flex items-center gap-2">
          <BagIcon />
          {t('viewCart')}
          <span className="text-sm font-medium opacity-80">· {t('items', { count, countText: formatNumber(count, locale) })}</span>
        </span>
        <span className="tabular-nums">{formatPrice(subtotal, locale)}</span>
      </Link>
    </div>
  );
}

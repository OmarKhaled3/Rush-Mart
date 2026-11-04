'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCart } from '@/lib/cart/context';
import { formatPrice } from '@/lib/format';
import { fromPrice } from '@/lib/menu/pricing';
import { localized, type Menu, type MenuItem } from '@/lib/menu/types';
import { CartBar } from '@/components/cart/cart-bar';
import { ItemSheet } from './item-sheet';

const SHEET_STATE = 'rush-order:item-sheet';

export function MenuBrowser({ menu }: { menu: Menu }) {
  const t = useTranslations('Menu');
  const locale = useLocale();
  const add = useCart((s) => s.add);

  const [activeCategory, setActiveCategory] = useState(menu.categories[0]?.id ?? '');
  const [openItem, setOpenItem] = useState<MenuItem | null>(null);
  const tabsRef = useRef<HTMLElement>(null);

  // Scroll spy: highlight the category whose section is at the top of the viewport.
  useEffect(() => {
    const sections = menu.categories
      .map((c) => document.getElementById(`cat-${c.id}`))
      .filter((el): el is HTMLElement => !!el);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveCategory(visible.target.id.slice(4));
      },
      { rootMargin: '-120px 0px -60% 0px' },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [menu]);

  // Keep the active tab visible in the scrolling tab strip.
  useEffect(() => {
    tabsRef.current
      ?.querySelector<HTMLElement>(`[data-cat="${activeCategory}"]`)
      ?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [activeCategory]);

  // The sheet pushes a history entry so the Android back button closes it.
  const openSheet = useCallback((item: MenuItem) => {
    setOpenItem(item);
    window.history.pushState({ [SHEET_STATE]: true }, '');
  }, []);
  const closeSheet = useCallback(() => {
    if (window.history.state?.[SHEET_STATE]) window.history.back();
    else setOpenItem(null);
  }, []);
  useEffect(() => {
    const onPop = () => setOpenItem(null);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const itemsById = useMemo(() => new Map(menu.categories.flatMap((c) => c.items).map((i) => [i.id, i])), [menu]);

  if (!menu.categories.length) {
    return <p className="px-4 py-16 text-center text-muted">{t('empty')}</p>;
  }

  return (
    <>
      <nav
        ref={tabsRef}
        aria-label={t('categories')}
        className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-20 -mx-4 flex gap-2 overflow-x-auto bg-bg/95 px-4 py-3 backdrop-blur [scrollbar-width:none]"
      >
        {menu.categories.map((c) => (
          <a
            key={c.id}
            href={`#cat-${c.id}`}
            data-cat={c.id}
            aria-current={activeCategory === c.id ? 'true' : undefined}
            onClick={() => setActiveCategory(c.id)}
            className={`shrink-0 rounded-[var(--radius-pill)] px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === c.id ? 'bg-ink text-bg' : 'bg-surface-2 text-ink'
            }`}
          >
            {localized(c.name, locale)}
          </a>
        ))}
      </nav>

      <div className="space-y-8 pb-28">
        {menu.categories.map((c) => (
          <section key={c.id} id={`cat-${c.id}`} aria-labelledby={`cat-h-${c.id}`} className="scroll-mt-[calc(7.5rem+env(safe-area-inset-top))]">
            <h2 id={`cat-h-${c.id}`} className="mb-1 text-xl font-bold">
              {localized(c.name, locale)}
            </h2>
            <ul className="divide-y divide-line">
              {c.items.map((item) => {
                const price = fromPrice(item);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => openSheet(item)}
                      disabled={!item.inStock}
                      className="flex w-full items-center gap-4 py-4 text-start disabled:opacity-50"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">{localized(item.name, locale)}</span>
                        {item.description ? (
                          <span className="mt-0.5 line-clamp-2 block text-sm text-muted">{localized(item.description, locale)}</span>
                        ) : null}
                        <span className="mt-1 block text-sm font-medium tabular-nums">
                          {!item.inStock ? (
                            <span className="text-accent">{t('outOfStock')}</span>
                          ) : price === null ? null : item.variants.length > 1 ? (
                            t('from', { price: formatPrice(price, locale) })
                          ) : (
                            formatPrice(price, locale)
                          )}
                        </span>
                      </span>
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt=""
                          width={80}
                          height={80}
                          className="h-20 w-20 shrink-0 rounded-2xl bg-surface-2 object-cover"
                        />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <CartBar menuItems={itemsById} />

      {openItem ? (
        <ItemSheet
          key={openItem.id}
          item={openItem}
          canOrder={openItem.inStock}
          onClose={closeSheet}
          onAdd={(selection) => {
            add({ itemId: openItem.id, ...selection });
            closeSheet();
          }}
        />
      ) : null}
    </>
  );
}

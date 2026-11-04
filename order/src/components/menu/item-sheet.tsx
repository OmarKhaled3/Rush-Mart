'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { CloseIcon, CheckIcon } from '@/components/ui/icons';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
import { formatNumber, formatPrice } from '@/lib/format';
import { priceSelection } from '@/lib/menu/pricing';
import { localized, type MenuGroup, type MenuItem } from '@/lib/menu/types';

type Props = {
  item: MenuItem;
  canOrder: boolean;
  onClose: () => void;
  onAdd: (selection: { variantId: string | null; optionIds: string[]; quantity: number }) => void;
};

function defaultOptions(groups: MenuGroup[]): string[] {
  // Preselect only where a choice is required and there is exactly one pick.
  return groups.flatMap((g) => {
    if (g.minSelect < 1 || g.maxSelect !== 1) return [];
    const first = g.options.find((o) => o.inStock);
    return first ? [first.id] : [];
  });
}

export function ItemSheet({ item, canOrder, onClose, onAdd }: Props) {
  const t = useTranslations('Item');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  const [variantId, setVariantId] = useState<string | null>(item.variants.find(() => true)?.id ?? null);
  const [optionIds, setOptionIds] = useState<string[]>(() => defaultOptions(item.groups));
  const [quantity, setQuantity] = useState(1);

  const priced = useMemo(() => priceSelection(item, { variantId, optionIds }), [item, variantId, optionIds]);

  useEffect(() => {
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  function toggle(group: MenuGroup, optionId: string) {
    setOptionIds((current) => {
      const inGroup = new Set(group.options.map((o) => o.id));
      const selected = current.filter((id) => inGroup.has(id));
      const others = current.filter((id) => !inGroup.has(id));
      if (selected.includes(optionId)) {
        // Cannot unselect the only pick of a required single-choice group.
        if (group.maxSelect === 1 && group.minSelect >= 1) return current;
        return [...others, ...selected.filter((id) => id !== optionId)];
      }
      if (group.maxSelect === 1) return [...others, optionId];
      if (selected.length >= group.maxSelect) return current;
      return [...others, ...selected, optionId];
    });
  }

  function groupHint(g: MenuGroup): string {
    if (g.minSelect >= 1 && g.maxSelect === 1) return `${t('required')} · ${t('chooseOne')}`;
    if (g.minSelect >= 1) return `${t('required')} · ${t('chooseBetween', { min: formatNumber(g.minSelect, locale), max: formatNumber(g.maxSelect, locale) })}`;
    if (g.maxSelect === 1) return t('optional');
    return `${t('optional')} · ${t('upTo', { count: formatNumber(g.maxSelect, locale) })}`;
  }

  const choiceClass = (selected: boolean, disabled: boolean) =>
    `flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-start transition-colors ${
      selected ? 'border-ink bg-surface-2 font-semibold' : 'border-line'
    } ${disabled ? 'opacity-40' : ''}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="presentation">
      <button type="button" aria-label={tc('close')} onClick={onClose} className="absolute inset-0 bg-black/50" tabIndex={-1} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-[1.75rem] bg-bg outline-none sm:rounded-[1.75rem]"
      >
        <div className="overflow-y-auto overscroll-contain">
          {item.imageUrl ? (
            <div className="relative aspect-[4/3] w-full bg-surface-2">
              <Image src={item.imageUrl} alt="" fill sizes="(max-width: 640px) 100vw, 576px" className="object-cover" />
            </div>
          ) : null}

          <div className="flex items-start justify-between gap-4 px-5 pt-5">
            <div>
              <h2 id={titleId} className="text-2xl font-bold leading-tight">
                {localized(item.name, locale)}
              </h2>
              {item.description ? <p className="mt-1 text-sm text-muted">{localized(item.description, locale)}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={tc('close')}
              className="-me-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-2"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="space-y-6 px-5 py-5">
            {item.variants.length > 1 ? (
              <fieldset>
                <legend className="mb-2 text-sm font-semibold">
                  {t('size')} <span className="font-normal text-muted">· {t('required')}</span>
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {item.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      aria-pressed={variantId === v.id}
                      onClick={() => setVariantId(v.id)}
                      className={choiceClass(variantId === v.id, false)}
                    >
                      <span>{localized(v.name, locale)}</span>
                      <span className="text-sm tabular-nums">{formatPrice(v.price, locale)}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : null}

            {item.groups.map((g) => {
              const selectedCount = g.options.filter((o) => optionIds.includes(o.id)).length;
              return (
                <fieldset key={g.id}>
                  <legend className="mb-2 text-sm font-semibold">
                    {localized(g.name, locale)} <span className="font-normal text-muted">· {groupHint(g)}</span>
                  </legend>
                  <div className="space-y-2">
                    {g.options.map((o) => {
                      const selected = optionIds.includes(o.id);
                      const atMax = !selected && g.maxSelect > 1 && selectedCount >= g.maxSelect;
                      const disabled = !o.inStock || atMax;
                      return (
                        <button
                          key={o.id}
                          type="button"
                          role={g.maxSelect === 1 ? 'radio' : 'checkbox'}
                          aria-checked={selected}
                          disabled={disabled}
                          onClick={() => toggle(g, o.id)}
                          className={choiceClass(selected, disabled)}
                        >
                          <span className="flex items-center gap-3">
                            <span
                              className={`inline-flex h-5 w-5 items-center justify-center border ${
                                g.maxSelect === 1 ? 'rounded-full' : 'rounded-md'
                              } ${selected ? 'border-ink bg-ink text-bg' : 'border-line'}`}
                            >
                              {selected ? <CheckIcon className="h-3.5 w-3.5" /> : null}
                            </span>
                            {localized(o.name, locale)}
                            {!o.inStock ? <span className="text-xs text-muted">· {t('soldOut')}</span> : null}
                          </span>
                          {o.priceDelta > 0 ? (
                            <span className="text-sm tabular-nums text-muted">+{formatPrice(o.priceDelta, locale)}</span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-line bg-bg px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <QuantityStepper value={quantity} onChange={setQuantity} locale={locale} />
          <button
            type="button"
            disabled={!canOrder || !priced.ok}
            onClick={() => onAdd({ variantId, optionIds, quantity })}
            className="inline-flex h-14 flex-1 items-center justify-center rounded-[var(--radius-pill)] bg-primary px-5 text-base font-semibold text-on-primary disabled:opacity-50"
          >
            {!item.inStock
              ? t('unavailable')
              : t('add', { price: formatPrice(priced.ok ? priced.unitPrice * quantity : 0, locale) })}
          </button>
        </div>
      </div>
    </div>
  );
}

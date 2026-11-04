'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useId, useMemo, useState } from 'react';
import { placeOrder, type PlaceOrderError } from '@/actions/place-order';
import { useTurnstile } from '@/components/checkout/use-turnstile';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
import { Link, useRouter } from '@/i18n/navigation';
import { primeAlertSound } from '@/lib/alert-sound';
import { useCart, useCartHydrated } from '@/lib/cart/context';
import { repriceCart } from '@/lib/cart/reprice';
import { formatNumber, formatPrice } from '@/lib/format';
import { localized, type Menu } from '@/lib/menu/types';
import type { StoreStatus } from '@/lib/pickup/asap';
import { normalizeEgyptMobile } from '@/lib/phone';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';

type Props = {
  menu: Menu;
  status: StoreStatus;
  leadMinutes: number;
  turnstileSiteKey: string | undefined;
};

type UiError = PlaceOrderError | 'captcha_failed';

export function CartView({ menu, status, leadMinutes, turnstileSiteKey }: Props) {
  const t = useTranslations('Cart');
  const te = useTranslations('Errors');
  const locale = useLocale();
  const router = useRouter();
  const formId = useId();

  const hydrated = useCartHydrated();
  const lines = useCart((s) => s.lines);
  const customer = useCart((s) => s.customer);
  const setQuantity = useCart((s) => s.setQuantity);
  const prune = useCart((s) => s.prune);
  const droppedNotice = useCart((s) => s.pruned);
  const clear = useCart((s) => s.clear);
  const setCustomer = useCart((s) => s.setCustomer);

  // null = untouched: show the details saved from this device's last order.
  const [nameInput, setName] = useState<string | null>(null);
  const [phoneInput, setPhone] = useState<string | null>(null);
  const name = nameInput ?? customer.name;
  const phone = phoneInput ?? customer.phone;
  const [notes, setNotes] = useState('');
  const [phase, setPhase] = useState<'idle' | 'verifying' | 'placing' | 'done'>('idle');
  const [error, setError] = useState<UiError | null>(null);
  const { containerRef, getToken } = useTurnstile(turnstileSiteKey, locale);

  const { priced, dropped, subtotal } = useMemo(() => repriceCart(lines, menu), [lines, menu]);

  // Lines that no longer exist or sold out are removed, with a notice.
  useEffect(() => {
    if (hydrated && dropped.length > 0) prune(priced.map((l) => l.key));
  }, [hydrated, dropped.length, priced, prune]);

  const busy = phase !== 'idle';
  const canSubmit = status === 'open' && priced.length > 0 && !busy;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError('invalid_name');
    if (!normalizeEgyptMobile(phone)) return setError('invalid_phone');

    primeAlertSound(); // this tap unlocks the "order ready" chime on the status page
    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setPhase('verifying');
        let captchaToken: string | undefined;
        try {
          captchaToken = await getToken();
        } catch {
          setError('captcha_failed');
          setPhase('idle');
          return;
        }
        const { error: signInError } = await supabase.auth.signInAnonymously({ options: { captchaToken } });
        if (signInError) {
          setError(/captcha/i.test(signInError.message) ? 'captcha_failed' : 'unknown');
          setPhase('idle');
          return;
        }
      }

      setPhase('placing');
      const result = await placeOrder({
        customerName: name,
        customerPhone: phone,
        notes: notes || undefined,
        lines: priced.map((l) => ({ itemId: l.itemId, variantId: l.variantId, optionIds: l.optionIds, quantity: l.quantity })),
      });
      if (!result.ok) {
        setError(result.error);
        setPhase('idle');
        return;
      }
      setPhase('done');
      setCustomer({ name: name.trim(), phone: phone.trim() });
      clear();
      router.replace(`/order/${result.orderId}`);
    } catch {
      setError('unknown');
      setPhase('idle');
    }
  }

  if (!hydrated) return <div className="h-40" aria-busy="true" />;

  if (priced.length === 0 && phase !== 'done') {
    return (
      <div className="py-16 text-center">
        {droppedNotice ? <p className="mb-4 text-sm text-accent">{t('removedUnavailable')}</p> : null}
        <p className="text-muted">{t('empty')}</p>
        <Link href="/" className="mt-6 inline-flex h-12 items-center rounded-[var(--radius-pill)] bg-primary px-6 font-semibold text-on-primary">
          {t('browse')}
        </Link>
      </div>
    );
  }

  const fieldClass =
    'mt-1 block h-12 w-full rounded-2xl border border-line bg-surface px-4 text-base outline-none focus:border-ink';

  return (
    <form id={formId} onSubmit={submit} noValidate className="space-y-8 pb-32">
      {droppedNotice ? (
        <p role="status" className="rounded-2xl bg-accent px-4 py-3 text-sm font-medium text-white">
          {t('removedUnavailable')}
        </p>
      ) : null}

      <section>
        <ul className="divide-y divide-line">
          {priced.map((l) => {
            const variant = l.item.variants.find((v) => v.id === l.variantId);
            const options = l.item.groups.flatMap((g) => g.options).filter((o) => l.optionIds.includes(o.id));
            const details = [variant ? localized(variant.name, locale) : null, ...options.map((o) => localized(o.name, locale))]
              .filter(Boolean)
              .join(locale === 'ar' ? '، ' : ', ');
            return (
              <li key={l.key} className="flex items-start gap-3 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{localized(l.item.name, locale)}</p>
                  {details ? <p className="text-sm text-muted">{details}</p> : null}
                  <p className="mt-1 text-sm font-medium tabular-nums">{formatPrice(l.lineTotal, locale)}</p>
                </div>
                <QuantityStepper
                  value={l.quantity}
                  min={0}
                  onChange={(q) => setQuantity(l.key, q)}
                  locale={locale}
                  size="sm"
                />
              </li>
            );
          })}
        </ul>
        <Link href="/" className="mt-2 inline-flex h-11 items-center text-sm font-semibold underline underline-offset-4">
          {t('addMore')}
        </Link>
      </section>

      <section className="rounded-[var(--radius-card)] bg-surface p-4">
        <h2 className="text-sm font-semibold text-muted">{t('pickup')}</h2>
        <p className="mt-1 font-semibold">{t('asap')}</p>
        <p className="text-sm text-muted">{t('readyIn', { minutes: formatNumber(leadMinutes, locale) })}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">{t('yourDetails')}</h2>
        <label className="block text-sm font-medium">
          {t('name')}
          <input
            className={fieldClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            maxLength={60}
            placeholder={t('namePlaceholder')}
            aria-invalid={error === 'invalid_name'}
            required
          />
        </label>
        <label className="block text-sm font-medium">
          {t('phone')}
          <input
            className={`${fieldClass} text-start`}
            dir="ltr"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={20}
            placeholder={t('phonePlaceholder')}
            aria-invalid={error === 'invalid_phone'}
            aria-describedby={`${formId}-phone-hint`}
            required
          />
          <span id={`${formId}-phone-hint`} className="mt-1 block text-xs font-normal text-muted">
            {t('phoneHint')}
          </span>
        </label>
        <label className="block text-sm font-medium">
          {t('notes')}
          <textarea
            className={`${fieldClass} h-20 py-3`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={280}
            placeholder={t('notesPlaceholder')}
          />
        </label>
      </section>

      <div ref={containerRef} />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto max-w-xl">
          {error ? (
            <p role="alert" className="mb-2 text-sm font-medium text-accent">
              {te(error)}
            </p>
          ) : null}
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted">{t('payAtPickup')}</span>
            <span className="font-semibold tabular-nums">
              {t('subtotal')} {formatPrice(subtotal, locale)}
            </span>
          </div>
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex h-14 w-full items-center justify-center rounded-[var(--radius-pill)] bg-primary px-6 text-base font-semibold text-on-primary disabled:opacity-50"
          >
            {phase === 'verifying' ? t('verifying') : phase === 'placing' || phase === 'done' ? t('placing') : t('placeOrder', { price: formatPrice(subtotal, locale) })}
          </button>
        </div>
      </div>
    </form>
  );
}

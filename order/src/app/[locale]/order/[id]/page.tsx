import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SiteHeader } from '@/components/site-header';
import { formatNumber, formatPrice } from '@/lib/format';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getTenant } from '@/lib/tenant/get-tenant';

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Order' });
  return { title: t('status'), robots: { index: false } };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Order confirmation. Step 4 turns this into the live status page (Realtime, ready alert, I'm outside). */
export default async function OrderPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const [tenant, t] = await Promise.all([getTenant(), getTranslations('Order')]);

  // RLS: only the customer who placed the order (or staff) can read it.
  const supabase = await createSupabaseServerClient();
  const { data: order } = UUID.test(id)
    ? await supabase
        .from('orders')
        .select('id, order_number, status, customer_name, total, pickup_at, order_items(id, name_en, name_ar, variant_name_en, variant_name_ar, quantity, line_total)')
        .eq('id', id)
        .eq('tenant_id', tenant.id)
        .maybeSingle()
    : { data: null };

  if (!order) {
    return (
      <>
        <SiteHeader title={t('status')} />
        <main className="mx-auto max-w-xl px-4 py-16 text-center text-muted">{t('notFound')}</main>
      </>
    );
  }

  const time = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
    timeZone: tenant.timezone,
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(order.pickup_at));

  return (
    <>
      <SiteHeader title={t('title', { number: formatNumber(order.order_number, locale) })} />
      <main className="mx-auto w-full max-w-xl space-y-6 px-4 py-6">
        <section className="rounded-[var(--radius-card)] bg-charcoal p-6 text-header-ink">
          <p className="text-sm opacity-80">{t('thanks', { name: order.customer_name })}</p>
          <p className="mt-3 text-5xl font-bold tabular-nums">#{formatNumber(order.order_number, locale)}</p>
          <p className="mt-3 inline-flex rounded-[var(--radius-pill)] bg-primary px-3 py-1 text-sm font-semibold text-on-primary">
            {t(order.status)}
          </p>
          <p className="mt-3 text-sm opacity-80">{t('pickupAround', { time })}</p>
        </section>

        <section>
          <ul className="divide-y divide-line">
            {order.order_items.map((line) => (
              <li key={line.id} className="flex justify-between gap-3 py-3">
                <span>
                  <span className="tabular-nums">{formatNumber(line.quantity, locale)}×</span> {locale === 'ar' ? line.name_ar : line.name_en}
                  {line.variant_name_en ? (
                    <span className="text-muted"> · {locale === 'ar' ? line.variant_name_ar : line.variant_name_en}</span>
                  ) : null}
                </span>
                <span className="tabular-nums">{formatPrice(line.line_total, locale)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-line pt-3 font-semibold">
            <span>{t('total')}</span>
            <span className="tabular-nums">{formatPrice(order.total, locale)}</span>
          </div>
          <p className="mt-1 text-sm text-muted">{t('payAtPickup')}</p>
        </section>
      </main>
    </>
  );
}

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CartView } from '@/components/cart/cart-view';
import { SiteHeader } from '@/components/site-header';
import { StoreBanner } from '@/components/store-banner';
import { getMenu } from '@/lib/menu/queries';
import { storeStatus } from '@/lib/pickup/asap';
import { getTenant } from '@/lib/tenant/get-tenant';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Cart' });
  return { title: t('title'), robots: { index: false } };
}

export default async function CartPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tenant = await getTenant();
  const [menu, t] = await Promise.all([getMenu(tenant.id), getTranslations('Cart')]);
  const status = storeStatus(tenant);

  return (
    <>
      <SiteHeader title={t('title')} />
      <main className="mx-auto w-full max-w-xl px-4 pt-4">
        {status !== 'open' ? (
          <div className="mb-4">
            <StoreBanner status={status} leadMinutes={tenant.pickupLeadMinutes} />
          </div>
        ) : null}
        <CartView
          menu={menu}
          status={status}
          leadMinutes={tenant.pickupLeadMinutes}
          turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined}
        />
      </main>
    </>
  );
}

import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MenuBrowser } from '@/components/menu/menu-browser';
import { SiteHeader } from '@/components/site-header';
import { StoreBanner } from '@/components/store-banner';
import { getMenu } from '@/lib/menu/queries';
import { storeStatus } from '@/lib/pickup/asap';
import { getTenant } from '@/lib/tenant/get-tenant';

type Props = { params: Promise<{ locale: string }> };

export default async function MenuPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tenant = await getTenant();
  const [menu, t] = await Promise.all([getMenu(tenant.id), getTranslations('Home')]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl px-4 pt-5">
        <h1 className="text-2xl font-bold leading-tight tracking-tight">{t('heading')}</h1>
        <div className="mt-3">
          <StoreBanner status={storeStatus(tenant)} leadMinutes={tenant.pickupLeadMinutes} />
        </div>
        <MenuBrowser menu={menu} />
      </main>
    </>
  );
}

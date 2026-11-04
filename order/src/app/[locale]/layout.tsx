import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans_Arabic, Poppins } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localeDir, routing } from '@/i18n/routing';
import { CartProvider } from '@/lib/cart/context';
import { getTenant, tenantName } from '@/lib/tenant/get-tenant';
import { tenantThemeCss } from '@/lib/tenant/theme';
import '../globals.css';

const latin = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-latin',
  display: 'swap',
});

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const tenant = await getTenant();
  const t = await getTranslations({ locale, namespace: 'Meta' });
  const name = tenantName(tenant, locale);
  return {
    title: { default: `${name} | ${t('title')}`, template: `%s | ${name}` },
    description: t('description'),
    applicationName: name,
  };
}

export async function generateViewport(): Promise<Viewport> {
  const tenant = await getTenant();
  return {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
    themeColor: tenant.theme.charcoal,
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const tenant = await getTenant();

  return (
    <html lang={locale} dir={localeDir[locale]} className={`${latin.variable} ${arabic.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: tenantThemeCss(tenant.theme) }} />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider>
          <CartProvider tenantSlug={tenant.slug}>{children}</CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

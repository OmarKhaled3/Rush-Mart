import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SiteHeader } from '@/components/site-header';

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Home');

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl px-4 pb-16 pt-8">
        <h1 className="text-3xl font-bold leading-tight tracking-tight">{t('heading')}</h1>
        <p className="mt-3 text-base text-muted">{t('subheading')}</p>

        <div className="mt-8 rounded-[var(--radius-card)] border border-line bg-surface p-5">
          <p className="text-sm text-muted">{t('comingSoon')}</p>
          <button
            type="button"
            disabled
            className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-[var(--radius-pill)] bg-primary px-6 font-semibold text-on-primary disabled:opacity-60"
          >
            {t('browseMenu')}
          </button>
        </div>
      </main>
    </>
  );
}

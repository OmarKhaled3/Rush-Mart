import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import MenuBoard from '@/components/MenuBoard';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.menu' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function MenuPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const menuTranslations = {
    priceLabel: t('menuSection.priceLabel'),
    note: t('menuSection.note'),
    colS: t('menuSection.colS'),
    colL: t('menuSection.colL'),
  };

  return (
    <section className="menu">
      <div className="wrap">
        <div className="menu-head">
          <div>
            <p className="eyebrow">{t('pages.menu.eyebrow')}</p>
            <h2>
              {t('menuSection.heading1')}
              <span className="red">{t('menuSection.heading2')}</span>
            </h2>
          </div>
        </div>
        <MenuBoard locale={locale} translations={menuTranslations} />
      </div>
    </section>
  );
}

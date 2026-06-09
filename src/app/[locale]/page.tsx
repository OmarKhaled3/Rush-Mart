import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { BoltIcon, ArrowIcon } from '@/components/icons';
import MenuBoard from '@/components/MenuBoard';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const menuTranslations = {
    priceLabel: t('menuSection.priceLabel'),
    note: t('menuSection.note'),
    colS: t('menuSection.colS'),
    colL: t('menuSection.colL'),
  };

  return (
    <>
      {/* Hero */}
      <header>
        <div className="wrap">
          <div className="hero-bolt" aria-hidden="true">
            <BoltIcon style={{ width: '100%', height: 'auto' }} />
          </div>
          <div className="hero-grid">
            <p className="eyebrow rise d1">{t('hero.eyebrow')}</p>
            <h1 className="rise d2">
              <span className="red">{t('hero.heading1')}</span>
              <br />
              <span className="light">{t('hero.heading2')}</span>
            </h1>
            <p className="lede rise d3">{t('hero.lede')}</p>
            <div className="hero-cta rise d4">
              <Link href="/menu" className="pill pill-red">
                {t('hero.ctaMenu')}
                <ArrowIcon className="arrow" />
              </Link>
              <a
                href="https://maps.google.com/?q=Rush+Mart"
                target="_blank"
                rel="noopener noreferrer"
                className="pill pill-ghost"
              >
                {t('hero.ctaFind')}
                <ArrowIcon className="arrow" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Brand statement */}
      <section className="statement">
        <div className="wrap">
          <div className="statement-inner">
            <p className="eyebrow">{t('statement.eyebrow')}</p>
            <h2>
              {t('statement.heading1')}
              <span className="red">{t('statement.heading2')}</span>
            </h2>
            <div className="chips">
              <span className="chip">{t('statement.chip1')}</span>
              <span className="chip">{t('statement.chip2')}</span>
              <span className="chip">{t('statement.chip3')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Menu section */}
      <section className="menu" id="menu">
        <div className="wrap">
          <div className="menu-head">
            <div>
              <p className="eyebrow">{t('menuSection.eyebrow')}</p>
              <h2>
                {t('menuSection.heading1')}
                <span className="red">{t('menuSection.heading2')}</span>
              </h2>
            </div>
          </div>
          <MenuBoard locale={locale} translations={menuTranslations} />
        </div>
      </section>

      {/* Find us */}
      <section className="loc" id="loc">
        <div className="wrap">
          <div className="loc-inner">
            <div>
              <h2>
                {t('loc.heading1')}
                <span className="red">{t('loc.heading2')}</span>
                {t('loc.heading3')}
              </h2>
              <p>{t('loc.body')}</p>
            </div>
            <a
              href="https://maps.google.com/?q=Rush+Mart"
              target="_blank"
              rel="noopener noreferrer"
              className="pill pill-red"
            >
              {t('loc.cta')}
              <ArrowIcon className="arrow" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

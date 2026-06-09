'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/navigation';
import { BoltIcon, ArrowIcon } from '@/components/icons';

export default function Nav() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function handleLangToggle() {
    router.replace(pathname, { locale: locale === 'en' ? 'ar' : 'en' });
  }

  return (
    <nav>
      <div className="wrap">
        <div className="nav-inner">
          <Link href="/" className="brand">
            <span className="r">RUSH</span>
            <BoltIcon className="bolt" width={18} height={18} style={{ color: 'var(--gold)' }} />
            <span>MART</span>
          </Link>

          <div className="nav-links">
            <Link href="/menu">{t('nav.menu')}</Link>
            <a
              href="https://maps.app.goo.gl/i4Ge3ruJBAjbMAkc9?g_st=ic"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('nav.findUs')}
            </a>
            <Link href="/about">{t('nav.about')}</Link>
            <Link href="/careers">{t('nav.careers')}</Link>
          </div>

          <div className="nav-right">
            <button className="lang" onClick={handleLangToggle}>
              {t('langToggle')}
            </button>
            <a
              href="https://maps.app.goo.gl/i4Ge3ruJBAjbMAkc9?g_st=ic"
              target="_blank"
              rel="noopener noreferrer"
              className="pill pill-red"
            >
              {t('nav.findUs')}
              <ArrowIcon className="arrow" width={14} height={14} />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

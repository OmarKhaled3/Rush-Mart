'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

export function LocaleSwitcher() {
  const t = useTranslations('Common');
  const locale = useLocale();
  const pathname = usePathname();
  const next = locale === 'ar' ? 'en' : 'ar';

  return (
    <Link
      href={pathname}
      locale={next}
      aria-label={t('switchLocaleLabel')}
      lang={next}
      className="inline-flex h-9 shrink-0 items-center rounded-[var(--radius-pill)] border border-white/20 px-4 text-sm font-medium"
    >
      {t('switchLocale')}
    </Link>
  );
}

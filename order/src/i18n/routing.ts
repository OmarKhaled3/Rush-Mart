import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ar', 'en'],
  defaultLocale: 'ar',
  // `/` is Arabic, `/en/...` is English.
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];

export const localeDir: Record<Locale, 'rtl' | 'ltr'> = {
  ar: 'rtl',
  en: 'ltr',
};

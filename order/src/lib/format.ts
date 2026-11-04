const cache = new Map<string, Intl.NumberFormat>();

/** "EGP 110" / "‏١١٠ ج.م.‏". Whole pounds drop the decimals. */
export function formatPrice(amount: number, locale: string): string {
  const whole = Number.isInteger(amount);
  const key = `${locale}:${whole}`;
  let fmt = cache.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: 2,
    });
    cache.set(key, fmt);
  }
  return fmt.format(amount);
}

export function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG').format(value);
}

import { getLocale, getTranslations } from 'next-intl/server';
import { formatNumber } from '@/lib/format';
import type { StoreStatus } from '@/lib/pickup/asap';

export async function StoreBanner({ status, leadMinutes }: { status: StoreStatus; leadMinutes: number }) {
  const [t, locale] = await Promise.all([getTranslations('Store'), getLocale()]);
  const styles =
    status === 'open'
      ? 'bg-surface-2 text-ink'
      : 'bg-accent text-white';
  return (
    <p role={status === 'open' ? undefined : 'status'} className={`rounded-2xl px-4 py-3 text-sm font-medium ${styles}`}>
      {status === 'open' ? t('open', { minutes: formatNumber(leadMinutes, locale) }) : t(status)}
    </p>
  );
}

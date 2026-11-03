import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('NotFound');
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <Link href="/" className="font-semibold underline underline-offset-4">
        {t('back')}
      </Link>
    </main>
  );
}

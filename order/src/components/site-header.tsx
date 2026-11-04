import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getTenant, tenantName } from '@/lib/tenant/get-tenant';
import { BackIcon } from './ui/icons';
import { LocaleSwitcher } from './locale-switcher';

/** Charcoal app bar. With `title`, shows a back link to the menu instead of the brand. */
export async function SiteHeader({ title, backHref = '/' }: { title?: string; backHref?: string }) {
  const [tenant, locale, t] = await Promise.all([getTenant(), getLocale(), getTranslations('Common')]);
  const name = tenantName(tenant, locale);

  return (
    <header className="sticky top-0 z-30 bg-header pt-[env(safe-area-inset-top)] text-header-ink">
      <div className="mx-auto flex h-14 w-full max-w-xl items-center justify-between gap-3 px-4">
        {title ? (
          <div className="flex min-w-0 items-center gap-1">
            <Link href={backHref} aria-label={t('back')} className="-ms-2 inline-flex h-11 w-11 items-center justify-center rounded-full">
              <BackIcon />
            </Link>
            <h1 className="truncate text-base font-semibold">{title}</h1>
          </div>
        ) : (
          <Link href="/" className="flex min-w-0 items-center gap-2">
            {tenant.logoUrl ? (
              <Image src={tenant.logoUrl} alt="" width={56} height={36} priority className="h-9 w-auto" />
            ) : null}
            <span className="truncate text-base font-semibold">{name}</span>
          </Link>
        )}
        <LocaleSwitcher />
      </div>
    </header>
  );
}

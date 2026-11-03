import Image from 'next/image';
import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getTenant, tenantName } from '@/lib/tenant/get-tenant';
import { LocaleSwitcher } from './locale-switcher';

export async function SiteHeader() {
  const [tenant, locale] = await Promise.all([getTenant(), getLocale()]);
  const name = tenantName(tenant, locale);

  return (
    <header className="sticky top-0 z-30 bg-header text-header-ink pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 w-full max-w-xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          {tenant.logoUrl ? (
            <Image src={tenant.logoUrl} alt={name} width={56} height={36} priority className="h-9 w-auto" />
          ) : null}
          <span className="truncate text-base font-semibold">{name}</span>
        </Link>
        <LocaleSwitcher />
      </div>
    </header>
  );
}

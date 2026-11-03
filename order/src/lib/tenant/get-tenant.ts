import 'server-only';
import { cache } from 'react';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { TENANT_HEADER } from './resolve';
import { STUB_TENANTS } from './stub';
import type { Tenant } from './types';

/**
 * The current request's tenant, resolved by the proxy from the hostname.
 * Cached per request. Throws a 404 if the host maps to no active tenant.
 */
export const getTenant = cache(async (): Promise<Tenant> => {
  const slug = (await headers()).get(TENANT_HEADER);
  const tenant = slug ? STUB_TENANTS[slug] : undefined;
  if (!tenant || !tenant.isActive) notFound();
  return tenant;
});

export function tenantName(tenant: Tenant, locale: string): string {
  return locale === 'ar' ? tenant.nameAr : tenant.nameEn;
}

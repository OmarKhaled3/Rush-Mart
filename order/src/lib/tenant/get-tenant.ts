import 'server-only';
import { cache } from 'react';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { createSupabasePublicClient } from '@/lib/supabase/server';
import { mapTenant } from './map';
import { TENANT_HEADER } from './resolve';
import type { Tenant } from './types';

/**
 * The current request's tenant, resolved by the proxy from the hostname.
 * Cached per request. 404s if the host maps to no active tenant.
 */
export const getTenant = cache(async (): Promise<Tenant> => {
  const slug = (await headers()).get(TENANT_HEADER);
  if (!slug) notFound();

  const { data, error } = await createSupabasePublicClient()
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();
  if (error) throw new Error(`Failed to load tenant: ${error.message}`);
  if (!data) notFound();
  return mapTenant(data);
});

export function tenantName(tenant: Tenant, locale: string): string {
  return locale === 'ar' ? tenant.nameAr : tenant.nameEn;
}

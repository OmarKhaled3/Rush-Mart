import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import { supabasePublishableKey, supabaseUrl } from './lib/supabase/env';
import { refreshSupabaseSession } from './lib/supabase/proxy';
import { TENANT_HEADER, cachedLookup, postgrestDomainLookup, resolveTenantSlug } from './lib/tenant/resolve';

const handleI18n = createIntlMiddleware(routing);
const lookupDomain = cachedLookup(postgrestDomainLookup(supabaseUrl(), supabasePublishableKey()));

/**
 * 1. Resolve the tenant from the hostname (tenant_domains, cached) and pass it on as a trusted
 *    request header. Any client-sent value for that header is overwritten.
 * 2. Hand off to next-intl for locale detection and prefixing (Arabic default).
 * 3. Refresh the Supabase session cookie, only for visitors who have one.
 */
export default async function proxy(request: NextRequest) {
  const slug = await resolveTenantSlug(request.headers.get('host'), lookupDomain);
  if (!slug) {
    return new NextResponse('Store not found', { status: 404 });
  }

  const headers = new Headers(request.headers);
  headers.set(TENANT_HEADER, slug);

  const response = handleI18n(new NextRequest(request, { headers }));
  await refreshSupabaseSession(request, response);
  return response;
}

export const config = {
  // Everything except Next internals, the optional /sb Supabase pass-through, and files with an
  // extension (images, sw.js, ...).
  matcher: ['/((?!_next|_vercel|sb/|.*\\..*).*)'],
};

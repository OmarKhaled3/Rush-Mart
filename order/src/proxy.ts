import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import { TENANT_HEADER, resolveTenantSlug } from './lib/tenant/resolve';

const handleI18n = createIntlMiddleware(routing);

/**
 * 1. Resolve the tenant from the hostname and pass it on as a trusted request header.
 *    Any client-sent value for that header is overwritten.
 * 2. Hand off to next-intl for locale detection and prefixing (Arabic default).
 * Step 2 adds Supabase session refresh here.
 */
export default function proxy(request: NextRequest) {
  const slug = resolveTenantSlug(request.headers.get('host'));

  if (!slug) {
    return new NextResponse('Store not found', { status: 404 });
  }

  const headers = new Headers(request.headers);
  headers.set(TENANT_HEADER, slug);

  return handleI18n(new NextRequest(request, { headers }));
}

export const config = {
  // Everything except Next internals and files with an extension (images, sw.js, ...).
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};

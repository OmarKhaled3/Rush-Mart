import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL) : null;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // This app lives in a subfolder of a repo whose root has its own lockfile (the marketing site).
  // Pin the root so Turbopack resolves packages from order/node_modules.
  turbopack: { root: import.meta.dirname },
  // Local previews only: forward /sb/* to the local Supabase stack so a remote browser can reach
  // it through this app's origin. Unset in production.
  async rewrites() {
    const target = process.env.SUPABASE_PROXY_TARGET;
    return target ? [{ source: '/sb/:path*', destination: `${target.replace(/\/$/, '')}/:path*` }] : [];
  },
  images: {
    // Menu photos from the Supabase Storage `menu-images` bucket.
    remotePatterns: supabaseHost
      ? [
          {
            protocol: supabaseHost.protocol.replace(':', '') as 'http' | 'https',
            hostname: supabaseHost.hostname,
            port: supabaseHost.port,
            pathname: '/storage/v1/object/public/menu-images/**',
          },
        ]
      : [],
  },
};

export default withNextIntl(nextConfig);

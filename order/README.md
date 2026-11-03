# Rush Order

Multi-tenant order-ahead PWA for convenience marts. Rush Mart is tenant #1.

Next.js (App Router) + TypeScript, Supabase, next-intl (Arabic default, full RTL), Tailwind v4.

## Quick start

```bash
cd order
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000 (Arabic) or http://localhost:3000/en (English). On `localhost`
and `*.vercel.app` the tenant falls back to `DEFAULT_TENANT_SLUG`.

## Environment variables

| Name | Purpose |
|---|---|
| `DEFAULT_TENANT_SLUG` | Tenant used on localhost and Vercel preview URLs |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (step 2) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable key (step 2) |

Full setup, Supabase, seed and deploy steps land with the later milestones.

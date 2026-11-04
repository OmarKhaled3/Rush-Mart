# Rush Order

Multi-tenant order-ahead PWA for convenience marts. Rush Mart is tenant #1 at `order.rushmart-eg.com`.

Next.js 16 (App Router) + TypeScript, Supabase (Postgres, Auth, Realtime, RLS), next-intl (Arabic
default, full RTL), Tailwind v4. The plan and data model are in [`docs/plan.md`](docs/plan.md).

## Local setup

Requires Node 22+ and Docker (for the local Supabase stack).

```bash
cd order
npm install
npm run db:start      # local Supabase: Postgres, Auth, REST, Realtime, Storage
npm run db:reset      # apply migrations + seed Rush Mart
cp .env.example .env.local
```

Put the local publishable key into `.env.local` (`npx supabase status` prints it as
`PUBLISHABLE_KEY`), then:

```bash
npm run dev
```

Open http://localhost:3000 (Arabic) or http://localhost:3000/en (English). On `localhost` and
`*.vercel.app` the tenant falls back to `DEFAULT_TENANT_SLUG`.

Seeded logins (local only):

| Role  | Email                 | Password               |
|-------|-----------------------|------------------------|
| owner | `owner@rushmart.test` | `rushmart-owner-local` |
| staff | `staff@rushmart.test` | `rushmart-staff-local` |

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` / `typecheck` | ESLint, `tsc --noEmit` |
| `npm test` | Unit tests (Vitest) |
| `npm run test:db` | RLS and RPC tests against the local stack (creates and deletes its own tenants) |
| `npm run db:start` / `db:stop` | Start or stop local Supabase |
| `npm run db:reset` | Re-apply all migrations and seed |
| `npm run db:seed` | Seed or update Rush Mart (safe to re-run; `-- --reset-menu` rebuilds the menu) |
| `npm run db:types` | Regenerate `src/lib/supabase/database.types.ts` after a migration |

## Environment variables

| Name | Where | Purpose |
|---|---|---|
| `DEFAULT_TENANT_SLUG` | app | Tenant for localhost and Vercel preview URLs |
| `NEXT_PUBLIC_SUPABASE_URL` | app | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | app | Supabase publishable (anon) key |
| `SUPABASE_SECRET_KEY` | seed only | Secret key. Never set it in the browser or on Vercel |
| `SEED_OWNER_EMAIL`, `SEED_OWNER_PASSWORD` | seed only | Owner login (required for hosted) |
| `SEED_STAFF_EMAIL`, `SEED_STAFF_PASSWORD` | seed only | Staff login (required for hosted) |

## Database

Migrations live in `supabase/migrations/`. Every tenant table carries `tenant_id` and RLS is on
everywhere. App users can only SELECT; all writes go through `SECURITY DEFINER` functions that
check the caller's role (`place_order`, `mark_outside`, `set_order_status`, `set_item_stock`,
`set_option_stock`, `set_ordering_paused`, `update_store_settings`, `tenant_insights`).

The menu is edited in the Supabase dashboard (or `supabase/seed/rushmart-menu.ts` + reseed) in v1.

Hosted setup and Vercel deploy steps land with the final milestone.

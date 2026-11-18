# Deploying Rush Order

Production runs on Vercel (app) and Supabase (database, auth, realtime).

| Piece | Value |
|---|---|
| Supabase project | `rush-order` (ref `worreirmaaigkdmgsuwe`), region eu-central-1 (Frankfurt) |
| Supabase URL | `https://worreirmaaigkdmgsuwe.supabase.co` |
| App domain | `order.rushmart-eg.com` (registered in `tenant_domains`) |

The hosted database already has all migrations in `supabase/migrations/`, plus the Rush Mart
tenant, domain and menu.

## 1. Supabase dashboard (one time)

1. **Authentication > Sign In / Providers**: turn on **Allow anonymous sign-ins**. Guest
   checkout needs it; without it, placing an order fails.
2. **Authentication > URL Configuration**: Site URL `https://order.rushmart-eg.com`.
3. **Authentication > Attack Protection** (before announcing the app): enable CAPTCHA with
   **Cloudflare Turnstile**, paste the Turnstile **secret key** there, and put the **site key**
   in Vercel as `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
4. **Authentication > Users > Add user**: create the owner and staff logins (email, password,
   auto confirm). Then link them to Rush Mart with SQL (SQL Editor), replacing the emails:

   ```sql
   insert into public.tenant_members (tenant_id, user_id, role)
   select t.id, u.id, r.role::public.tenant_role
   from public.tenants t
   cross join (values ('owner@example.com', 'owner'), ('staff@example.com', 'staff')) as r(email, role)
   join auth.users u on lower(u.email) = lower(r.email)
   where t.slug = 'rushmart'
   on conflict (tenant_id, user_id) do update set role = excluded.role;
   ```

Free-plan projects pause after a week without traffic; upgrade the plan before launch.

## 2. Vercel project

This is a **second** Vercel project on the same GitHub repo as the marketing site.

1. Vercel > **Add New > Project** > import `OmarKhaled3/Rush-Mart`.
2. **Root Directory**: `order`. Framework preset: Next.js (detected).
3. **Environment Variables** (Production and Preview):

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://worreirmaaigkdmgsuwe.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | the project's publishable key (`sb_publishable_...`, Supabase > Project Settings > API Keys) |
   | `DEFAULT_TENANT_SLUG` | `rushmart` |
   | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile site key (once step 1.3 is done) |

   Never set `SUPABASE_SECRET_KEY`, `TENANT_FALLBACK_ALL_HOSTS`, `SUPABASE_PROXY_TARGET` or
   `NEXT_PUBLIC_SUPABASE_BROWSER_URL` on Vercel.
4. Deploy. The `*.vercel.app` URL works right away (it falls back to `DEFAULT_TENANT_SLUG`).

Production deploys come from the repo's default branch, so the app goes to production once
the `order/` work is merged there. Until then, every push to the feature branch gets a
Preview URL.

## 3. Domain

1. Vercel project > **Settings > Domains** > add `order.rushmart-eg.com`.
2. At the DNS provider for `rushmart-eg.com`, add the record Vercel shows, normally a
   **CNAME** for `order` pointing at the target Vercel displays.
3. Wait for Vercel to show the domain as valid (HTTPS is issued automatically).

## Adding another tenant later

Insert a `tenants` row and its menu, add its hostname to `tenant_domains`, add that domain to
the same Vercel project, and link its owner and staff in `tenant_members`. No code changes.

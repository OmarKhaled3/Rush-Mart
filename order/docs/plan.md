# Rush Order v1 plan

Multi-tenant order-ahead PWA. Rush Mart (Egypt) is tenant #1 at `order.rushmart-eg.com`.
This is the approved plan with every revision folded in. If it conflicts with older notes, this file wins.

## Decisions
- The app lives in `order/`, separate from the marketing site in the repo root. It has its own
  package and its own Vercel project with Root Directory `order`, and it never imports from `../`.
- Next.js 16 (App Router, `src/proxy.ts`), TypeScript strict, next-intl 4 (Arabic default at `/`,
  English at `/en`, full RTL), Tailwind v4 tokens, `@supabase/ssr`, zod, zustand. No UI library.
- Theme is charcoal-first with light/dark following `prefers-color-scheme`. Yellow is the primary
  CTA and red is for alerts and "outside". Fonts are Poppins and IBM Plex Sans Arabic. Brand
  colors come from the tenant row.
- Copy has no em dashes.

## Tenancy
Think of it as an apartment building: one app and one database for everyone. Every row carries
a flat number (`tenant_id`) and RLS is the lock on each door. The hostname is the address on
the envelope.
- `src/proxy.ts` maps the host to `tenant_domains` and then to a trusted `x-tenant-slug` header.
  Any client-sent value for that header is overwritten. An unknown host returns 404.
  `localhost` and `*.vercel.app` fall back to `DEFAULT_TENANT_SLUG`.
- `getTenant()` (server, cached per request) loads the tenant config.

## Roles
| Role | Source | Can |
|---|---|---|
| customer | any auth user (anonymous guest or, in v2, phone-verified) | place own orders, read own orders, mark own order outside |
| staff | `tenant_members.role = 'staff'` | order queue, status changes, stock toggles, pause ordering |
| owner | `tenant_members.role = 'owner'` | everything staff can do, plus insights and store settings (opening hours, lead time) |
| super_admin (later) | `platform_admins` row | passes every staff and owner check; empty in v1 |

RLS helpers (`security definer`, `stable`, `search_path = ''`):
- `is_tenant_staff(t)`: owner, staff or platform admin.
- `is_tenant_owner(t)`: owner or platform admin.

## Data model (`order/supabase/migrations/`)
Every table has a uuid `id`, `tenant_id`, `created_at` and `updated_at`. Indexes lead with
`tenant_id`. Prices are `numeric(10,2)` EGP.

| Table | Key columns |
|---|---|
| `tenants` | `slug`, `name_en/ar`, `logo_url`, `theme jsonb`, `timezone` (default `Africa/Cairo`), `currency`, `opening_hours jsonb` (weekday 0..6 to `[{open,close}]`, `24:00` allowed, overnight windows allowed), `pickup_lead_minutes`, `ordering_paused`, `paused_until`, `features jsonb`, `is_active` |
| `tenant_domains` | `hostname` pk, `tenant_id` |
| `tenant_members` | `tenant_id`, `user_id`, `role tenant_role ('owner','staff')` |
| `platform_admins` | `user_id` pk |
| `categories` | `name_en/ar`, `sort`, `is_active` |
| `items` | `category_id`, `name_en/ar`, `description_en/ar`, `image_path`, `base_price` (null when the item has variants), `in_stock`, `is_active`, `sort` |
| `item_variants` | `item_id`, `name_en/ar` (Small, Large), `price`, `sort` |
| `modifier_groups` | `name_en/ar`, `min_select`, `max_select`, `sort` |
| `modifier_options` | `group_id`, `name_en/ar`, `price_delta`, `in_stock`, `sort` |
| `item_modifier_groups` | `item_id`, `group_id`, `sort` |
| `orders` | `customer_id`, `order_number` (per tenant per local day), `status` (`received`, `preparing`, `ready`, `collected`, `cancelled`), `pickup_type` (`asap` only in v1), `pickup_at`, `customer_name`, `customer_phone` (normalized `+20...`), `notes`, `subtotal`, `total`, `payment_method` (`pay_at_pickup`), `payment_status` (`unpaid`, `paid`, `refunded`, `failed`), `payment_provider_ref`, `is_outside`, `outside_at`, `car_description`, `received_at`, `preparing_at`, `ready_at`, `collected_at`, `cancelled_at` |
| `order_items` | `order_id`, `item_id`, `variant_id`, snapshot fields `name_en/ar` and `variant_name_en/ar`, `unit_price`, `quantity`, `modifiers jsonb`, `line_total` |
| `order_counters` | `(tenant_id, day)` pk, `last_number` |

The status flow is received, then preparing, then ready, then collected. Cancel is allowed from
any non-final state. A trigger enforces these transitions and stamps the matching `*_at` column.

## Write paths (RPCs; no direct insert or update for app users)
- `place_order(tenant_id, payload)` (customer):
  - The tenant must be active, not paused, and open now in its timezone.
  - `pickup_at` is set to now plus `pickup_lead_minutes`.
  - Items, variants and options must be active, in stock, and belong to this tenant.
  - Modifier min/max limits are enforced.
  - Prices are recomputed in the database.
  - Open-order limit: 1 for anonymous users, 3 for signed-in users.
  - Lines are snapshotted and `order_number` is assigned.
- `mark_outside(order_id, car_description)` (owner of the order, before collected or cancelled).
- `set_order_status(order_id, status)` (staff).
- `set_item_stock(item_id, in_stock)` and `set_option_stock(option_id, in_stock)` (staff).
- `set_ordering_paused(tenant_id, paused, minutes)` (staff).
- `update_store_settings(tenant_id, opening_hours, pickup_lead_minutes)` (owner).
- `tenant_insights(tenant_id, from date, to date)` (owner; raises for anyone else).

v1 menu content is managed through the seed and the Supabase dashboard. Menu tables only get
public read policies.

## RLS summary
- Menu tables, `tenants` and `tenant_domains`: public select of active rows. No user writes.
- `orders` and `order_items`: select for the order's customer or `is_tenant_staff`.
- `tenant_members`: users can read their own membership rows.
- Storage `menu-images`: public read, and service-role writes only in v1.
- Realtime is enabled on `orders`, with RLS applied to subscribers.

## Insights (owner only, `/staff/insights`)
`tenant_insights` returns one jsonb object for a date range. Day boundaries come from the
tenant's `timezone` (Africa/Cairo for Rush Mart), and the range runs from `from` 00:00 local
up to `to + 1` 00:00 local.
- `orders`: placed orders, excluding cancelled. `collected` and `cancelled` counts.
- `revenue`: sum of `total` over collected orders (payment is taken at pickup).
  `avg_order_value` is revenue divided by collected orders.
- `top_items`: top 10 by quantity, with revenue, grouped by item and showing localized names.
- `orders_by_hour`: 24 buckets in local time.
- `avg_prep_seconds`: average of `ready_at - received_at`.
- `customers` and `repeat_customers`: a customer is identified by normalized phone, because
  guests are a new anonymous user per device. A repeat customer has 2 or more orders in range.
- `cancellation_rate`: cancelled divided by all placed orders.

The page is mobile-first with Today, 7 days and 30 days tabs, stat tiles, plain CSS bars for
the hourly chart, and a top items list. No chart library.

## Customer experience
- `/` menu with category tabs and item cards.
- Item sheet with variant, modifiers and quantity.
- Cart and ASAP checkout with name and phone, then `place_order`. The anonymous sign-in is
  protected by Turnstile on hosted projects.
- `/order/[id]` live status via Realtime. When the order is ready, the page plays a sound,
  vibrates and updates `document.title`. "I'm outside" takes an optional car description.

## Staff and owner experience (`/staff/...`)
- `login`: email and password.
- `/staff` queue:
  - Realtime, refetched on reconnect and when the tab becomes visible again.
  - The "Start shift" tap unlocks audio and the wake lock.
  - New-order chime.
  - Outside orders are highlighted in red, sorted to the top and get their own sound.
  - Large tap targets advance the status. A pause ordering control sits in the header.
- `/staff/stock`: item and modifier option toggles.
- `/staff/insights` (owner only).
- `/staff/settings` (owner only): opening hours and lead time.
- Navigation hides owner-only links from staff, and pages and RPCs enforce the same rules.

## Delivery steps
1. Scaffold, tokens, i18n and RTL, tenant proxy with a stubbed config. **Done.**
2. Local Supabase:
   - migrations, RLS and RPCs, including `tenant_insights` and `update_store_settings`
   - generated types
   - a seed with the Rush Mart menu copied into `order/supabase/seed/`, plus one owner and
     one staff user taken from env
   - DB tests, including that staff cannot read insights or change settings
   - the tenant lookup switches to the database
3. Customer menu, item sheet, cart and ASAP checkout via `place_order` with Turnstile.
4. Live status page with the ready alert and "I'm outside".
5. Staff auth, the Realtime queue with sounds, status actions and pause ordering.
6. Stock toggles.
7. Owner area: insights page and store settings.
8. PWA (manifest, service worker, offline page), a performance pass, and the README with setup,
   env vars and deploy steps.

## Out of scope for v1
Online payment (Paymob in v2), POS integration, loyalty, native apps, delivery, web push,
scheduled pickup slots, phone OTP, order history, reorder, the menu editor and photo upload.

## Verification
- `npm run lint`, `npm run typecheck`, `npm test` (unit tests: opening hours, pricing, phone).
- `npm run db:reset`, then `npm run test:db`, which runs against local Supabase with two
  tenants. It checks:
  - cross-tenant isolation
  - a customer cannot read other customers' orders or change status
  - `place_order` rejects tampered prices, out-of-stock items, a paused or closed store, and too
    many open orders
  - invalid status transitions fail
  - staff cannot call `tenant_insights` or `update_store_settings`, or write `tenants` directly
  - the owner can do both
- Playwright e2e and Lighthouse are deferred until after launch.

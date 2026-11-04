# Rush Order (order ahead PWA)

Multi-tenant order-ahead PWA. Rush Mart is tenant #1, served at `order.rushmart-eg.com`.
This app is fully independent of the marketing site in the repo root: never import from `../`.
The approved plan is `docs/plan.md`; the rules below always apply.

## Rules
- **Tenancy:** every table carries `tenant_id`; RLS enforces isolation. The tenant comes from
  the hostname in `src/proxy.ts` and is read server-side with `getTenant()`. Never trust a
  tenant id sent by the client.
- **Writes go through Postgres RPCs** (`place_order`, `mark_outside`, `set_order_status`, ...).
  The client never sends prices; the database recomputes them.
- **i18n:** Arabic is the default locale (`/`), English at `/en`. All UI strings live in
  `messages/{ar,en}.json`; tenant content uses `name_en` / `name_ar` columns.
- **RTL:** use Tailwind logical utilities only (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`,
  `text-start`). Never `ml-`, `mr-`, `left-`, `right-`, `text-left`. Flip directional icons
  with `rtl:-scale-x-100`.
- **Theme:** tokens live in `src/app/globals.css`; brand colors come from the tenant row via
  `tenantThemeCss`. Light/dark follows `prefers-color-scheme`. Yellow is the primary CTA,
  red is for alerts and "I'm outside".
- **Copy:** no em dashes anywhere in UI copy. Use periods or commas.
- **Payments:** v1 is pay at pickup only. Keep `orders.payment_status` and the
  `PaymentProvider` abstraction intact for Paymob in v2.
- **Performance:** mobile first, mid-range Android on 4G. Prefer Server Components; keep
  client JS small; no UI component libraries.

## Commands
`npm run dev` · `npm run lint` · `npm run typecheck` · `npm test` · `npm run test:db` (needs `npm run db:start`) · `npm run db:reset` · `npm run db:types` after any migration

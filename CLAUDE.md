# Rush Mart Website

Project context for Claude Code. Read this fully before writing any code, and treat
`rush-mart-concept.html` (in the repo root) as the approved visual reference. Match its
look, structure, and tone. Do not redesign it; build it for real.

## What we are building
A bilingual (English + Arabic) marketing website for Rush Mart, a coffee and convenience
store brand in Egypt. Mostly content for now, with a checkout flow added later.

## Brand
- Mission: fast, reliable, high quality coffee, snacks, and daily essentials, open 24/7.
- Slogan: "Grab. Go. Rush."
- Palette: warm off-white and near-black base; brand red `#C8201B` as the single accent;
  gold/yellow and the lightning bolt used very sparingly.
- Feel: premium through restraint. Generous space, large hero type, rounded corners,
  red used scarcely so it carries weight. Energy as an accent, never wallpaper.

## Hard requirements
- **Theme:** Light is the default. Dark theme follows the system setting via
  `prefers-color-scheme`. No drive-thru framing. No "60 second" or free-coffee promise.
- **Bilingual + RTL:** English and Arabic. The whole layout mirrors to right-to-left in
  Arabic, not just translated strings. Plan routing and styles for this from the start.
- **Single location:** The brand has one branch. "Find us" links out to the Google Maps
  pin (placeholder in the concept; swap in the real URL). No multi-store locator yet.
- **Copy style:** No em dashes anywhere in site copy. Use periods or commas.
- **Payments ready, later:** Architecture should accommodate a checkout connected to
  Paymob or Geidea down the line. Do not build payments now; just do not block it.

## Suggested stack
- Next.js (App Router) + TypeScript.
- Internationalization with `next-intl` (or App Router i18n) including `dir="rtl"` handling.
- Styling: your call, but keep design tokens (colors, spacing, radii) centralized so the
  light/dark themes and the single red accent stay consistent.
- Deploy target and custom domain are already chosen by the owner.

## Pages
- Home: hero ("Good coffee, ready when you are."), brand statement strip, menu preview.
- Menu: the full menu (see below) as the centerpiece, kept in the drive-thru board look.
- About: the brand mission.
- Careers and Contact: minimal.
- Find us: external link to the Google Maps pin (not an internal page for now).

## Menu (the part the owner likes most)
- Source data lives in the concept file's `MENU` array. Move it into a typed JSON/TS data
  file so the client can edit prices and items without touching components.
- Eight categories: Coffee, Iced Coffee, Hot Beverages, Frappe, Tea & Herbs, Cold
  Beverages, Bakery, Extras. Most have Small/Large pricing; Tea, Bakery, Extras are single
  price. Prices are in EGP.
- Keep the tabbed board UI. Each item needs both English and Arabic names (the concept
  shows English only to stay light; the real menu PDF has the Arabic names, wire them in).

## Definition of done for v1
Bilingual home + menu + about + careers + contact, light default with system dark,
working EN/AR toggle with correct RTL, "Find us" to Maps, fully responsive, no em dashes.

A full redesign at this scope is a multi-phase effort. I'll ship it in 4 phases so each one lands cleanly, you can see the change after every phase, and we avoid one giant unreviewable diff. All work stays in frontend/presentation code — no DB, RLS, or backend changes.

---

## Phase 1 — Design system foundation (the multiplier)

Every later phase depends on this, so we do it first. After this phase the whole site already *feels* softer and more feminine, even before redesigning individual components.

**Typography**
- Add Cormorant Garamond (display serif) + Inter (UI sans) via `<link>` in `index.html`.
- `tailwind.config.ts`: add `font-display` (Cormorant), keep `font-serif` (Playfair, used today) as a fallback alias, set `font-sans` to Inter.
- `index.css`: switch `h1–h6` default to Cormorant, looser line-height (1.1 display / 1.3 section), softer letter-spacing.
- Add a tiny typography utility set: `.eyebrow` (uppercase micro-label, tracked), `.editorial-headline`, `.price-now`, `.price-was`.

**Color tokens (HSL only, in `index.css`)**
- Warm ivory background `36 38% 97%`, surface `34 28% 94%`, blush tint `18 40% 95%`.
- Soften foreground from `0 0% 8%` to warm charcoal `25 12% 18%`; body text uses `25 10% 32%`.
- Replace harsh gold `43 55% 52%` with champagne `38 42% 58%` + soft champagne `38 50% 78%`.
- New tokens: `--blush`, `--sand`, `--champagne`, `--champagne-soft`, `--ink-soft`, `--gradient-blush`, `--shadow-soft`, `--shadow-card`.
- Map all of these into `tailwind.config.ts` so Tailwind classes (`bg-blush`, `text-ink-soft`, etc.) work everywhere.

**Spacing, radius, motion**
- Bump `--radius` to `0.875rem` (softer cards, buttons, drawers).
- Add a section-rhythm utility: `.section-y` = `py-10 md:py-16 lg:py-20`, used in homepage rows to kill the random gap problem.
- Tailwind keyframes: add `fade-up`, `soft-zoom`, `shimmer`; standardize easing on `cubic-bezier(0.32, 0.72, 0, 1)` for a soft luxury feel.

**Button system (`src/components/ui/button.tsx`)**
- New variants: `luxury` (champagne fill, ink text, `rounded-full`, generous padding, subtle shadow, soft hover lift), `ghost-luxury` (transparent + thin champagne border), `link-serif` (Cormorant italic underline-on-hover).
- Default sizes get more padding (`h-11`, `px-6`) and `rounded-full` for primary CTAs.

Result after Phase 1: the entire app already reads warmer/softer because every component inherits these tokens. No layout changes yet.

---

## Phase 2 — Homepage editorial redesign

Files touched: `src/pages/Index.tsx`, `src/components/eraya/HeroSlider.tsx`, `src/components/eraya/Hero.tsx`, `src/components/eraya/CategoryRow.tsx`, `src/components/eraya/ProductCard.tsx`, `src/components/eraya/ProductRow.tsx`.

**Hero**
- Brighter ivory backdrop, soft top-to-bottom blush gradient overlay instead of dark vignette.
- Editorial composition: small eyebrow ("New Season · Spring '26"), large Cormorant headline ("Wear Your Glow ✨"), one-line supporting copy in Inter, single luxury CTA.
- Text shifts to left-aligned bottom-third on mobile, centered with generous margin on desktop.
- Soft Ken-Burns scale on the image (10s, `ease-out`), fade between slides.

**Trust strip (new)** — thin row under hero: Waterproof · Tarnish Resistant · Hypoallergenic · PAN India Shipping. Tiny line icons + Cormorant labels in champagne.

**Category row**
- Replace circle tiles with rounded-rectangle editorial cards (4:5 portrait crop, `rounded-2xl`, soft shadow on hover, label below in Cormorant, count in micro-uppercase).
- Snap-scroll on mobile, 4-up grid on desktop.

**Product rows**
- Section header: small uppercase eyebrow above a serif title, "View all" as link-serif on the right.
- Consistent `section-y` spacing between rows.

**Product card redesign (also used in catalogue/category)**
- 4:5 image with `aspect-[4/5] object-cover`, subtle `soft-zoom` on hover, fade-in once loaded, shimmer skeleton while loading.
- Below image: 2-line clamped Cormorant title, price block with champagne "now" + soft-grey strike-through "was", optional micro-label chip ("Bestseller", "Waterproof", "Anti-Tarnish", "Hypoallergenic", "Everyday Favorite") top-left over the image — pulled from existing `product.tags` so no data work needed.
- Heart icon (existing LoveItButton) repositioned top-right, softer fill.

**Emotional copy strip** — between rows: a single line in italic Cormorant, e.g. "Jewellery that feels like you." Centered, generous vertical air, no buttons.

**Social proof / ERAYA Girls section (new)** — Instagram-style row of round bubbles linking to reviews/UGC. Pulls from existing reviews table (with images) — no schema change, just a new component reading `reviews` filtered to ones with `image_url`. Title: "ERAYA Girls ✨".

**Existing `ReviewsSection`** — restyled (softer cards, Cormorant quotes, champagne stars) but kept in place.

---

## Phase 3 — Navigation, drawer & footer

**Header / top bar** (`src/components/header/Header.tsx`, `Navigation.tsx`)
- Slightly taller, ivory background with hairline bottom border, centered serif wordmark, icons (search/wishlist/bag) in warm charcoal.

**Side drawer** (`src/components/header/Navigation.tsx`)
- Narrower (`w-[82vw] max-w-[340px]`), warm ivory background, generous vertical rhythm.
- Sections grouped with small uppercase eyebrows ("Shop", "Discover", "Support").
- Add menu items (links only — no new pages built yet): Recently Viewed, ERAYA Girls, Styling Inspiration, Customer Reviews. These will point to anchors / existing routes (e.g. Reviews → `#reviews`, Styling Inspiration → `/about` for now); we can wire to real pages later if you want them as standalone screens.
- Login/profile block pinned to bottom with soft champagne divider.

**Bottom nav (mobile)** — softer pill background, champagne active indicator instead of harsh black.

**Footer redesign** (`src/components/footer/Footer.tsx`)
- 4 columns on desktop, accordion on mobile: Shop, Support, About, Connect.
- Refined typography (Cormorant headings, Inter links), Instagram + WhatsApp + email icons, trust badges row above copyright.
- Bottom line: "ERAYA © 2026 · Adorn Your Story".

---

## Phase 4 — Polish, motion & QA

- Global image polish: shimmer skeleton on `SafeImage`, fade-in on load, consistent `aspect-[4/5]` crops across cards.
- Microinteractions: `fade-up` on section enter (IntersectionObserver, ≤200ms, runs once), softer hover lifts (`translate-y-[-2px]` + shadow), no scale > 1.03 anywhere.
- Mobile pass at 360 / 384 / 414 widths: tighten paddings, fix any cramped rows, verify thumb targets ≥44px.
- Lighthouse sanity: lazy-load all below-the-fold images, ensure no layout shift on hero (reserve aspect-ratio), keep route-level code-splitting intact.
- No PWA or service-worker changes (you fixed that last round).

---

## Out of scope for this redesign

- No backend / RLS / migration changes.
- No new admin screens. Admin styling stays as-is (it's an internal tool).
- New nav items ("Recently Viewed", "Styling Inspiration", etc.) link to existing routes/anchors only. If you want them as real new pages with their own content, that's a follow-up.
- Product photography itself isn't changed — we only change cropping, framing, and loading polish around the existing images.

---

## How I'd like to proceed

I'll build **Phase 1 first** and stop, so you can see the warmer foundation before I touch layouts. If it feels right, I'll continue straight into Phase 2, then 3, then 4 — each as its own visible step.

Want me to start with Phase 1 now, or would you rather I batch Phase 1 + 2 together so the homepage transformation is visible in one go?

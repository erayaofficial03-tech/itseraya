# Fix logo visibility + add section separators

## Problem
- Header & footer use the ivory `--background` (`36 38% 97%`). The brand wordmark is gold/champagne, so it visually disappears against the warm cream.
- Homepage sections (Hero → Trust → Categories → Product rows → Emotional → Sale → Featured → ERAYA Girls → Reviews) all sit on the same ivory background with no visible boundary, so the page reads as one long blur.

## Fix

### 1. Header — dark warm-charcoal bar
- In `src/components/header/Header.tsx`, change the `<header>` wrapper from `bg-background` to `bg-[hsl(var(--ink))]` (warm charcoal), and the bottom border to `border-[hsl(var(--ink-soft))]/40`.
- Switch all header text/icon colors to the ivory-on-dark variants:
  - Nav links: `text-ivory hover:text-champagne` instead of `text-foreground hover:text-gold`.
  - Hamburger, search, bag, wishlist, user icons: `text-ivory hover:text-champagne`.
- Use the existing `<BrandLogo onDark />` variant (already wired with a warm gold glow drop-shadow) instead of the plain `<img>` tag. This is what makes the wordmark legible on the dark bar.
- Update `AnnouncementBar` and `StatusBar` only if their colors clash (verify after the change — they already use dark surfaces, should be fine).

### 2. Footer — matching dark band
- In `src/components/footer/Footer.tsx`, both the mobile slim footer and the desktop footer:
  - Background: `bg-[hsl(var(--ink))]`.
  - Top border: `border-[hsl(var(--ink-soft))]/40`.
  - Copyright + link text: `text-ivory/70`, hover `text-champagne`.
  - Replace the `<img>` logo with `<BrandLogo onDark className="h-7 w-auto" />` (mobile) and `h-9` (desktop).
  - Social icon buttons: border `border-ivory/20`, hover `border-champagne text-champagne`.

### 3. Section separators on homepage
- Add a single reusable hairline divider utility in `src/index.css`:
  ```css
  .section-divider {
    @apply mx-auto max-w-7xl h-px bg-[hsl(var(--ink))]/8;
  }
  ```
  (8% warm-ink line on ivory — visible but whisper-soft, matches the luxury aesthetic.)
- In `src/pages/Index.tsx`, drop `<div className="section-divider" />` between each major section: after `HeroSlider`, `TrustStrip`, `CategoryRow`, each `ProductRow`, `EmotionalStrip`, `ErayaGirls`, and before `ReviewsSection`.

## Files touched
- `src/components/header/Header.tsx` — header bg + icon/text colors + `BrandLogo onDark`.
- `src/components/footer/Footer.tsx` — both footer variants → dark bg + `BrandLogo onDark`.
- `src/index.css` — add `.section-divider` utility.
- `src/pages/Index.tsx` — insert dividers between sections.

## Not touched
- Color tokens, fonts, product cards, hero, mobile bottom nav — all stay as-is.
- Backend, queries, settings schema — untouched.

Reply **"go"** to implement.
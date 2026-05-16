# Status bar — guarantee high contrast on any background

The status bar sits above the header on every page (storefront + admin). Today it hard-codes `bg-[hsl(var(--ink))]` and ivory text, which works against the new dark header but would wash out if the bar background ever changes (admin theming, future banners, settings-driven tinting).

## Goal

Lock the status bar to AA contrast no matter what tone sits behind it: dark ink, warm ivory, blush, champagne, or an admin-uploaded color.

## Approach

- **Pin both layers together.** Keep the bar's own surface fixed at `--ink` (warm charcoal) and the text fixed at `--ivory` at full opacity — no `/NN` opacity modifiers on the foreground. This guarantees ~14:1 contrast, well above WCAG AA, on any page.
- **Remove low-opacity tokens.** Audit the file for any `text-…/20`, `/40`, `/55` etc. on the announcement line and replace with solid `text-[hsl(var(--ivory))]`. Border can keep `/15` (decorative hairline, not text).
- **Add a subtle text shadow** (`0 1px 0 hsl(var(--ink) / 0.6)`) so if a future tint ever leaks through (e.g., translucent header), the glyphs still read crisply.
- **Future-proofing token.** Introduce two semantic tokens in `index.css`:
  - `--status-bar: var(--ink);`
  - `--status-bar-foreground: var(--ivory);`
  
  Then the component reads `bg-[hsl(var(--status-bar))] text-[hsl(var(--status-bar-foreground))]`. Any later theme change updates one place and contrast stays paired. (Tokens already exist on lines 17–18 of `index.css` — wire them up instead of re-declaring.)

## Files

```text
src/index.css                       — confirm/keep --status-bar + --status-bar-foreground tokens
src/components/header/StatusBar.tsx — swap hard-coded ink/ivory for the two tokens,
                                      drop any low-opacity text, add tiny text-shadow
```

## Verification

- Visually check the bar on `/` (dark header), `/admin` (ivory main), and `/admin/profile` after the new admin theme.
- Confirm at 320px width (smallest viewport) the text stays legible and isn't clipped.

## Out of scope

- No copy changes, no animation changes, no admin setting to recolor the bar.

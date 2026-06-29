## Refined Gold — Surgical Color Pass

Goal: stop gold overload. Reserve gold for prices, the primary Add to Cart action, the cart badge, and the BottomNav search/active focal points. Everything else (Enquire, nav hover, avatar, drawer icons) goes charcoal/ivory. Bump `--champagne-deep` so text gold finally passes WCAG AA on ivory.

### Files touched (5)

**1. `src/index.css`**
- Line 64: `--champagne-deep: 36 45% 44%;` → `36 48% 32%;` (darker, AA-compliant for small text on ivory). `--champagne` itself unchanged so all `bg-gold` buttons keep current hue.
- Lines 147–152 `.price-now`: confirmed already uses `hsl(var(--ink))` — change `color` to `hsl(var(--champagne-deep))` so price text uses the accessible deep variant.

**2. `src/pages/ProductDetail.tsx`**
- Line 359 (main price): `text-[#C9A84C]` → `text-champagne-deep`.
- Line 480 (Enquire Now button — spec said ~448, actually 480): `border-gold text-charcoal hover:bg-gold/10` → `border-border text-charcoal hover:bg-muted`.
- Line 489 (Add to Cart): leave `bg-gold text-charcoal hover:bg-gold/90 font-medium` unchanged.
- Line 607 (sticky mobile Enquire): `border-2 border-[#C9A84C] text-[#C9A84C]` → `border-2 border-charcoal text-charcoal`.
- Line 614 (sticky mobile Add to Cart): leave `bg-[#C9A84C] text-white` unchanged.

Not touched here: line 307 (image thumb border), 333 (label pill), 414/439 (variant pickers), 529 (avg-rating numeral), 589 (login link). Spec lists Enquire + Add to Cart + sticky bar only; rest stay.

**3. `src/components/header/BottomNav.tsx`**
- Line 113: `const active = 'text-[#C9A84C]';` → `const active = 'text-charcoal';`.
- Line 257 (Avatar wrapper): `border border-[#C9A84C]` → `border border-ink/30`.
- Line 261 (AvatarFallback): `bg-[#C9A84C] text-white` → `bg-ink text-ivory`.
- Lines 145, 167, 193, 213, 253 (top indicator bars + search circle): keep gold — these are the brand focal points the spec preserves.

**4. `src/components/header/Header.tsx`**
- Line 65 (nav link active/hover): `text-ivory hover:text-[hsl(var(--champagne))]` → `text-ivory hover:text-ivory/80`. The active branch `text-[hsl(var(--champagne))]` also softens to `text-ivory` so nav doesn't flip to gold.
- Line 86 (drawer link hover): `hover:text-[hsl(var(--champagne))]` → `hover:text-ivory/80`.
- Line 295 (medium-breakpoint nav button): `hover:text-[hsl(var(--champagne))]` → `hover:text-ivory/80`.
- Line 303 (Sparkles icon): `text-gold` → `text-ivory/70`.
- Line 324 (MessageCircle icon): `text-gold` → `text-ivory/70`.
- Line 328 (Shield icon): `text-gold` → `text-ivory/70`.
- Line 341 (desktop nav link): `hover:text-[hsl(var(--champagne))]` → `hover:text-ivory/80`.
- Line 428 (cart badge): leave `bg-[#C9A84C] text-white` unchanged.
- Lines 127/179/181/199/236 (drawer section labels and pinned user card): leave gold — they're typographic accents, not nav state. Spec only lists the three icons + nav hovers.

**5. `src/pages/Checkout.tsx`**
- Line 440 (price span): `text-[#C9A84C]` → `text-champagne-deep`.
- Line 548 (Pay ₹ amount): `font-bold text-[#C9A84C]` → `font-bold text-champagne-deep`.
- Line 343 is a non-price helper label ("Pay via…"), not a price. Spec said "wherever text-[#C9A84C] appears on price text" — leaving 343 as gold to honour that qualifier. If you'd rather neutralise it too, say so and I'll swap it.
- Lines 323, 357, 527, 581, 636 (selected-payment chip, progress fill, primary CTA, upload border, second CTA): unchanged — these are primary actions and progress states, not price text.

### Not changed (per spec)
- `src/lib/settingsDefaults.ts` `color_primary` stays `#C9A84C`.
- Admin panel, WhatsApp float, star ratings, wishlist heart, all bottom-nav focal points, header cart badge, Add to Cart bg.

### Verification
1. `npx tsc --noEmit` — must be 0 errors.
2. `grep -n "price-now\|champagne-deep" src/index.css` — `.price-now` should reference `--champagne-deep`; deep token should read `36 48% 32%`.
3. `grep -n "Enquire" src/pages/ProductDetail.tsx | grep -iE "gold|C9A84C|champagne"` — should return nothing.
4. `grep -n "AvatarFallback\|border-\[#C9A84C\]" src/components/header/BottomNav.tsx` — Avatar lines should show `bg-ink` and `border-ink/30`; only the search circle + indicator bars retain `bg-[#C9A84C]`.

I'll report every line touched with before/after after implementing.

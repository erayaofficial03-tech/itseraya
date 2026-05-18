
## Goal

Add an **Auto Price Calculator** inside the admin Product edit dialog that:
- Takes a single input — **Purchase Price** (₹) — entered by admin
- Auto-computes **Product Cost**, **Min Sell Price** and **MRP** from configurable components
- Writes the result into the product's price fields: **MRP → `original_price`** (locked) and **Min Sell Price → `discounted_price`** (editable override)
- Pulls all component line-items from a new admin settings page so admin can add/remove/edit rows without code changes

## What admin sees

### 1. Product edit dialog (`ProductsAdmin.tsx`) — new "Pricing" panel
Inserted above the existing Original / Discounted price fields.

```text
┌──────────────────────────────────────────────────────────────┐
│  Auto Price Calculator                       [Use calculator]│
│  Purchase Price >          [ ₹ 40        ]                   │
│                                                              │
│  Packing BOM                                                 │
│    Jewellery Card           ₹ 5     →  running ₹ 45          │
│    Zip Pouch / Box          ₹ 10    →  running ₹ 55          │
│    Thank You Card           ₹ 4     →  running ₹ 59          │
│                                                              │
│  Buffer Margins                                              │
│    RTO / Return Risk %      10%     →  running ₹ 65          │
│    Gateway Fees %           3%      →  running ₹ 67          │
│    Marketing Cost %         5%      →  running ₹ 70          │
│                                                              │
│  Shipping Charges (avg)               ₹ 95                   │
│                                                              │
│  ─────────────────────────────────                           │
│  Product Cost               ₹ 70                             │
│  Min Sell Price (cost × 2)  ₹ 140    ← writes discounted     │
│  MRP ((cost+ship) × 2)      ₹ 330    ← writes original (lock)│
└──────────────────────────────────────────────────────────────┘
[ Apply to product ]
```

Behaviour:
- Toggle **Use calculator** — when ON, MRP field is locked to the computed value; **Min Sell Price** field is pre-filled but admin can override (manual edit wins).
- When OFF, both price fields behave as today (manual entry).
- Calculator block is only rendered for admins (route is already admin-gated).

### 2. Pricing Components page (new) — `/admin/pricing`
A dedicated settings page (sidebar entry under Settings) with three editable sections + one shipping rule. Admin can add / remove / reorder rows.

| Section | Row fields | Type |
|---|---|---|
| Packing BOM | label, amount (₹) | flat add |
| Buffer Margins | label, percent (%) | compounds on running total |
| Shipping Charges | label, amount (₹) | flat add (averaged into "Average Shipping") |
| Sell-price multiplier | number (default 2.0) | single value |
| MRP multiplier | number (default 2.0) | single value |
| Free-shipping minimum order | amount (₹) | single value |

The free-shipping minimum is read by Checkout: if `subtotal >= threshold` then shipping = 0; otherwise shipping = configured flat shipping cost.

## Calculation formula (matches reference image)

```text
running = purchase_price
for each Packing BOM row:        running += row.amount
for each Buffer Margin row:      running *= (1 + row.percent/100)

product_cost      = round(running)
min_sell_price    = round(product_cost * sell_multiplier)            // default ×2
mrp               = round((product_cost + avg_shipping) * mrp_multiplier) // default ×2
```

`avg_shipping` = sum of all Shipping Charges rows divided by their count (mirrors "Average Shipping ₹65" in reference).

## Technical section

### DB migration
Two new tables + one row in existing `settings`:

```sql
-- ordered, editable component rows
CREATE TABLE public.pricing_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL CHECK (section IN ('packing_bom','buffer_margin','shipping_charge')),
  label   text NOT NULL,
  amount  numeric NOT NULL DEFAULT 0,   -- ₹ for flat, % for buffer rows
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pricing_components ENABLE ROW LEVEL SECURITY;
-- public read (already pattern for settings); admin/manager write via has_role()
```

Seed with the rows from the reference image so the calculator works on day one.

Add settings keys (reuse existing key/value `settings` table):
- `pricing_sell_multiplier` (default `2`)
- `pricing_mrp_multiplier` (default `2`)
- `shipping_free_min_order` (default `999`)
- `shipping_flat_cost` (default `95`)

### Frontend changes (scoped)

| File | Change |
|---|---|
| `src/pages/admin/ProductsAdmin.tsx` | Add `<PriceCalculator>` block inside `ProductForm`; on Apply, write `original_price` (MRP) and `discounted_price` (sell). Lock `original_price` input when calculator toggle is on. |
| `src/components/admin/PriceCalculator.tsx` *(new)* | Pure presentational + calc logic; reads pricing components via React Query. |
| `src/pages/admin/PricingAdmin.tsx` *(new)* | CRUD UI for the three sections + multipliers + free-shipping fields. |
| `src/pages/admin/AdminLayout.tsx` | Add "Pricing" nav entry. |
| `src/App.tsx` | Register `/admin/pricing` route. |
| `src/lib/queries.ts` | Add `usePricingComponents()` and helper `computeAutoPrice(purchase, components, multipliers)`. |
| `src/pages/Checkout.tsx` | Read `shipping_free_min_order` + `shipping_flat_cost`; replace hard-coded `0` standard-shipping branch. |

### What stays the same
- Existing `products.original_price` / `discounted_price` columns — no schema change to products.
- Manual entry still works when calculator toggle is off.
- All existing storefront pricing reads (`formatINR`, product cards) unchanged.
- Enquiry / WhatsApp flow untouched.

## Open question (will ask before coding if unclear)

The reference image computes `MRP = (cost + shipping) × 2 = ₹330` but labels it "₹ 330". Confirming the **MRP rounding rule** — round to nearest ₹10 like the example, or exact? Default plan: round to nearest ₹10 for MRP, exact ₹1 for Min Sell Price (matches the reference numbers 140 and 330).

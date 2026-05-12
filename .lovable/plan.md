## Goal
Auto-generate a unique SKU for every product in the format `ERY/YY/NNN`, where:
- `YY` = 2-digit year of when the product is created (IST), e.g. `26` for 2026.
- `NNN` = zero-padded sequence that **resets to `001` on 1 Jan each year**, scoped per-year (so 2026 starts at `001` regardless of 2025 totals).
- Existing 12 products without a SKU get backfilled in `created_at` order, grouped by their creation year.
- The SKU is shown in the admin product list and on the public product detail page (replacing the hard-coded `LE-PTH-001`).

## Database changes (single migration)

1. **Add column**
   - `products.sku TEXT` — nullable initially so the backfill can populate it, then set `NOT NULL` + `UNIQUE`.

2. **Sequence helper**
   - Create function `public.next_product_sku()` that:
     - Reads the current year in IST (`(now() AT TIME ZONE 'Asia/Kolkata')`).
     - Finds the max existing `NNN` for that year by scanning `products.sku LIKE 'ERY/<yy>/%'` and returns `MAX(substring) + 1`, padded to 3 digits (auto-widens past 999 — `LPAD(n::text, 3, '0')` keeps width but doesn't truncate).
     - Returns `'ERY/' || yy || '/' || padded`.
   - Concurrency-safe via `LOCK TABLE public.products IN SHARE ROW EXCLUSIVE MODE` inside the function so two simultaneous inserts can't collide. (Acceptable for an admin-only insert path.)

3. **Trigger**
   - `BEFORE INSERT ON public.products` — if `NEW.sku IS NULL OR NEW.sku = ''`, set `NEW.sku := public.next_product_sku()` using `NEW.created_at`'s year (so manual back-dated inserts honor the year).

4. **Backfill**
   - One-time SQL inside the migration:
     - `UPDATE products` ordered by `(created_at, id)` partitioned by `EXTRACT(year FROM created_at AT TIME ZONE 'Asia/Kolkata')`, assigning `ERY/<yy>/<row_number>` only where `sku IS NULL`.

5. **Lock it down**
   - `ALTER TABLE products ALTER COLUMN sku SET NOT NULL;`
   - `CREATE UNIQUE INDEX products_sku_key ON products(sku);`

RLS already covers the table; no policy changes needed (admins manage; public reads visible).

## Frontend changes (after migration is approved)

1. **`src/lib/queries.ts`** — add `sku: string` to `Product` type.
2. **`src/pages/admin/ProductsAdmin.tsx`**
   - Show the SKU under the product name in the list (e.g. small mono caption `ERY/26/007`).
   - Do **not** add a SKU input to the form — it's auto-assigned on insert and immutable in the UI.
3. **`src/components/product/ProductDescription.tsx`**
   - Replace hard-coded `LE-PTH-001` with `{product.sku}`. Pass `product` through props if not already available (quick prop add).

## Out of scope
- No editing of existing SKUs from the UI (could be added later if needed).
- No format change once assigned — re-numbering is intentionally avoided to keep printed/shared SKUs stable.

## Verification
- After migration: `SELECT sku, name, created_at FROM products ORDER BY sku` shows `ERY/26/001`…`ERY/26/012`.
- Insert a new product → next SKU = `ERY/26/013`.
- A test insert with a future `created_at` in Jan 2027 (manual SQL) → restarts at `ERY/27/001`.

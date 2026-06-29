## Scope

Three fixes: WhatsApp number normalisation, two gold-text contrast tweaks in ProductDetail, and two new admin tools (QuickEditProductDrawer + ImageEditorSheet) plus a ProductCard staff mode.

---

### FIX 1 — `src/lib/whatsapp.ts`

Update `buildWhatsAppUrl` (line 46-50) to normalise the cleaned digits:

- strip non-digits → `cleaned`
- if `cleaned.length === 10` → prepend `91`
- if `cleaned.length === 12` and starts with `91` → leave as-is
- otherwise leave unchanged
- build `https://wa.me/{normalised}?text=...`

Single function change; all call sites (float, product card, enquiry drawer, product detail, order notifications) inherit the fix.

---

### FIX 2 — `src/pages/ProductDetail.tsx`

- Line 529: `text-[#C9A84C]` → `text-champagne-deep` (star rating average)
- Line 589: `text-[#C9A84C]` → `text-champagne-deep` (sign-in to review link)
- Leave line 370 (discount badge bg) and line 614 (mobile sticky cart) untouched.

---

### FIX 3a — Quick Edit Product Drawer

**New file** `src/components/admin/QuickEditProductDrawer.tsx`:
- Sheet (right side) that listens for `window` event `eraya:quick-edit-product` with `{ productId }`.
- On open: fetch product from `products` table.
- Fields: name, original_price, discounted_price, description, is_visible, is_featured, is_new.
- Save → `update` to `products`, invalidate `['products']`, toast, close.
- "Full edit in Admin →" link → `/admin/products`.
- Cancel closes.

**Mount in** `src/App.tsx` next to `WhatsAppFallbackDialog`, gated by `isStaff` (use `useUserRole` / existing staff hook already used elsewhere).

**Edit** `src/components/eraya/ProductCard.tsx`:
- Read `isStaff` from existing role hook.
- When `isStaff === true`:
  - Replace Heart button with a Pencil button that dispatches `eraya:quick-edit-product` with product id.
  - Replace Plus button with Eye / EyeOff toggle that updates `products.is_visible` directly and invalidates `['products']`.
  - Render a "Hidden" overlay on the card image when `is_visible === false`.
- When `isStaff === false`: existing Heart + Plus untouched — customer UX identical.

---

### FIX 3b — Image Editor Sheet

- Install dep: `react-image-crop`.

**New file** `src/components/admin/ImageEditorSheet.tsx`:
- Bottom Sheet. Props: `file: File | null`, `open`, `onConfirm(blob, filename)`, `onCancel`, `aspectRatio?`.
- ReactCrop overlay on the image.
- Sliders: Brightness, Contrast, Saturation, Sharpness (0–200, default 100). Applied live via CSS `filter`. Sharpness implemented as `contrast()` multiplier proxy on preview, then convolution on canvas export.
- Reset (all → 100), Rotate (90° CW), Done.
- Done: draws to offscreen canvas applying crop + rotation + brightness/contrast/saturate + sharpen convolution, exports `image/webp` quality 0.85, returns Blob via `onConfirm`. Filename = original name with `.webp` extension.

**New file** `src/components/admin/ImageUploadWithEditor.tsx`:
- Props: `onUploaded(url)`, `bucket`, `pathPrefix`, `aspectRatio?`, `children?` (trigger).
- Renders a hidden `<input type="file">` + trigger.
- On file pick → open ImageEditorSheet → on confirm upload edited Blob to storage bucket → call `onUploaded`.

**Wire it in** (replace current raw `<input type="file">` upload pattern, preserve existing bucket + path logic):
- `src/pages/admin/BannersAdmin.tsx`
- `src/pages/admin/CategoriesAdmin.tsx`
- `src/pages/admin/BrandAdmin.tsx`
- `src/pages/admin/ProductsAdmin.tsx`

---

### Verify

- `npx tsgo --noEmit` → 0 errors.
- Run the verification grep block from the spec.
- Confirm: WA URL contains 91 prefix logic; ProductDetail uses `text-champagne-deep` on lines 529/589; both new admin files exist; ProductCard references `isStaff` / `Pencil` / `quick-edit`.

---

### Files

**Modified**
- `src/lib/whatsapp.ts`
- `src/pages/ProductDetail.tsx`
- `src/components/eraya/ProductCard.tsx`
- `src/App.tsx`
- `src/pages/admin/BannersAdmin.tsx`
- `src/pages/admin/CategoriesAdmin.tsx`
- `src/pages/admin/BrandAdmin.tsx`
- `src/pages/admin/ProductsAdmin.tsx`
- `package.json` (via install)

**Created**
- `src/components/admin/QuickEditProductDrawer.tsx`
- `src/components/admin/ImageEditorSheet.tsx`
- `src/components/admin/ImageUploadWithEditor.tsx`

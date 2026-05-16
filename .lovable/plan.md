## Goal

Turn the storefront into a **fully content-managed app** so admins can change colors, fonts, sizes, sections, announcements, theme presets, and copy — without ever editing code.

Today ~85% of the storefront is admin-editable. This plan closes the remaining gaps and adds a true visual/theming + section-builder layer.

---

## What admins will be able to do after this work

1. **Theme & Design System**
   - Pick from preset theme combinations (e.g. "Ivory & Gold", "Noir & Champagne", "Blush & Sage") or build a custom palette
   - Edit every color token (background, ink, ivory, gold, champagne, accent, muted, destructive…)
   - Choose heading/body font from a curated Google Fonts list, or upload custom WOFF2
   - Tune global font sizes, base radius, container width, section spacing
   - Live preview before saving

2. **Page Builder (Homepage + any landing page)**
   - Add / remove / reorder sections via drag-and-drop
   - Section types: Hero Slider, Category Row, Product Row (by tag/category/manual), Banner, Editorial 50/50, 1/3+2/3, Large Hero, Image+Text, Emotional Strip, Trust Strip, Reviews, Eraya Girls, Custom HTML, Spacer
   - Per-section settings (title, subtitle, source query, layout, padding, background)
   - Show/hide per breakpoint (mobile/tablet/desktop)

3. **Static Pages CMS**
   - Edit FAQ, Care Guide, Contact, About sub-pages (Our Story, Size Guide, Sustainability, Store Locator, Customer Care)
   - Rich-text editor (TipTap) with images, headings, lists, links
   - Create brand-new pages with custom slug + auto-routing

4. **Announcements** — already exists, will add scheduling preview and per-page targeting

5. **Navigation Builder**
   - Reorder header/footer/bottom-nav links
   - Add custom links to any internal page or external URL
   - Per-link visibility (mobile/desktop, logged-in only)

6. **Social Links Admin** — surface the existing `social_links` table

7. **Footer Builder** — column titles, links, copyright, social toggles

---

## Technical Plan

### Phase 1 — Theme Engine (foundation)

**DB:** new `theme_presets` table (name, tokens JSON, is_active) + extend `settings` with `active_theme_id`, `font_heading`, `font_body`, `font_heading_url`, `font_body_url`, `radius_base`, `container_max`, `section_spacing`.

**Frontend:** `BrandProvider` reads active theme + injects CSS variables into `:root` at runtime (already does colors — extend to fonts/radius/spacing). Add `@font-face` injection for custom font URLs.

**Admin:** rebuild `/admin/brand` as a **Theme Studio** with:
- Preset gallery (4–6 curated palettes seeded)
- Token editor (grouped: Surfaces / Text / Accents / States)
- Typography panel (font picker + size scale)
- Live preview pane on the right showing a sample product card + button + heading

### Phase 2 — Page Builder

**DB:** new tables
- `pages` (id, slug, title, is_published, seo fields)
- `page_sections` (id, page_id, type, props JSONB, display_order, visible_mobile, visible_desktop)

Seed: a `home` page with the current 10 sections converted to rows.

**Frontend:** new `<SectionRenderer type props />` switch component that maps `type` → existing component (`HeroSlider`, `CategoryRow`, `ProductRow`, etc.). `Index.tsx` becomes: fetch `home` page → render sections in order.

**Admin:** `/admin/pages` list + `/admin/pages/:id` editor with:
- `@dnd-kit/sortable` drag-to-reorder
- "Add section" picker (modal with section type cards)
- Per-section settings form rendered by type
- Save = update `page_sections` rows

### Phase 3 — Static Pages CMS

Reuse `pages` + `page_sections` from Phase 2 with a `RichText` section type using **TipTap** editor. Migrate FAQ/Care/Contact/About content into DB rows. Routes become dynamic: `/p/:slug` + keep legacy redirects.

### Phase 4 — Navigation + Footer + Social

**DB:** new `nav_items` table (id, location ['header'|'footer'|'bottom'|'footer_col_1'…], label, url, display_order, visible_mobile, visible_desktop, requires_auth).

**Admin:** `/admin/navigation` with drag-to-reorder per location. Surface existing `social_links` in `/admin/social`.

### Phase 5 — Polish

- Section presets ("Hero + 3 product rows + reviews") one-click templates
- Theme import/export as JSON
- Undo last save (keep last 5 versions of theme + page in `*_history` tables)
- In-admin live preview iframe

---

## Stack additions

- `@dnd-kit/core` + `@dnd-kit/sortable` — drag-and-drop
- `@tiptap/react` + starter-kit + image/link extensions — rich text
- All other work uses existing stack (shadcn, react-query, Supabase)

---

## Scope & sequencing

Each phase is independently shippable. I recommend starting with **Phase 1 (Theme Engine)** since it's the highest leverage and unblocks all visual customization immediately. Phase 2 (Page Builder) is the largest piece.

```text
Phase 1  Theme Engine          ~  small
Phase 2  Page Builder          ~  large  ← biggest unlock
Phase 3  Static Pages CMS      ~  medium
Phase 4  Nav + Footer + Social ~  small
Phase 5  Polish                ~  small
```

---

## Question before I start

Do you want me to **build all 5 phases in sequence** (one big rollout, takes several iterations), or **ship Phase 1 first** so you can use the Theme Engine immediately while I plan Phase 2 in detail?

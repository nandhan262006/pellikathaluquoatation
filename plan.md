# Plan: 8-Page Wedding Photography Quotation — "Pelli Kathalu" (Admin Invoice Builder)

## Goal

Replicate the 8-page premium botanical wedding quotation (`public/reference.jpeg` — 8
separate A4 portrait panels, one per page) as a real, dynamically editable quotation
document inside the existing Next.js project, exposed in the Admin area via a
"Get Invoice" full-screen popup (live preview left, edit tables right), with
persistence to the database and a working Print / Save-as-PDF flow.

Reference image = source of truth. Reproduce visual identity, page proportions,
ornaments, typography hierarchy, table styles, colors, margins, spacing, footers —
while supporting real dynamic quotation data.

## 1. Verified Project State

- Framework: Next.js 16 (App Router, Turbopack), React 19, Tailwind 4, Drizzle ORM
  (libsql/Turso), next-auth v5 beta, shadcn/ui primitives, lucide-react.
- Existing client-facing estimator + short PDF (`@react-pdf/renderer`) stays untouched.
- Admin estimates page: `src/app/admin/(dashboard)/estimates/page.tsx` with inline
  `EstimateDetail` expander (to be replaced by the Get Invoice button).
- Fonts in use: Geist / Geist Mono (root layout).

## 2. Asset Map (verified — exact paths, no invented files)

| Asset | Dims | Content | Use |
|---|---|---|---|
| `public/firstborder.png` | 1024×1536 | Gold arch + florals both sides + bottom lotus | Page 01 cover |
| `public/borderfirst.png` | 1024×1536 | Gold arch + lotus, no florals | Page 08 arch |
| `public/borderlastpage.png` | 1536×1024 | Top gold arch (landscape) | Page 08 top arch |
| `public/logo.png` | 1226×195 | "PELLI KATHALU — Prem & Pavan" wordmark | Cover, footers |
| `public/flowerleft.png` / `flowerright.png` | ~1000×1600 | Tall lotus stem branches (L/R) | P02, cover sides |
| `public/flower2page.png` | 987×1594 | Botanical + gold vertical lines | Content-page edge |
| `public/flowerdownleft.png` | 1254×1254 | Watercolor branch | Corner accents (P05, P04) |
| `public/flowerlastdown.png` | 2172×724 | Wide botanical strip, central lotus | Bottom strip (P06…) |
| `public/flowerlastpage.png` | 2007×783 | Wide botanical, big central lotus | Page 08 bottom |
| `public/leaflong.png` / `leafsmall.png` | ~990×1586 | Leaf branches | Small accents |
| `public/reference.jpeg` | 1280×1169 | The 8-page reference | Source of truth |

No icon PNGs exist → all icons (camera, video, music, rings, plane, card, %, calendar,
drone, phone, mail, pin, etc.) are thin-stroke inline SVGs tinted gold/green.
No emoji. Preserve PNG transparency and aspect ratios (no stretching).

## 3. Design System

- Pages: A4 portrait, 210×297 mm (built at 794×1123 px @96dpi for exact print mapping).
- Palette: paper #F5EFE3, secondary paper #EEE5D6, forest green #254D38,
  sage #87977A, antique gold #B58A50, peach #D89A7E, text #28251F,
  hairline borders #C7B99F.
- Typography: Cormorant Garamond (headings, next/font/google) + Lora (body);
  uppercase letterspaced page labels; italic serif accent words (Relive, Story,
  Legacy, Together, client name).
- Every page: thin warm-gold border, "NN" page number upper-left, uppercase
  section label upper-right, footer "PELLI KATHALU ❀ lotus ❀ PREM & PAVAN"
  (contact page footer: "PEOPLE | RITUALS | RELATIONSHIPS | TIMELESS STORIES").
- Subtle ivory paper texture. No shadows/glassmorphism/gradients/dashboard cards.
- Note: reference panels are ~1:1.82; final pages use true A4 (1:1.414) per spec —
  spacing adapted, composition preserved.

## 4. Pages (order fixed)

1. **01 COVER** — border, gold arch, florals, forest-green circle
   ("weddings by / Pelli Kathalu / PREM & PAVAN"), "WEDDING PHOTOGRAPHY QUOTATION",
   corner word-stacks (PEOPLE/EMOTIONS/RITUALS/TIMELESS/STORIES and
   MORE THAN PHOTOS/A LEGACY OF LOVE), gold lotus bottom.
2. **02 ABOUT US** — "Our Story" heading, editorial paragraphs, botanical right
   side with arch, ornament divider.
3. **03 OUR PLAN** — "Dear, {ClientName}" greeting, intro paragraph, "THE TEAM",
   event schedule table (icon | event | date | team allocation), rows: Haldi,
   Sangeeth, Pellikuthuru, Mehendi, Pellikoduku, Wedding & Reception — data-driven,
   subtle cell backgrounds, fine separators.
4. **04 DELIVERABLES** — "Moments to Relive", Photos/Videos two columns with icons,
   CHARGES pricing panel (Photography Service row + forest-green TOTAL row, ivory
   text, amount in words), exclusions note, botanical corner.
5. **05 ADD ONS** — "Enhance Your Story", intro line, 3-column table
   SERVICE (54%) / PRICE (28%) / INCLUDED (18%), forest-green header row,
   per-service icon, fine warm borders. Fully data-driven (no hardcoded rows).
6. **06 DELIVERY TIMELINE** — "From Our Lens to Your Legacy", OUTPUT/TIMELINE/
   REVISIONS table (Quick Edits, Edited Photos, Event Teaser/Reels, Full-Length
   Videos), calendar info panel, botanical bottom.
7. **07 TERMS & CONDITIONS** — circular thin-border icon list: travel &
   accommodation, payments, GST, change of plans, non-refundable advance, drone
   usage (all text editable).
8. **08 CONTACT** — gold arch + cover florals, "Let's Create Timeless Stories
   *Together*", ornament divider, phone/email/location rows with icons, large
   bottom botanical.

## 5. Page 05 Dynamic Rules (critical)

- Services = editable array `{ id, name, description, price, included, icon, unit, category }`.
- Rows generated by iteration; icons map to inline SVGs by key, restrained text
  fallback otherwise (no emoji).
- Case A (1–6): reference layout, generous whitespace, decorations in place.
- Case B (7–12): reduce top whitespace, tighten intro gap and row padding, keep
  readable sizes, same header/borders.
- Case C (13–20+): auto-generate continuation pages — "Enhance Your Story —
  Continued", repeated green column header, same 3-col widths, order preserved,
  nothing clipped or hidden. Content-aware pagination (row never split; rows never
  collide with footer/florals; if a full row doesn't fit, it moves to the next page).
  Document length grows 8 → 9, 10, … automatically.
- No fixed-height table that cuts services.

## 6. Data & Editing

- `src/lib/quote/types.ts` — `QuotationData`: clientName, quoteNumber, date,
  eventDate, studio names, contact details, events[] (name/date/team),
  deliverables (photos/videos text), base pricing, services[], terms[],
  timeline rows, editable static-page copy.
- `src/lib/quote/prefill.ts` — builds QuotationData from the lead's saved
  `estimateData` (client, event type, sub-events, estimate items, deliverables,
  market-aware currency via existing `formatMoney`), sensible defaults elsewhere.
  Single source of truth — no duplicated service data.
- Persistence: new `quotationData` TEXT column on `EstimateLead` (drizzle-kit push),
  server actions in `src/lib/admin/quote-actions.ts` (load/save).

## 7. Admin UX

- Estimates table: `EstimateDetail` expander replaced by a **Get Invoice** button
  per row → full-screen overlay:
  - Left: live A4 preview — all pages stacked (zoom + scroll), instant updates.
  - Right: edit panels — client details, event schedule table, deliverables,
    pricing, services table (add/remove/edit name/price/included/unit), terms,
    static copy.
  - Actions: Save (DB), Print / Save as PDF.
- Print flow: browser print with `@page { size: A4 portrait; margin: 0 }`;
  print CSS hides all editing UI/navigation; `break-inside: avoid` on rows;
  borders/footers kept within printable area; background colors/images preserved
  via `print-color-adjust: exact`. No blank pages. Existing @react-pdf/renderer
  mechanism is NOT suitable for this editorial layout — we use the browser print
  flow and do not claim any new PDF library integration.

## 8. File Plan

```
src/lib/quote/types.ts            # QuotationData types
src/lib/quote/prefill.ts          # lead estimateData → QuotationData
src/lib/quote/paginate.ts         # service-row chunking for Page 05 continuation
src/lib/admin/quote-actions.ts    # load/save server actions
src/components/quote/page-shell.tsx      # A4 shell, border, header, footer, ornaments
src/components/quote/icons.tsx           # inline SVG icon set
src/components/quote/dividers.tsx        # lotus/ornament dividers
src/components/quote/pricing-table.tsx   # reusable pricing table
src/components/quote/pages/{cover,about,plan,deliverables,addons,timeline,terms,contact}.tsx
src/components/quote/quotation-document.tsx  # assembles pages + continuation pages
src/components/quote/print.css
src/components/admin/quotation-dialog.tsx    # full-screen overlay
src/components/admin/quote-editor.tsx        # right-side edit tables
```

Root layout: add Cormorant_Garamond + Lora (next/font/google), scoped variables.

## 9. Verification

- Run dev server; screenshot every page and compare against `reference.jpeg`.
- Page 05 with 3, 6, 10, 15, 25 services: each service exactly once, correct
  order/price; continuation headers repeat; no row split/overlap/clipping.
- Desktop, narrow viewport, and A4 print layout checks (no blank pages, editors
  hidden in print).
- `npm run lint`, `npx tsc --noEmit`, `npm run build`.
- Fix broken assets, overflow, pagination and visual inconsistencies.

## 10. Acceptance Criteria

- Close visual replication of all 8 reference pages using existing public assets.
- Page 05 supports any service count via automatic, visually identical
  continuation pages.
- All listed data fields editable in the admin popup; edits persist to DB;
  Print/Save-as-PDF produces one A4 sheet per page, matching the preview.

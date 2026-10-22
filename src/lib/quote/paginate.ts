/**
 * Content-aware pagination for the Page 05 add-ons table.
 *
 * The document is laid out at a fixed px scale (794 x 1123 = A4 @96dpi), so row
 * heights are deterministic. This module decides which services go on the first
 * add-ons page and which spill onto continuation pages, based on the selected
 * density mode:
 *
 *   roomy   (~1-6 services)  : reference layout, generous whitespace
 *   tight   (~7-12)          : reduced heading block, slightly tighter rows
 *   compact (13+)            : efficient use of height + continuation pages
 */
import type {
  QuoteCharge,
  QuoteEvent,
  QuoteService,
  QuoteTerm,
  QuoteTimelineRow,
} from "./types";

export type AddonDensity = "roomy" | "tight" | "compact";

export interface AddonPage {
  /** Services on this page, original order preserved. */
  services: QuoteService[];
  /** True for continuation pages ("Enhance Your Story — Continued"). */
  continued: boolean;
  /** Index of this page within the add-on section (0-based). */
  index: number;
}

export const ADDON_PAGE_HEADER_H = 48;
export const ADDON_TABLE_HEADER_H = 36;
/**
 * Bottom band every add-on page keeps clear: footer (~150px) plus the
 * Saptapadi artwork zone anchored above it (~200px tall + margin).
 */
export const ADDON_FOOTER_ZONE_H = 270;

interface DensitySpec {
  rowH: number;
  /** Vertical space consumed by the heading + intro block on page 1. */
  headingH: number;
  /** Extra breathing room reserved above the footer on page 1. */
  firstPad: number;
  /** Vertical space consumed by the "— Continued" heading on later pages. */
  continuedHeadingH: number;
  /** Extra breathing room reserved above the footer on continuation pages. */
  continuedPad: number;
}

const DENSITY: Record<AddonDensity, DensitySpec> = {
  roomy: { rowH: 52, headingH: 300, firstPad: 120, continuedHeadingH: 110, continuedPad: 100 },
  tight: { rowH: 46, headingH: 230, firstPad: 100, continuedHeadingH: 100, continuedPad: 90 },
  compact: { rowH: 40, headingH: 190, firstPad: 90, continuedHeadingH: 96, continuedPad: 80 },
};

const PAGE_H = 1123;

export function addonDensity(count: number): AddonDensity {
  if (count <= 6) return "roomy";
  if (count <= 12) return "tight";
  return "compact";
}

export function paginateAddons(services: QuoteService[]): AddonPage[] {
  if (services.length === 0) return [];
  const density = addonDensity(services.length);
  const spec = DENSITY[density];

  const firstCapacity = Math.max(
    1,
    Math.floor(
      (PAGE_H - ADDON_PAGE_HEADER_H - spec.headingH - ADDON_TABLE_HEADER_H - ADDON_FOOTER_ZONE_H - spec.firstPad) /
        spec.rowH,
    ),
  );
  const continuedCapacity = Math.max(
    1,
    Math.floor(
      (PAGE_H -
        ADDON_PAGE_HEADER_H -
        spec.continuedHeadingH -
        ADDON_TABLE_HEADER_H -
        ADDON_FOOTER_ZONE_H -
        spec.continuedPad) /
        spec.rowH,
    ),
  );

  const pages: AddonPage[] = [];
  let remaining = services;
  let index = 0;

  while (remaining.length > 0) {
    const capacity = index === 0 ? firstCapacity : continuedCapacity;
    pages.push({ services: remaining.slice(0, capacity), continued: index > 0, index });
    remaining = remaining.slice(capacity);
    index += 1;
  }

  return pages;
}

export { DENSITY as ADDON_DENSITY };

/* ==========================================================================
   Shared section pagination (Plan / Deliverables / Timeline / Terms)
   Same deterministic-px model as the add-ons table, generalized so any
   section grows into "— Continued" pages instead of clipping.
   ========================================================================== */

/** Generic slice of one section: the rows on a page + position flags. */
export interface SectionPage<T> {
  /** Rows on this page, original order preserved. */
  items: T[];
  /** True for continuation pages ("— Continued"). */
  continued: boolean;
  /** Index of this page within the section (0-based). */
  index: number;
  /** True only on the section's final page, which carries its trailing block. */
  isLast: boolean;
}

interface SectionSpec {
  rowH: number;
  /** Fixed blocks above the rows on page 1 (headings, intro, ornaments). */
  headingH: number;
  /** Breathing room reserved above the artwork/footer on page 1. */
  firstPad: number;
  /** Fixed blocks above the rows on continuation pages ("— Continued" heading). */
  continuedHeadingH: number;
  continuedPad: number;
  /** Extra height reserved on the section's final page (TOTAL row, note panel). */
  lastReserve: number;
}

const SECTION_BODY_TOP = 78;
const SECTION_PAGE_H = 1123;

function sectionBodyH(bodyBottom: number): number {
  return SECTION_PAGE_H - SECTION_BODY_TOP - bodyBottom;
}

/**
 * Greedy row slicer. A row never splits across pages; when every remaining row
 * would fit, the page becomes the section's final page and budget shrinks by
 * `lastReserve` so the trailing block (TOTAL / note panel) never overflows.
 */
function paginateRows<T>(
  items: T[],
  spec: SectionSpec,
  available: number,
  height: (item: T) => number,
): SectionPage<T>[] {
  if (items.length === 0) {
    return [{ items: [], continued: false, index: 0, isLast: true }];
  }

  const pages: SectionPage<T>[] = [];
  let remaining = items;
  let index = 0;

  while (remaining.length > 0) {
    const fixed = index === 0 ? spec.headingH : spec.continuedHeadingH;
    const pad = index === 0 ? spec.firstPad : spec.continuedPad;
    let budget = available - fixed - pad;

    if (remaining.reduce((sum, it) => sum + height(it), 0) <= budget) {
      budget -= spec.lastReserve;
    }

    const page: T[] = [];
    let used = 0;
    let i = 0;
    while (i < remaining.length) {
      const h = height(remaining[i]);
      if (page.length > 0 && used + h > budget) break;
      page.push(remaining[i]);
      used += h;
      i += 1;
    }

    pages.push({
      items: page,
      continued: index > 0,
      index,
      isLast: remaining.length === page.length,
    });
    remaining = remaining.slice(page.length);
    index += 1;
  }

  return pages;
}

/* ---------------- Page 03 · Our Plan (event schedule) ---------------- */

/** Plan page keeps the drums artwork zone clear (bodyBottom 282). */
const PLAN_BODY = sectionBodyH(282);

const PLAN_SPEC: Record<AddonDensity, SectionSpec> = {
  roomy: { rowH: 48, headingH: 280, firstPad: 40, continuedHeadingH: 64, continuedPad: 40, lastReserve: 0 },
  tight: { rowH: 44, headingH: 280, firstPad: 24, continuedHeadingH: 64, continuedPad: 24, lastReserve: 0 },
  compact: { rowH: 38, headingH: 280, firstPad: 16, continuedHeadingH: 56, continuedPad: 16, lastReserve: 0 },
};

export function planDensity(count: number): AddonDensity {
  if (count <= 10) return "roomy";
  if (count <= 20) return "tight";
  return "compact";
}

export function paginatePlanEvents(events: QuoteEvent[]): SectionPage<QuoteEvent>[] {
  const density = planDensity(events.length);
  const spec = PLAN_SPEC[density];
  return paginateRows(events, spec, PLAN_BODY, () => spec.rowH);
}

/* ---------------- Page 04 · Deliverables (charges) ---------------- */

/** Deliverables page keeps the shehnai artwork zone clear (bodyBottom 336). */
const CHARGES_BODY = sectionBodyH(336);

/** lastReserve = forest TOTAL row + amount-in-words + exclusions note. */
const CHARGES_SPEC: Record<AddonDensity, SectionSpec> = {
  roomy: { rowH: 58, headingH: 410, firstPad: 20, continuedHeadingH: 104, continuedPad: 40, lastReserve: 92 },
  tight: { rowH: 52, headingH: 410, firstPad: 14, continuedHeadingH: 94, continuedPad: 30, lastReserve: 84 },
  compact: { rowH: 46, headingH: 410, firstPad: 10, continuedHeadingH: 90, continuedPad: 24, lastReserve: 76 },
};

export function chargeDensity(count: number): AddonDensity {
  if (count <= 6) return "roomy";
  if (count <= 12) return "tight";
  return "compact";
}

export function paginateCharges(charges: QuoteCharge[]): SectionPage<QuoteCharge>[] {
  const density = chargeDensity(charges.length);
  const spec = CHARGES_SPEC[density];
  return paginateRows(charges, spec, CHARGES_BODY, () => spec.rowH);
}

/* ---------------- Page 06 · Delivery Timeline ---------------- */

/** Timeline page keeps the wedding-scene artwork zone clear (bodyBottom 240). */
const TIMELINE_BODY = sectionBodyH(240);

/** lastReserve = calendar info panel under the table. */
const TIMELINE_SPEC: Record<AddonDensity, SectionSpec> = {
  roomy: { rowH: 52, headingH: 140, firstPad: 20, continuedHeadingH: 104, continuedPad: 40, lastReserve: 130 },
  tight: { rowH: 46, headingH: 140, firstPad: 14, continuedHeadingH: 94, continuedPad: 30, lastReserve: 120 },
  compact: { rowH: 40, headingH: 140, firstPad: 10, continuedHeadingH: 90, continuedPad: 24, lastReserve: 112 },
};

export function timelineDensity(count: number): AddonDensity {
  if (count <= 8) return "roomy";
  if (count <= 16) return "tight";
  return "compact";
}

export function paginateTimeline(rows: QuoteTimelineRow[]): SectionPage<QuoteTimelineRow>[] {
  const density = timelineDensity(rows.length);
  const spec = TIMELINE_SPEC[density];
  return paginateRows(rows, spec, TIMELINE_BODY, () => spec.rowH);
}

/* ---------------- Page 07 · Terms & Conditions ---------------- */

/** Terms page keeps the couple artwork zone clear (bodyBottom 280). */
const TERMS_BODY = sectionBodyH(280);

const TERMS_SPEC: SectionSpec = {
  rowH: 0,
  // Page 1 has no heading block; continuation pages get a slim one.
  headingH: 8,
  firstPad: 24,
  continuedHeadingH: 64,
  continuedPad: 24,
  lastReserve: 0,
};

const TERM_TITLE_H = 15;
const TERM_BODY_LINE_H = 18.2;
const TERM_FIXED_H = 32 + 5; // row padding + body margin-top
/** ~chars that fit one line of 11px Lora across the ~610px text column. */
const TERM_CHARS_PER_LINE = 88;

export function termRowHeight(term: QuoteTerm): number {
  const lines = Math.max(1, Math.ceil(term.body.length / TERM_CHARS_PER_LINE));
  return TERM_FIXED_H + TERM_TITLE_H + lines * TERM_BODY_LINE_H;
}

export function paginateTerms(terms: QuoteTerm[]): SectionPage<QuoteTerm>[] {
  return paginateRows(terms, TERMS_SPEC, TERMS_BODY, termRowHeight);
}

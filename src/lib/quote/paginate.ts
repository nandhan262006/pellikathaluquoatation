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
import type { QuoteService } from "./types";

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

import type { EventTemplate, ID, OptionDefinition, PriceRange } from "../types";
import { db } from "@/lib/db";
import { eventTemplate, subEvent, optionCatalog } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { buildOptionCatalog } from "../catalog";
import {
  deliverableRulesFor,
  weddingDeliverableRules,
  commonRecommendations,
  ALBUM_DEFAULTS,
  DEFAULT_COVERAGE_PRICES,
  DEFAULT_ADDON_PRICES,
} from "./shared";
import { weddingTemplate } from "./wedding";
import {
  birthdayTemplate,
  halfSareeTemplate,
  babyShowerTemplate,
  housewarmingTemplate,
  anniversaryTemplate,
  corporateTemplate,
} from "./other-events";
import {
  usWeddingTemplate,
  usEngagementTemplate,
  usBirthdayTemplate,
  usAnniversaryTemplate,
  usCorporateTemplate,
  usBabyShowerTemplate,
  usGraduationTemplate,
  US_ALBUM_DEFAULTS,
} from "./us-events";

const HARDCODED_TEMPLATES: EventTemplate[] = [
  weddingTemplate,
  birthdayTemplate,
  halfSareeTemplate,
  babyShowerTemplate,
  housewarmingTemplate,
  anniversaryTemplate,
  corporateTemplate,
  usWeddingTemplate,
  usEngagementTemplate,
  usBirthdayTemplate,
  usAnniversaryTemplate,
  usCorporateTemplate,
  usBabyShowerTemplate,
  usGraduationTemplate,
];

async function loadOptionCatalog(): Promise<Record<ID, OptionDefinition>> {
  try {
    if (!db) return buildOptionCatalog();
    const rows = await db
      .select()
      .from(optionCatalog)
      .orderBy(asc(optionCatalog.kind), asc(optionCatalog.sortOrder));
    if (!rows.length) return buildOptionCatalog();
    const map: Record<ID, OptionDefinition> = {};
    for (const r of rows) {
      map[r.optionId] = { id: r.optionId, label: r.label, icon: r.icon, description: r.description };
    }
    return map;
  } catch {
    return buildOptionCatalog();
  }
}

async function loadDbTemplates(
  catalog: Record<ID, OptionDefinition>,
): Promise<EventTemplate[]> {
  try {
    if (!db) return [];
    const dbTemplates = await db.select().from(eventTemplate).where(eq(eventTemplate.isActive, 1));
    if (!dbTemplates.length) return [];

    const allSubEvents = await db.select().from(subEvent).orderBy(asc(subEvent.sortOrder));

    return dbTemplates.map((t) => {
      const rawCoverage: ID[] = safeJson<ID[]>(t.coverageOptions) ?? [];
      const rawAddOns: ID[] = safeJson<ID[]>(t.addOnOptions) ?? [];
      const defaultPrices: Record<string, Record<string, number>> = safeJson(t.defaultPrices) ?? {};

      function toPriceRange(map: Record<string, number> | undefined): Record<ID, PriceRange> {
        const result: Record<ID, PriceRange> = {};
        if (!map) return result;
        for (const [key, val] of Object.entries(map)) {
          result[key] = { value: val };
        }
        return result;
      }

      const overrideCoverage = toPriceRange(defaultPrices.coverage);
      const overrideAddOns = toPriceRange(defaultPrices.addOns);

      const mergedCoverage: Record<ID, PriceRange> = {
        ...DEFAULT_COVERAGE_PRICES,
        ...overrideCoverage,
      };

      const mergedAddOns: Record<ID, PriceRange> = {
        ...DEFAULT_ADDON_PRICES,
        ...overrideAddOns,
      };

      const nonZeroCoverage = Object.keys(mergedCoverage).filter(
        (id) => mergedCoverage[id].value !== 0,
      );
      const nonZeroAddOns = Object.keys(mergedAddOns).filter(
        (id) => mergedAddOns[id].value !== 0,
      );

      const coverageOptions = rawCoverage.length > 0
        ? rawCoverage.filter((id) => mergedCoverage[id]?.value !== 0)
        : nonZeroCoverage;
      const addOnOptions = rawAddOns.length > 0
        ? rawAddOns.filter((id) => mergedAddOns[id]?.value !== 0)
        : nonZeroAddOns;

      const templateSubEvents = allSubEvents.filter((se) => se.templateId === t.id);

      const subEventDefs = templateSubEvents.map((se) => {
        const overrides: Record<string, unknown> = safeJson<Record<string, unknown>>(se.priceOverrides) ?? {};
        return {
          id: se.subEventId,
          name: se.name,
          description: se.description || undefined,
          defaultSelected: Boolean(se.defaultSelected),
          maxReels: se.maxReels ?? undefined,
          coverage: overrides.coverage as unknown as Partial<Record<ID, PriceRange>> | undefined,
          addOns: overrides.addOns as unknown as Partial<Record<ID, PriceRange>> | undefined,
          reel: overrides.reel as unknown as PriceRange | undefined,
        };
      });

      const templateDeliverableRules =
        t.typeId === "wedding"
          ? weddingDeliverableRules(subEventDefs, coverageOptions, addOnOptions)
          : deliverableRulesFor(coverageOptions, addOnOptions);

      return {
        id: t.typeId,
        name: t.name,
        tagline: t.tagline || undefined,
        description: t.description || undefined,
        icon: t.icon,
        market: t.market === "US" ? "US" : "IN",
        coverageOptions,
        addOnOptions,
        optionCatalog: catalog,
        defaultCoveragePrices: mergedCoverage,
        defaultAddOnPrices: mergedAddOns,
        defaultReelPrice: { value: t.defaultReelPrice },
        defaultMaxReels: t.defaultMaxReels,
        subEvents: subEventDefs,
        album: t.market === "US" ? US_ALBUM_DEFAULTS : ALBUM_DEFAULTS,
        deliverableRules: templateDeliverableRules,
        recommendationRules: commonRecommendations(),
      };
    });
  } catch {
    return [];
  }
}

function safeJson<T>(val: string): T | null {
  try { return JSON.parse(val) as T; } catch { return null; }
}

function applyZeroPriceFilter(t: EventTemplate): EventTemplate {
  const filteredCoverage = t.coverageOptions.filter(
    (id) => t.defaultCoveragePrices[id]?.value !== 0
  );
  const filteredAddOns = t.addOnOptions.filter(
    (id) => t.defaultAddOnPrices[id]?.value !== 0
  );

  return {
    ...t,
    coverageOptions: filteredCoverage,
    addOnOptions: filteredAddOns,
    deliverableRules: t.deliverableRules.filter((rule) => {
      if (rule.when.coverage) {
        return rule.when.coverage.some((covId) => filteredCoverage.includes(covId));
      }
      if (rule.when.addOns) {
        return rule.when.addOns.some((addonId) => filteredAddOns.includes(addonId));
      }
      return true;
    }),
  };
}

export async function loadTemplates(): Promise<EventTemplate[]> {
  const catalog = await loadOptionCatalog();
  const dbTemplates = await loadDbTemplates(catalog);
  const templates = dbTemplates.length > 0
    ? dbTemplates
    : HARDCODED_TEMPLATES.map((t) => ({ ...t, optionCatalog: catalog }));
  return templates.map(applyZeroPriceFilter);
}

export async function loadTemplate(id: ID | null): Promise<EventTemplate | null> {
  if (!id) return null;
  const all = await loadTemplates();
  return all.find((t) => t.id === id) ?? null;
}

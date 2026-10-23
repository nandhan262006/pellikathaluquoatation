"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, getDb } from "@/lib/db-utils";
import { eventTemplate, subEvent, optionCatalog } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import type { OptionKind } from "@/lib/estimator/types";

const ID_PATTERN = /^[a-z0-9_]+$/;

function cleanText(value: unknown, max: number, field: string, required = true): string {
  const v = typeof value === "string" ? value.trim() : "";
  if (!v) {
    if (required) throw new Error(`${field} is required`);
    return "";
  }
  return v.slice(0, max);
}

function cleanId(value: unknown, field: string): string {
  const v = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!v || !ID_PATTERN.test(v)) {
    throw new Error(`${field} must be lowercase letters, digits and underscores`);
  }
  return v.slice(0, 40);
}

function cleanNumber(value: unknown, field: string, min = 0, max = 100_000_000): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max) {
    throw new Error(`${field} must be a number between ${min} and ${max}`);
  }
  return Math.trunc(n);
}

function cleanOptionIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of value) {
    if (typeof v !== "string") continue;
    const id = v.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id.slice(0, 60));
  }
  return out;
}

export async function getTemplates() {
  await requireAdmin();
  const db = getDb();
  try {
    const templates = await db
      .select()
      .from(eventTemplate)
      .orderBy(asc(eventTemplate.name));
    const subEvents = await db.select().from(subEvent).orderBy(asc(subEvent.sortOrder));
    return JSON.parse(JSON.stringify(
      templates.map((t) => ({
        ...t,
        subEvents: subEvents.filter((se) => se.templateId === t.id),
      }))
    ));
  } catch {
    return [];
  }
}

export async function getTemplate(id: number) {
  await requireAdmin();
  const db = getDb();
  const t = await db.select().from(eventTemplate).where(eq(eventTemplate.id, id)).then((r) => r[0] ?? null);
  if (!t) return null;
  const subEvents = await db.select().from(subEvent).where(eq(subEvent.templateId, id)).orderBy(asc(subEvent.sortOrder));
  return { ...t, subEvents };
}

export async function upsertTemplate(data: {
  id?: number;
  typeId: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  isActive: number;
  defaultMaxReels: number;
  defaultReelPrice: number;
  coverageOptions: string[];
  addOnOptions: string[];
  defaultPrices?: string;
}) {
  await requireAdmin();
  const db = getDb();
  const payload = {
    typeId: cleanId(data.typeId, "ID"),
    name: cleanText(data.name, 80, "Name"),
    tagline: cleanText(data.tagline, 200, "Tagline", false),
    description: cleanText(data.description, 500, "Description", false),
    icon: cleanId(data.icon, "Icon"),
    isActive: data.isActive ? 1 : 0,
    defaultMaxReels: cleanNumber(data.defaultMaxReels, "Max reels", 0, 20),
    defaultReelPrice: cleanNumber(data.defaultReelPrice, "Reel price", 0, 10_000_000),
    coverageOptions: JSON.stringify(cleanOptionIds(data.coverageOptions)),
    addOnOptions: JSON.stringify(cleanOptionIds(data.addOnOptions)),
    defaultPrices: data.defaultPrices ?? "{}",
  };
  if (data.id) {
    await db.update(eventTemplate).set(payload).where(eq(eventTemplate.id, data.id));
  } else {
    await db.insert(eventTemplate).values(payload);
  }
  revalidatePath("/admin/templates");
  revalidatePath("/estimator");
  return { success: true };
}

export async function upsertSubEvent(data: {
  id?: number;
  subEventId: string;
  name: string;
  description: string;
  defaultSelected: boolean;
  maxReels: number | null;
  sortOrder: number;
  /** Optional — when undefined, existing overrides are left untouched. */
  priceOverrides?: Record<string, unknown>;
  templateId: number;
}) {
  await requireAdmin();
  const db = getDb();
  const payload = {
    subEventId: cleanId(data.subEventId, "ID"),
    name: cleanText(data.name, 80, "Name"),
    description: cleanText(data.description, 300, "Description", false),
    defaultSelected: data.defaultSelected ? 1 : 0,
    maxReels: data.maxReels === null ? null : cleanNumber(data.maxReels, "Max reels", 0, 20),
    sortOrder: cleanNumber(data.sortOrder, "Sort order", 0, 1000),
    templateId: data.templateId,
  };
  if (data.id) {
    // Only write overrides when explicitly provided, so an edit of
    // name/description cannot silently erase stored per-sub-event pricing.
    await db
      .update(subEvent)
      .set(
        data.priceOverrides === undefined
          ? payload
          : { ...payload, priceOverrides: JSON.stringify(data.priceOverrides) },
      )
      .where(eq(subEvent.id, data.id));
  } else {
    await db.insert(subEvent).values({
      ...payload,
      priceOverrides: JSON.stringify(data.priceOverrides ?? {}),
    });
  }
  revalidatePath("/admin/templates");
  revalidatePath("/estimator");
  return { success: true };
}

export async function deleteSubEvent(id: number) {
  await requireAdmin();
  const db = getDb();
  await db.delete(subEvent).where(eq(subEvent.id, id));
  revalidatePath("/admin/templates");
  revalidatePath("/estimator");
  return { success: true };
}

export async function deleteTemplate(id: number) {
  await requireAdmin();
  const db = getDb();
  await db.delete(eventTemplate).where(eq(eventTemplate.id, id));
  revalidatePath("/admin/templates");
  revalidatePath("/estimator");
  return { success: true };
}

export async function getOptionCatalog() {
  await requireAdmin();
  const db = getDb();
  try {
    const rows = await db
      .select()
      .from(optionCatalog)
      .orderBy(asc(optionCatalog.kind), asc(optionCatalog.sortOrder));
    return JSON.parse(JSON.stringify(rows));
  } catch {
    return [];
  }
}

export async function createOption(data: {
  optionId: string;
  kind: OptionKind;
  label: string;
  icon: string;
  description: string;
}) {
  await requireAdmin();
  const db = getDb();
  if (data.kind !== "coverage" && data.kind !== "addon") {
    throw new Error("Invalid option kind");
  }
  await db.insert(optionCatalog).values({
    optionId: cleanId(data.optionId, "ID"),
    kind: data.kind,
    label: cleanText(data.label, 80, "Label"),
    icon: cleanId(data.icon, "Icon"),
    description: cleanText(data.description, 300, "Description", false),
    sortOrder: 99,
  });
  revalidatePath("/admin/templates");
  revalidatePath("/estimator");
  return { success: true };
}

export async function deleteOption(optionId: string) {
  await requireAdmin();
  const db = getDb();
  await db.delete(optionCatalog).where(eq(optionCatalog.optionId, optionId));
  revalidatePath("/admin/templates");
  revalidatePath("/estimator");
  return { success: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, getDb } from "@/lib/db-utils";
import { eventTemplate, subEvent, optionCatalog } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import type { Market, OptionKind } from "@/lib/estimator/types";

export async function getTemplates(market: Market = "IN") {
  await requireAdmin();
  const db = getDb();
  try {
    const templates = await db
      .select()
      .from(eventTemplate)
      .where(eq(eventTemplate.market, market))
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
  market: Market;
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
    typeId: data.typeId,
    name: data.name,
    tagline: data.tagline,
    description: data.description,
    icon: data.icon,
    market: data.market,
    isActive: data.isActive ? 1 : 0,
    defaultMaxReels: data.defaultMaxReels,
    defaultReelPrice: data.defaultReelPrice,
    coverageOptions: JSON.stringify(data.coverageOptions),
    addOnOptions: JSON.stringify(data.addOnOptions),
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
  priceOverrides: Record<string, unknown>;
  templateId: number;
}) {
  await requireAdmin();
  const db = getDb();
  const payload = {
    subEventId: data.subEventId,
    name: data.name,
    description: data.description,
    defaultSelected: data.defaultSelected ? 1 : 0,
    maxReels: data.maxReels,
    sortOrder: data.sortOrder,
    priceOverrides: JSON.stringify(data.priceOverrides),
    templateId: data.templateId,
  };
  if (data.id) {
    await db.update(subEvent).set(payload).where(eq(subEvent.id, data.id));
  } else {
    await db.insert(subEvent).values(payload);
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
  await db.insert(optionCatalog).values({
    optionId: data.optionId,
    kind: data.kind,
    label: data.label,
    icon: data.icon,
    description: data.description,
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

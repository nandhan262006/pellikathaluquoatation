"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, getDb } from "@/lib/db-utils";
import { estimateLead } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

const MAX_ESTIMATE_DATA_LENGTH = 64_000;

function cleanString(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function saveEstimateLead(data: {
  clientName: string;
  clientPhone: string;
  eventType: string;
  eventName: string;
  estimateData: string;
}) {
  const clientName = cleanString(data.clientName, 80);
  const clientPhone = cleanString(data.clientPhone, 15).replace(/\D/g, "").slice(0, 10);
  const eventType = cleanString(data.eventType, 40);
  const eventName = cleanString(data.eventName, 80);
  const estimateData =
    typeof data.estimateData === "string" && data.estimateData.length <= MAX_ESTIMATE_DATA_LENGTH
      ? data.estimateData
      : "";

  if (!clientName || clientPhone.length !== 10 || !eventType || !estimateData) {
    return { success: false };
  }

  try {
    const db = getDb();
    await db.insert(estimateLead).values({
      clientName,
      clientPhone,
      eventType,
      eventName,
      estimateData,
    });
    return { success: true };
  } catch (e) {
    console.error("Failed to save estimate lead:", e);
    return { success: false };
  }
}

export async function getEstimateLeads() {
  await requireAdmin();
  try {
    const db = getDb();
    return await db
      .select()
      .from(estimateLead)
      .orderBy(desc(estimateLead.createdAt));
  } catch (e) {
    console.error("Failed to fetch estimate leads:", e);
    return [];
  }
}

export async function markEstimateComplete(id: number) {
  await requireAdmin();
  try {
    const db = getDb();
    await db.update(estimateLead).set({ status: "completed" }).where(eq(estimateLead.id, id));
    revalidatePath("/admin/estimates");
    return { success: true };
  } catch (e) {
    console.error("Failed to mark estimate complete:", e);
    return { success: false };
  }
}

export async function deleteEstimateLead(id: number) {
  await requireAdmin();
  try {
    const db = getDb();
    await db.delete(estimateLead).where(eq(estimateLead.id, id));
    revalidatePath("/admin/estimates");
    return { success: true };
  } catch (e) {
    console.error("Failed to delete estimate lead:", e);
    return { success: false };
  }
}

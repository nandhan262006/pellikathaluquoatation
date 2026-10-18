"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, getDb } from "@/lib/db-utils";
import { estimateLead } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isQuotationData } from "@/lib/quote/prefill";
import type { QuotationData } from "@/lib/quote/types";

const MAX_QUOTATION_DATA_LENGTH = 128_000;

export async function saveQuotation(id: number, data: QuotationData) {
  await requireAdmin();
  if (!isQuotationData(data)) return { success: false };
  const db = getDb();
  try {
    const json = JSON.stringify(data);
    if (json.length > MAX_QUOTATION_DATA_LENGTH) return { success: false };
    await db.update(estimateLead).set({ quotationData: json }).where(eq(estimateLead.id, id));
    revalidatePath("/admin/estimates");
    return { success: true };
  } catch (e) {
    console.error("Failed to save quotation:", e);
    return { success: false };
  }
}

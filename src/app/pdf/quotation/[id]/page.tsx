import { notFound } from "next/navigation";
import { QuotationDocument } from "@/components/quote/quotation-document";
import { buildQuotationData, isQuotationData } from "@/lib/quote/prefill";
import { verifyPdfToken } from "@/lib/quote/pdf-token";
import { getDb } from "@/lib/db-utils";
import { estimateLead } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Print-media-only page consumed by the headless PDF renderer
 * (/api/quote-pdf). On screen it renders nothing (the .quote-print-root is
 * display:none outside print); in print media the document prints exactly
 * like the old browser print flow — same fonts, same optimized artwork.
 */
export default async function PdfQuotationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string; exp?: string }>;
}) {
  const { id } = await params;
  const { token, exp } = await searchParams;
  const leadId = Number(id);
  if (
    !Number.isInteger(leadId) ||
    leadId <= 0 ||
    !verifyPdfToken(leadId, exp, token)
  ) {
    notFound();
  }

  const db = getDb();
  const lead = (await db.select().from(estimateLead).where(eq(estimateLead.id, leadId)))[0];
  if (!lead) notFound();

  const parse = (raw: string) => {
    try {
      const parsed = JSON.parse(raw);
      return isQuotationData(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };

  const data =
    (lead.quotationData ? parse(lead.quotationData) : null) ??
    buildQuotationData({
      clientName: lead.clientName,
      clientPhone: lead.clientPhone,
      eventType: lead.eventType,
      eventName: lead.eventName,
      estimateData: lead.estimateData,
    });

  return (
    <div className="quote-print-root">
      <QuotationDocument data={data} />
    </div>
  );
}

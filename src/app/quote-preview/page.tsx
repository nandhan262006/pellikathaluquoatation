import { QuotationDocument } from "@/components/quote/quotation-document";
import { buildQuotationData } from "@/lib/quote/prefill";

export const dynamic = "force-dynamic";

/**
 * DEV-ONLY preview of the quotation document for visual verification.
 * NOT linked anywhere; renders default sample data.
 * Query: ?services=N overrides the add-on service count.
 */
export default async function QuotePreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ services?: string; dialog?: string }>;
}) {
  const { services, dialog } = await searchParams;
  const data = buildQuotationData({
    clientName: "Kavya",
    clientPhone: "8522888119",
    eventType: "wedding",
    eventName: "Wedding",
    market: "IN",
    estimateData: JSON.stringify({
      state: {
        clientName: "Kavya",
        clientPhone: "8522888119",
        estimatedDate: "2026-11-01",
        market: "IN",
        eventTypeId: "wedding",
        selectedSubEvents: [],
        subEventConfig: {},
        album: { required: false, typeId: null, sizeId: null, pages: 30, count: 0 },
      },
      estimate: {
        items: [
          { id: "1", label: "Traditional Photography", detail: "Haldi", group: "Coverage", value: 12000 },
          { id: "2", label: "Traditional Videography", detail: "Haldi", group: "Coverage", value: 16000 },
          { id: "3", label: "Candid Photography", detail: "Sangeeth", group: "Coverage", value: 35000 },
          { id: "4", label: "Cinematic Videography", detail: "Sangeeth", group: "Coverage", value: 45000 },
          { id: "5", label: "Traditional Photography", detail: "Pellikuthuru", group: "Coverage", value: 12000 },
          { id: "6", label: "Traditional Photography", detail: "Mehendi", group: "Coverage", value: 12000 },
          { id: "7", label: "Traditional Photography", detail: "Pellikoduku", group: "Coverage", value: 12000 },
          { id: "8", label: "Traditional Videography", detail: "Pellikoduku", group: "Coverage", value: 16000 },
          { id: "9", label: "Candid Photography", detail: "Wedding & Reception", group: "Coverage", value: 35000 },
          { id: "10", label: "Cinematic Videography", detail: "Wedding & Reception", group: "Coverage", value: 45000 },
          { id: "11", label: "Drone", detail: "Wedding & Reception", group: "Coverage", value: 20000 },
        ],
        total: 525000,
        subEventCount: 6,
        isEmpty: false,
      },
    }),
  });

  if (services) {
    const n = Math.max(0, Math.min(60, parseInt(services, 10) || 0));
    const pool = [
      "Live Streaming", "Album", "LED Screen", "Pre-Wedding Shoot",
      "Social Media Coverage", "Drone Pilot", "Photobooth", "Signature Cocktail Bar",
      "Guest Welcome Kits", "Sparkler Entry", "Cold Pyro Show", "Choreography Team",
      "Additional Second Album", "Same-Day Wedding Film", "Extended Coverage Hours",
      "Assistant Photographers", "Crane Setup", "Anamorphic Lens Package",
      "Vintage Car Logistics", "Makeup Artist Tie-up", "Wedding Website", "Invitation Shoot",
      "Golden Hour Portraits", "Bachelor Party Shoot", "Honeymoon Mini-Session",
      "Framed Prints Set", "Canvas Wall Art", "Reel Bundle (10 reels)",
    ];
    data.services = pool.slice(0, n).map((name, i) => ({
      id: `svc-${i}`,
      name,
      price: i % 3 === 0 ? "Price on request" : `₹ ${(i + 1) * 5},000`,
      included: i % 3 === 1,
      icon: "social",
      unit: i % 4 === 1 ? "per day" : "",
    }));
  }

  if (dialog) {
    const { DialogPreview } = await import("./dialog-preview");
    return <DialogPreview />;
  }

  return <QuotationDocument data={data} />;
}

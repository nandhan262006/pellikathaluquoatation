import { QuotationDocument } from "@/components/quote/quotation-document";
import { buildQuotationData } from "@/lib/quote/prefill";

export const dynamic = "force-dynamic";

/**
 * DEV-ONLY preview of the quotation document for visual verification.
 * NOT linked anywhere; renders default sample data.
 * Query: ?services=N overrides the add-on service count.
 * ?events=N / ?charges=N / ?timeline=N / ?terms=N pad those sections.
 */
export default async function QuotePreviewPage({
  searchParams,
}: {
  searchParams: Promise<{
    services?: string;
    dialog?: string;
    events?: string;
    charges?: string;
    timeline?: string;
    terms?: string;
  }>;
}) {
  const { services, dialog, events, charges, timeline, terms } = await searchParams;
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

  const padCount = (raw?: string) =>
    Math.max(0, Math.min(60, parseInt(raw ?? "", 10) || 0));

  if (events) {
    const n = padCount(events);
    for (let i = data.events.length; i < n; i++) {
      data.events.push({
        id: `extra-ev-${i}`,
        name: `EXTRA EVENT ${i + 1}`,
        date: "Nov 2",
        team: "1 Photographer / 1 Videographer",
        icon: "rings",
      });
    }
  }

  if (charges) {
    const n = padCount(charges);
    for (let i = data.charges.length; i < n; i++) {
      data.charges.push({
        id: `extra-charge-${i}`,
        label: `Extra Charge ${i + 1}`,
        amount: `₹ ${(i + 1) * 10},000`,
      });
    }
  }

  if (timeline) {
    const n = padCount(timeline);
    for (let i = data.timeline.length; i < n; i++) {
      data.timeline.push({
        id: `extra-tl-${i}`,
        output: `Extra Output ${i + 1}`,
        outputDetail: i % 3 === 0 ? "(detail line)" : undefined,
        time: "30 days",
        revisions: "NA",
      });
    }
  }

  if (terms) {
    const n = padCount(terms);
    for (let i = data.terms.length; i < n; i++) {
      data.terms.push({
        id: `extra-term-${i}`,
        icon: "calendar",
        title: `Extra Term ${i + 1}`,
        body:
          i % 3 === 0
            ? "A longer terms entry to exercise the height estimate for variable body text, spanning several wrapped lines of copy before the next row begins."
            : "Standard short terms entry.",
      });
    }
  }

  if (dialog) {
    const { DialogPreview } = await import("./dialog-preview");
    return <DialogPreview />;
  }

  return <QuotationDocument data={data} />;
}

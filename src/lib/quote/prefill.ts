/**
 * Builds an editable QuotationData snapshot from a saved estimate lead.
 * The output is a plain JSON document stored in EstimateLead.quotationData;
 * nothing here is hardcoded into the presentation components.
 */
import type {
  EstimateBreakdown,
  EstimatorState,
  DeliverableGroup,
  Market,
} from "@/lib/estimator/types";
import { formatMoney } from "@/lib/estimator/format";
import { amountWords } from "./words";
import type { QuotationData, QuoteEvent, QuoteService } from "./types";

interface ParsedEstimate {
  state?: Partial<EstimatorState>;
  estimate?: EstimateBreakdown;
  deliverables?: DeliverableGroup[];
}

export function parseEstimateData(raw: string): ParsedEstimate | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as ParsedEstimate;
    return null;
  } catch {
    return null;
  }
}

const EVENT_ICON_KEYS: Record<string, string> = {
  haldi: "bowl",
  sangeeth: "music",
  pellikuthuru: "bride",
  mehendi: "henna",
  pellikoduku: "groom",
  wedding: "rings",
  reception: "rings",
  wedding_day: "rings",
  main: "rings",
  engagement: "rings",
  party: "music",
  baby_shower: "bride",
  naming: "bowl",
  housewarming: "groom",
  other: "rings",
};

const DEFAULT_EVENTS: QuoteEvent[] = [
  { id: "haldi", name: "HALDI", date: "", team: "2 Photographers / 2 Videographers", icon: "bowl" },
  { id: "sangeeth", name: "SANGEETH", date: "", team: "2 Photographers / 2 Videographers", icon: "music" },
  { id: "pellikuthuru", name: "PELLIKUTHURU", date: "", team: "1 Photographer / 1 Videographer", icon: "bride" },
  { id: "mehendi", name: "MEHENDI", date: "", team: "1 Photographer / 1 Videographer", icon: "henna" },
  { id: "pellikoduku", name: "PELLIKODUKU", date: "", team: "1 Photographer / 1 Videographer", icon: "groom" },
  { id: "wedding", name: "WEDDING & RECEPTION", date: "", team: "3 Photographers / 3 Videographers", icon: "rings" },
];

const DEFAULT_SERVICES: QuoteService[] = [
  { id: "live-streaming", name: "Live Streaming", price: "Price on request", included: false, icon: "stream", unit: "" },
  { id: "album", name: "Album", price: "₹ 25,000", included: false, icon: "album", unit: "per album" },
  { id: "led-screen", name: "LED Screen", price: "₹ 15,000 /-", included: false, icon: "screen", unit: "₹ 5,000 extra for 4K (optional)" },
  { id: "pre-wedding", name: "Pre-Wedding Shoot", price: "Price based on concept", included: false, icon: "couple" },
  { id: "social-media", name: "Social Media Coverage", price: "Price on request", included: false, icon: "social" },
  { id: "drone-pilot", name: "Drone Pilot", price: "₹ 20,000", included: false, icon: "drone", unit: "per day" },
];

const ABOUT_PARAGRAPHS = [
  "We are a team of photographers who capture memories that will transcend generations and become a cherished part of a family.",
  "Our expertise and experience give us an intimate understanding of rituals and a keen eye for capturing precious moments between loved ones, and a strong sense of lighting & composition to create meaningful portraits at your events.",
];

const TIMELINE_ROWS = [
  { id: "quick-edits", output: "Quick Edits", outputDetail: "(20 Photos)", time: "Right after event (only on off-season)", revisions: "NA" },
  { id: "edited-photos", output: "Edited Photos", time: "25 days", revisions: "NA" },
  { id: "teaser-reels", output: "Event Teaser / Reels", time: "25 days", revisions: "NA" },
  { id: "full-videos", output: "Full Length Videos", time: "Within 45 days", revisions: "NA" },
];

const TERMS = [
  {
    id: "travel",
    icon: "plane",
    title: "Travel & Accommodation Expenses",
    body: "You shall arrange for the travel and accommodation of our shoot crew for all your events occuring in places away from our offices. The quoted price does not include this expense and is additional.",
  },
  {
    id: "payments",
    icon: "card",
    title: "Payments",
    body: "You shall clear 50% of the whole amount immediately to block the dates and the remaining 50% before your wedding event.",
  },
  {
    id: "gst",
    icon: "percent",
    title: "Additional GST Charges",
    body: "GST (Goods and Services Tax) of 18% is applicable on the whole amount. The amount mentioned in this quotation is exclusive of GST.",
  },
  {
    id: "change-of-plans",
    icon: "calendar",
    title: "Change of Plans",
    body: "Any change of plan and/or postponement of any event will be accommodated based on our availability on the new dates.",
  },
  {
    id: "advance",
    icon: "close",
    title: "Advance Non-Refundable",
    body: "Once you've paid the advance amount to block the dates, it is non-refundable.",
  },
  {
    id: "drone",
    icon: "drone",
    title: "Drone Usage",
    body: "Drone pilot service is subject to local regulations and necessary DGCA permissions. Any restrictions at the venue may limit drone usage.",
  },
];

function prettyDate(raw: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return "";
  const d = new Date(`${raw}T00:00:00`);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function deriveTeam(items: { label: string; value: number }[]): string {
  const photographers = items.filter((i) => i.label.includes("Photography") && i.value > 0).length;
  const videographers = items.filter(
    (i) => i.label.includes("Videography") || i.label.includes("Film"),
  ).length;
  const p = photographers > 1 ? photographers : 1;
  const v = videographers > 1 ? videographers : videographers === 1 ? 1 : 0;
  if (p === 0 && v === 0) return "—";
  const ps = `${p} Photographer${p > 1 ? "s" : ""}`;
  const vs = v > 0 ? `${v} Videographer${v > 1 ? "s" : ""}` : "";
  return vs ? `${ps} / ${vs}` : ps;
}

function defaultServices(parsed: ParsedEstimate): QuoteService[] {
  const services = DEFAULT_SERVICES.map((s) => ({ ...s }));
  const allAddOns = new Set<string>();
  const cfg = parsed.state?.subEventConfig ?? {};
  for (const key of Object.keys(cfg)) {
    for (const id of cfg[key]?.addOns ?? []) allAddOns.add(id);
  }
  const selectedCoverage = new Set<string>();
  for (const key of Object.keys(cfg)) {
    for (const id of cfg[key]?.coverage ?? []) selectedCoverage.add(id);
  }
  const markIncluded = (id: string, condition: boolean) => {
    const svc = services.find((s) => s.id === id);
    if (svc && condition) svc.included = true;
  };
  markIncluded("live-streaming", allAddOns.has("live_streaming"));
  markIncluded("led-screen", allAddOns.has("led_screen"));
  markIncluded("album", !!parsed.state?.album?.required);
  markIncluded("drone-pilot", selectedCoverage.has("drone"));
  return services;
}

export function buildQuotationData(lead: {
  clientName: string;
  clientPhone: string;
  eventType: string;
  eventName: string;
  market: string;
  estimateData: string;
}): QuotationData {
  const parsed = parseEstimateData(lead.estimateData) ?? {};
  const market: Market = lead.market === "US" ? "US" : "IN";
  const estimate = parsed.estimate;
  const state = parsed.state;
  const total = estimate && !estimate.isEmpty ? estimate.total : 0;

  // Derive the event schedule from the estimate items grouped by sub-event.
  let events: QuoteEvent[] = [];
  if (estimate && estimate.items.length > 0) {
    const bySub = new Map<string, { label: string; value: number }[]>();
    for (const item of estimate.items) {
      const subName = item.detail ?? "";
      if (!bySub.has(subName)) bySub.set(subName, []);
      bySub.get(subName)!.push({ label: item.label, value: item.value });
    }
    events = [...bySub.entries()].map(([name, items], i) => ({
      id: `ev-${i}`,
      name: name.toUpperCase(),
      date: prettyDate(state?.estimatedDate ?? ""),
      team: deriveTeam(items),
      icon: EVENT_ICON_KEYS[
        Object.keys(EVENT_ICON_KEYS).find((k) => name.toLowerCase().includes(k)) ?? "other"
      ],
    }));
  } else if (parsed.deliverables && parsed.deliverables.length > 0) {
    const names = [
      ...new Set(parsed.deliverables.flatMap((g) => g.items.map((it) => it.subEvent ?? ""))),
    ].filter(Boolean);
    events = names.map((name, i) => ({
      id: `ev-${i}`,
      name: name.toUpperCase(),
      date: prettyDate(state?.estimatedDate ?? ""),
      team: "1 Photographer / 1 Videographer",
      icon: EVENT_ICON_KEYS[
        Object.keys(EVENT_ICON_KEYS).find((k) => name.toLowerCase().includes(k)) ?? "other"
      ],
    }));
  } else {
    events = DEFAULT_EVENTS.map((e) => ({
      ...e,
      date: prettyDate(state?.estimatedDate ?? ""),
    }));
  }

  const dateLabel = state?.estimatedDate
    ? new Date(`${state.estimatedDate}T00:00:00`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return {
    quoteNumber: `PK-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    clientName: lead.clientName,
    clientPhone: lead.clientPhone,
    market,
    eventType: lead.eventName || lead.eventType,
    eventDate: dateLabel,

    aboutHeading: ["Our", "Story"],
    aboutParagraphs: [...ABOUT_PARAGRAPHS],

    greetingLabel: "Dear,",
    greetingName: lead.clientName,
    planIntro:
      "Thank you for reaching out to us for your wedding celebrations - we are excited at the opportunity to be part of your special moments.",
    teamSubline: "Our dedicated team for your celebrations",
    events,

    deliverablesSideText: ["Thousands", "of Moments", "a Lifetime", "of Memories"],
    photosTitle: "PHOTOS",
    photosApprox: "Approx 3000 - 4000",
    photosBody:
      "Number of edited images depends on event, images will be delivered through online cloud-based protected method and a password which will be active for 2 months.",
    videosTitle: "VIDEOS",
    videosApprox: "Wedding Film\nFull Length Videos",
    videosBody:
      "All videos will be delivered by 45 days via a cloud based online platform which will be active for 2 months.",
    charges: [
      {
        id: "service",
        label: `${lead.eventName || "Photography"} Service`,
        amount: formatMoney(total, market),
      },
    ],
    total: formatMoney(total, market),
    totalWords: amountWords(total, market),
    exclusionsNote:
      "This excludes travel, accommodation, food & any add-on services.",

    addonsIntro: "Additional offerings to make the most of your day",
    services: defaultServices(parsed),

    timeline: TIMELINE_ROWS.map((r) => ({ ...r })),
    timelineNote:
      "Delivery timeline commence from the date of last event or date of final payment, whichever is later.",

    terms: TERMS.map((t) => ({ ...t })),

    contactPhone: "8522888119",
    contactEmail: "photographybywvjy@gmail.com",
    contactStudio: "PELLI KATHALU - HYDERABAD",
  };
}

export function isQuotationData(value: unknown): value is QuotationData {
  return (
    !!value &&
    typeof value === "object" &&
    Array.isArray((value as QuotationData).services) &&
    Array.isArray((value as QuotationData).events)
  );
}

/**
 * Builds an editable QuotationData snapshot from a saved estimate lead.
 * The output is a plain JSON document stored in EstimateLead.quotationData;
 * nothing here is hardcoded into the presentation components.
 */
import type {
  EstimateBreakdown,
  EstimatorState,
  Deliverable,
  DeliverableGroup,
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

const ESTIMATED_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Lead data is stored as a raw JSON string from a public form, so every shape
 * assumption must be defensive here — malformed input must degrade to the
 * default quotation instead of crashing the document render.
 */
function sanitizeParsedEstimate(raw: ParsedEstimate): ParsedEstimate {
  const out: ParsedEstimate = {};

  if (raw.state && typeof raw.state === "object" && !Array.isArray(raw.state)) {
    const state = { ...raw.state };
    if (!state.subEventConfig || typeof state.subEventConfig !== "object" || Array.isArray(state.subEventConfig)) {
      state.subEventConfig = {};
    }
    // Normalise every config entry: coverage/addOns must be string arrays.
    for (const key of Object.keys(state.subEventConfig)) {
      const cfg = state.subEventConfig[key];
      if (!cfg || typeof cfg !== "object") {
        state.subEventConfig[key] = { id: key, coverage: [], addOns: [], reels: 0 };
        continue;
      }
      state.subEventConfig[key] = {
        ...cfg,
        coverage: Array.isArray(cfg.coverage) ? cfg.coverage.filter((id) => typeof id === "string") : [],
        addOns: Array.isArray(cfg.addOns) ? cfg.addOns.filter((id) => typeof id === "string") : [],
        reels: typeof cfg.reels === "number" && Number.isFinite(cfg.reels) ? Math.max(0, Math.floor(cfg.reels)) : 0,
      };
    }
    out.state = state;
  }

  if (raw.estimate && typeof raw.estimate === "object" && !Array.isArray(raw.estimate)) {
    const estimate = { ...raw.estimate };
    const rawItems = Array.isArray(estimate.items) ? estimate.items : [];
    estimate.items = rawItems.filter(
      (item): item is EstimateBreakdown["items"][number] =>
        !!item && typeof item === "object" && typeof (item as { value?: unknown }).value === "number",
    );
    estimate.total =
      typeof estimate.total === "number" && Number.isFinite(estimate.total) ? estimate.total : 0;
    estimate.isEmpty = typeof estimate.isEmpty === "boolean" ? estimate.isEmpty : false;
    out.estimate = estimate;
  }

  if (Array.isArray(raw.deliverables)) {
    out.deliverables = raw.deliverables.filter(
      (group): group is DeliverableGroup =>
        !!group &&
        typeof group === "object" &&
        Array.isArray((group as { items?: unknown }).items) &&
        // A group with no usable items yields no events; dropping it lets the
        // DEFAULT_EVENTS fallback kick in instead of an empty schedule.
        (group as { items?: unknown[] }).items!.some(
          (it) => !!it && typeof it === "object",
        ),
    );
  }

  return out;
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
  estimateData: string;
}): QuotationData {
  const parsed = parseEstimateData(lead.estimateData) ?? {};
  const clean = sanitizeParsedEstimate(parsed);
  const estimate = clean.estimate;
  const state = clean.state;
  const deliverables = clean.deliverables;
  const estimatedDate =
    typeof state?.estimatedDate === "string" && ESTIMATED_DATE_RE.test(state.estimatedDate)
      ? state.estimatedDate
      : "";
  const total = estimate && !estimate.isEmpty ? estimate.total : 0;

  // Derive the event schedule from the estimate items grouped by sub-event.
  let events: QuoteEvent[] = [];
  if (estimate && estimate.items.length > 0) {
    const bySub = new Map<string, { label: string; value: number }[]>();
    for (const item of estimate.items) {
      // Album is a line item, not an event — keep it out of the schedule.
      if (item.group === "Albums") continue;
      const subName = item.detail ?? "";
      if (!bySub.has(subName)) bySub.set(subName, []);
      bySub.get(subName)!.push({ label: String(item.label ?? ""), value: item.value });
    }
    events = [...bySub.entries()].map(([name, items], i) => ({
      id: `ev-${i}`,
      name: name.toUpperCase(),
      date: prettyDate(estimatedDate),
      team: deriveTeam(items),
      icon: EVENT_ICON_KEYS[
        Object.keys(EVENT_ICON_KEYS).find((k) => name.toLowerCase().includes(k)) ?? "other"
      ],
    }));
  } else if (deliverables && deliverables.length > 0) {
    const names = [
      ...new Set(
        deliverables
          .flatMap((g) => g.items)
          .filter((it) => !!it && typeof it === "object" && typeof (it as Deliverable).subEvent === "string")
          .map((it) => (it as Deliverable).subEvent ?? ""),
      ),
    ].filter(Boolean);
    events = names.map((name, i) => ({
      id: `ev-${i}`,
      name: name.toUpperCase(),
      date: prettyDate(estimatedDate),
      team: "1 Photographer / 1 Videographer",
      icon: EVENT_ICON_KEYS[
        Object.keys(EVENT_ICON_KEYS).find((k) => name.toLowerCase().includes(k)) ?? "other"
      ],
    }));
  } else {
    events = DEFAULT_EVENTS.map((e) => ({
      ...e,
      date: prettyDate(estimatedDate),
    }));
  }

  const dateLabel = estimatedDate
    ? new Date(`${estimatedDate}T00:00:00`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return {
    quoteNumber: `PK-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    clientName: lead.clientName,
    clientPhone: lead.clientPhone,
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
        amount: formatMoney(total),
      },
    ],
    total: formatMoney(total),
    totalWords: amountWords(total),
    exclusionsNote:
      "This excludes travel, accommodation, food & any add-on services.",

    addonsIntro: "Additional offerings to make the most of your day",
    services: defaultServices(clean),

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
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    Array.isArray(v.services) &&
    Array.isArray(v.events) &&
    Array.isArray(v.charges) &&
    Array.isArray(v.timeline) &&
    Array.isArray(v.terms)
  );
}

/**
 * Data types for the 8-page admin quotation document.
 * Pure serializable data — kept separate from presentation.
 */

export type Market = "IN" | "US";

/** A single add-on service row on Page 05. */
export interface QuoteService {
  id: string;
  name: string;
  description?: string;
  /** Display string, e.g. "₹ 25,000", "Price on request". */
  price: string;
  included: boolean;
  /** Icon key resolved by the quote icon map. */
  icon: string;
  /** e.g. "per album", "per day". */
  unit?: string;
  category?: string;
}

/** One row of the Page 03 team schedule. */
export interface QuoteEvent {
  id: string;
  name: string;
  /** Display date, e.g. "Oct 28". Empty string shows an em dash. */
  date: string;
  /** e.g. "2 Photographers / 2 Videographers". */
  team: string;
  /** Icon key. */
  icon: string;
}

/** One row of the Page 06 delivery timeline. */
export interface QuoteTimelineRow {
  id: string;
  /** e.g. "Quick Edits" with optional detail "(20 Photos)". */
  output: string;
  outputDetail?: string;
  time: string;
  revisions: string;
}

/** One Page 07 terms entry. */
export interface QuoteTerm {
  id: string;
  icon: string;
  title: string;
  body: string;
}

/** A single charge row inside the Page 04 pricing panel. */
export interface QuoteCharge {
  id: string;
  label: string;
  amount: string;
}

export interface QuotationData {
  quoteNumber: string;
  clientName: string;
  clientPhone: string;
  market: Market;
  eventType: string;
  eventDate: string;

  /* Page 02 */
  aboutHeading: [string, string];
  aboutParagraphs: string[];

  /* Page 03 */
  greetingLabel: string;
  greetingName: string;
  planIntro: string;
  teamSubline: string;
  events: QuoteEvent[];

  /* Page 04 */
  deliverablesSideText: string[];
  photosTitle: string;
  photosApprox: string;
  photosBody: string;
  videosTitle: string;
  videosApprox: string;
  videosBody: string;
  charges: QuoteCharge[];
  total: string;
  totalWords: string;
  exclusionsNote: string;

  /* Page 05 (dynamic, may span continuation pages) */
  addonsIntro: string;
  services: QuoteService[];

  /* Page 06 */
  timeline: QuoteTimelineRow[];
  timelineNote: string;

  /* Page 07 */
  terms: QuoteTerm[];

  /* Page 08 */
  contactPhone: string;
  contactEmail: string;
  contactStudio: string;
}

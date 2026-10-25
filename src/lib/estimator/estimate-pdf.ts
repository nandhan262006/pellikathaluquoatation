/**
 * Client-side estimate PDF generation with jsPDF's vector text API.
 * Produces the same document as the old browser-print flow (EstimatePrint),
 * but downloads it directly — no print dialog — with crisp, selectable text.
 */
import { COUNTRY_CODE, formatMoneyPlain } from "./format";
import type {
  EstimateBreakdown,
  EventTemplate,
  EstimatorState,
} from "./types";

const INK = { r: 21, g: 24, b: 29 };
const GRAY = { r: 107, g: 114, b: 128 };
const LIGHT = { r: 156, g: 163, b: 175 };
const LINE = { r: 209, g: 211, b: 219 };

const MARGIN = 34; // 12mm in pt
const CONTENT_W = 595.28 - MARGIN * 2;
const LABEL_W = 83; // 110px in pt

let modulePromise: Promise<typeof import("jspdf").jsPDF> | null = null;
const fontCache = new Map<string, string>();

function loadModule(): Promise<typeof import("jspdf").jsPDF> {
  modulePromise ??= import("jspdf").then((m) => m.jsPDF);
  return modulePromise;
}

async function fontBase64(file: string): Promise<string> {
  if (fontCache.has(file)) return fontCache.get(file)!;
  const res = await fetch(`/fonts-ttf/${file}`);
  if (!res.ok) throw new Error("Failed to load font");
  const buf = await res.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  const b64 = btoa(binary);
  fontCache.set(file, b64);
  return b64;
}

/** Registers Geist 400/600/700 on the given doc instance; throws on failure. */
async function registerFonts(
  doc: import("jspdf").jsPDF,
): Promise<void> {
  for (const weight of ["400", "600", "700"] as const) {
    const file = `geist-normal-${weight}.ttf`;
    const b64 = await fontBase64(file);
    doc.addFileToVFS(file, b64);
    doc.addFont(file, "Geist", "normal", weight);
  }
}

function gray(doc: import("jspdf").jsPDF, c: typeof INK) {
  doc.setTextColor(c.r, c.g, c.b);
}

function hline(doc: import("jspdf").jsPDF, y: number): number {
  doc.setDrawColor(LINE.r, LINE.g, LINE.b);
  doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
  return y;
}

export interface EstimatePdfInput {
  state: EstimatorState;
  estimate: EstimateBreakdown;
  template: EventTemplate;
  deliverableTexts: string[];
}

export async function buildEstimatePdfBlob(
  input: EstimatePdfInput,
): Promise<Blob> {
  const JsPDF = await loadModule();
  const doc = new JsPDF({ unit: "pt", format: "a4" });
  await registerFonts(doc);
  const { state, estimate, template, deliverableTexts } = input;

  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const estimatedDateDisplay = state.estimatedDate
    ? new Date(state.estimatedDate + "T00:00:00").toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;
  const subEventNames = state.selectedSubEvents.map(
    (id) => template.subEvents.find((s) => s.id === id)?.name ?? id,
  );

  let y = MARGIN + 6;
  const setFont = (
    size: number,
    weight: "400" | "600" | "700" = "400",
    color: typeof INK = INK,
  ) => {
    doc.setFont("Geist", "normal", weight);
    doc.setFontSize(size);
    gray(doc, color);
  };

  // Header
  setFont(15, "700");
  doc.text("Pellikathalu", MARGIN, y);
  setFont(6.75, "400", LIGHT);
  doc.text(today, MARGIN + CONTENT_W, y, { align: "right" });
  y += 10;
  setFont(7.5, "400", GRAY);
  doc.text("Event Cost Estimate", MARGIN, y);
  y = hline(doc, y + 10) + 12;

  const kvRow = (label: string, value: string, size = 8.25) => {
    setFont(size, "400", GRAY);
    doc.text(label, MARGIN, y);
    setFont(size, "400", INK);
    const lines = doc.splitTextToSize(value, CONTENT_W - LABEL_W - 6);
    doc.text(lines, MARGIN + LABEL_W, y);
    y += 10 + (lines.length - 1) * 9.5;
  };

  const section = (title: string) => {
    setFont(8.25, "700");
    doc.text(title.toUpperCase(), MARGIN, y);
    y += 12;
  };

  section("Client details");
  kvRow("Name", state.clientName);
  kvRow("Phone", `${COUNTRY_CODE} ${state.clientPhone}`);
  if (estimatedDateDisplay) kvRow("Estimated date", estimatedDateDisplay);
  y = hline(doc, y + 4) + 12;

  section("Event details");
  kvRow("Event type", template.name);
  kvRow(
    "Sub-events",
    subEventNames.length > 0 ? subEventNames.join(", ") : "None selected",
  );
  y = hline(doc, y + 4) + 12;

  section("Price breakdown");

  // Group by sub-event -> category, mirroring EstimatePrint.
  const subMap = new Map<string, Map<string, typeof estimate.items>>();
  const subOrder: string[] = [];
  for (const item of estimate.items) {
    const subName = item.detail ?? "";
    if (!subMap.has(subName)) {
      subMap.set(subName, new Map());
      subOrder.push(subName);
    }
    const cats = subMap.get(subName)!;
    if (!cats.has(item.group)) cats.set(item.group, []);
    cats.get(item.group)!.push(item);
  }

  for (const subName of subOrder) {
    setFont(6.75, "700", LIGHT);
    doc.text(subName.toUpperCase(), MARGIN, y);
    y += 11;
    for (const [cat, items] of subMap.get(subName)!.entries()) {
      setFont(6.75, "700", GRAY);
      doc.text(cat.toUpperCase(), MARGIN + 6, y);
      y += 10;
      for (const item of items) {
        setFont(8.25, "400", INK);
        const labelLines = doc.splitTextToSize(
          item.label,
          CONTENT_W - 60 - 6,
        );
        const rowH = 10 + (labelLines.length - 1) * 9.5;
        if (y + rowH > 790) {
          doc.addPage();
          y = MARGIN + 12;
        }
        doc.text(labelLines, MARGIN, y);
        setFont(8.25, "700", INK);
        doc.text(formatMoneyPlain(item.value), MARGIN + CONTENT_W - 4, y, {
          align: "right",
        });
        y += rowH + 3;
      }
      y += 2;
    }
    y += 4;
  }

  // Total box
  if (y > 660) {
    doc.addPage();
    y = MARGIN + 12;
  }
  const boxH = 52;
  doc.setFillColor(INK.r, INK.g, INK.b);
  doc.roundedRect(MARGIN, y, CONTENT_W, boxH, 4, 4, "F");
  setFont(6.75, "400", LIGHT);
  doc.text("ESTIMATED TOTAL (APPROXIMATE)", MARGIN + 14, y + 20);
  setFont(15, "700", { r: 255, g: 255, b: 255 });
  doc.text(formatMoneyPlain(estimate.total), MARGIN + 14, y + 40);
  y += boxH + 22;

  // Deliverables
  if (deliverableTexts.length > 0) {
    y = hline(doc, y) + 12;
    section("What you'll receive");
    setFont(6.75, "400", INK);
    for (const text of deliverableTexts) {
      const lines = doc.splitTextToSize(text, CONTENT_W - 14);
      if (y + lines.length * 9 > 790) {
        doc.addPage();
        y = MARGIN + 12;
      }
      doc.setFillColor(INK.r, INK.g, INK.b);
      doc.circle(MARGIN + 2, y - 2, 1.1, "F");
      doc.text(lines, MARGIN + 10, y);
      y += lines.length * 9 + 4;
    }
    y += 8;
  }

  // Disclaimer + thanks
  if (y > 730) {
    doc.addPage();
    y = MARGIN + 12;
  }
  setFont(6, "400", LIGHT);
  const disclaimer = doc.splitTextToSize(
    "Disclaimer: This is only an approximate estimate. The final quotation may vary depending on event duration, location, travel, venue restrictions and custom requirements. Please contact Pellikathalu for a detailed, finalised quote.",
    CONTENT_W,
  );
  doc.text(disclaimer, MARGIN, y);
  y += disclaimer.length * 8 + 10;
  setFont(6, "400", LIGHT);
  doc.text(
    "Thank you for considering Pellikathalu.",
    MARGIN + CONTENT_W / 2,
    y,
    { align: "center" },
  );

  return doc.output("blob");
}

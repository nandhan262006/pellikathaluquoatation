"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useEstimator } from "@/lib/estimator/state-provider";
import { formatMoneyPlain, COUNTRY_CODES } from "@/lib/estimator/format";

const noopSubscribe = () => () => {};
/** False on the server & hydration render, true afterwards — safe portal gate. */
const useMounted = () => useSyncExternalStore(noopSubscribe, () => true, () => false);

/**
 * Print-ready HTML estimate document, portaled directly to <body>.
 * The browser print flow (Save as PDF) replaces the old server-rendered
 * @react-pdf pipeline — instant, no network round-trip, no cold starts.
 */
export function EstimatePrint() {
  const mounted = useMounted();
  const { state, estimate, deliverableTexts, template } = useEstimator();

  if (!mounted || estimate.isEmpty || !template) return null;

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

  // Group estimate items by sub-event → category
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

  return createPortal(
    <div className="estimate-print-root">
      <div className="mx-auto flex max-w-[680px] flex-col bg-white px-[2mm] py-[2mm] text-[11px] leading-relaxed text-[#1a1a1a]">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[20px] font-bold text-[#15181d]">Pellikathalu</div>
            <div className="mt-0.5 text-[10px] text-[#6b7280]">Event Cost Estimate</div>
          </div>
          <div className="text-right text-[9px] text-[#9ca3af]">{today}</div>
        </div>

        <hr className="my-2 border-[#d1d5db]" />

        {/* Client details */}
        <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[#15181d]">
          Client details
        </div>
        <div className="mb-0.5 flex">
          <span className="w-[110px] text-[#6b7280]">Name</span>
          <span>{state.clientName}</span>
        </div>
        <div className="mb-0.5 flex">
          <span className="w-[110px] text-[#6b7280]">Phone</span>
          <span>
            {COUNTRY_CODES[state.market]} {state.clientPhone}
          </span>
        </div>
        {estimatedDateDisplay && (
          <div className="mb-0.5 flex">
            <span className="w-[110px] text-[#6b7280]">Estimated date</span>
            <span>{estimatedDateDisplay}</span>
          </div>
        )}

        <hr className="my-2 border-[#d1d5db]" />

        {/* Event details */}
        <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[#15181d]">
          Event details
        </div>
        <div className="mb-0.5 flex">
          <span className="w-[110px] text-[#6b7280]">Event type</span>
          <span>{template.name}</span>
        </div>
        <div className="mb-0.5 flex">
          <span className="w-[110px] text-[#6b7280]">Sub-events</span>
          <span>{subEventNames.length > 0 ? subEventNames.join(", ") : "None selected"}</span>
        </div>

        <hr className="my-2 border-[#d1d5db]" />

        {/* Price breakdown */}
        <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[#15181d]">
          Price breakdown
        </div>
        {subOrder.map((subName) => (
          <div key={subName} className="avoid-break">
            <div className="mt-2 mb-1 text-[9px] font-bold uppercase text-[#9ca3af]">{subName}</div>
            {[...subMap.get(subName)!.entries()].map(([cat, items]) => (
              <div key={cat} className="avoid-break">
                <div className="mb-0.5 ml-2 text-[9px] font-bold uppercase text-[#6b7280]">{cat}</div>
                {items.map((item) => (
                  <div key={item.id} className="avoid-break mb-1 flex items-start justify-between pr-1">
                    <span className="flex-1 pr-3">{item.label}</span>
                    <span className="text-right font-bold">
                      {formatMoneyPlain(item.value, state.market)}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}

        {/* Total */}
        <div
          className="avoid-break mt-4 rounded-md bg-[#15181d] p-3.5"
          style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
        >
          <div className="text-[9px] text-[#9ca3af]">ESTIMATED TOTAL (APPROXIMATE)</div>
          <div className="mt-1 text-[20px] font-bold text-white">
            {formatMoneyPlain(estimate.total, state.market)}
          </div>
        </div>

        {/* Deliverables */}
        {deliverableTexts.length > 0 && (
          <>
            <hr className="my-2 border-[#d1d5db]" />
            <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[#15181d]">
              What you&apos;ll receive
            </div>
            <ul className="mb-2 flex flex-col gap-1.5">
              {deliverableTexts.map((text, i) => (
                <li key={i} className="avoid-break flex items-start gap-2 text-[9px] leading-normal">
                  <span className="w-3 shrink-0 text-[#15181d]">•</span>
                  <span className="flex-1">{text}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        <p className="avoid-break mt-4 text-[8px] leading-snug text-[#9ca3af]">
          Disclaimer: This is only an approximate estimate. The final quotation may vary depending
          on event duration, location, travel, venue restrictions and custom requirements. Please
          contact Pellikathalu for a detailed, finalised quote.
        </p>

        <p className="avoid-break mt-3 text-center text-[8px] text-[#9ca3af]">
          Thank you for considering Pellikathalu.
        </p>
      </div>
    </div>,
    document.body,
  );
}

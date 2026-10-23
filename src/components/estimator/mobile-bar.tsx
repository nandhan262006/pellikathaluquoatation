"use client";

import { useState, useCallback } from "react";
import { X, ReceiptIndianRupee } from "lucide-react";
import { formatMoney } from "@/lib/estimator/format";
import { useEstimator } from "@/lib/estimator/state-provider";
import { EstimatePanel } from "./estimate-panel";

export function MobileEstimateBar() {
  const { estimate, template } = useEstimator();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  const total = estimate.isEmpty ? null : estimate.total;
  const eventName = template?.name ?? "";

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 250);
  }, []);

  return (
    <div className="lg:hidden">
      {/* Floating trigger */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed top-16 right-4 z-50 flex flex-col gap-0.5 rounded-xl border bg-background px-3 py-2 shadow-lg"
        >
          <div className="flex items-center gap-1.5">
            <ReceiptIndianRupee className="size-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground leading-none">Estimate</span>
          </div>
          {total !== null ? (
            <span className="text-xs font-semibold tabular-nums leading-tight">
              {formatMoney(total)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground leading-tight">—</span>
          )}
          {eventName && (
            <span className="text-[10px] text-muted-foreground max-w-[120px] truncate leading-tight">
              {eventName}
            </span>
          )}
        </button>
      )}

      {/* Overlay */}
      {open && (
        <div
          className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-250 ${closing ? "opacity-0" : "opacity-100"}`}
          onClick={handleClose}
        />
      )}

      {/* Sidebar */}
      {open && (
        <div
          className={`fixed inset-y-0 right-0 z-50 flex w-[min(85vw,400px)] flex-col bg-background shadow-2xl transition-transform duration-250 ease-out ${closing ? "translate-x-full" : "translate-x-0"}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <ReceiptIndianRupee className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Your Estimate</span>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="flex size-8 items-center justify-center rounded-full hover:bg-muted"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <EstimatePanel />
          </div>

          {/* Footer */}
          {total !== null && (
            <div className="border-t px-4 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estimated Total</span>
                <span className="text-lg font-semibold tabular-nums">
                  {formatMoney(total)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

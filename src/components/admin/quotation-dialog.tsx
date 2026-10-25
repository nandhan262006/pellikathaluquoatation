"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { QuotationDocument } from "@/components/quote/quotation-document";
import { buildQuotationData, isQuotationData } from "@/lib/quote/prefill";
import { saveQuotation } from "@/lib/admin/quote-actions";
import type { QuotationData } from "@/lib/quote/types";
import { QuoteEditor } from "./quote-editor";
import { Download, Loader2, Minus, Plus, Save, X } from "lucide-react";
import { toast } from "sonner";

export interface QuotationLead {
  id: number;
  clientName: string;
  clientPhone: string;
  eventType: string;
  eventName: string;
  estimateData: string;
  quotationData: string;
}

const ZOOMS = [0.5, 0.65, 0.8, 1];

export function QuotationDialog({ lead, onClose }: { lead: QuotationLead; onClose: () => void }) {
  const initial: QuotationData = useMemo(() => {
    if (lead.quotationData) {
      try {
        const parsed = JSON.parse(lead.quotationData);
        if (isQuotationData(parsed)) return parsed;
      } catch {
        /* fall through to prefill */
      }
    }
    return buildQuotationData(lead);
  }, [lead]);

  const [data, setData] = useState<QuotationData>(initial);
  const [zoom, setZoom] = useState(0.65);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [dirty, setDirty] = useState(false);

  const update = (next: QuotationData) => {
    setData(next);
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await saveQuotation(lead.id, data);
      if (res?.success) {
        toast.success("Quotation saved");
        setDirty(false);
      } else {
        toast.error("Failed to save quotation");
      }
    } catch {
      toast.error("Failed to save quotation");
    } finally {
      setSaving(false);
    }
  };

  // Unsaved edits must not be lost in the PDF: persist first, then render
  // the saved quotation server-side via headless Chromium.
  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      if (dirty) {
        const res = await saveQuotation(lead.id, data);
        if (res?.success) {
          setDirty(false);
        } else {
          throw new Error("save failed");
        }
      }
      const res = await fetch(`/api/quote-pdf?id=${lead.id}`);
      if (!res.ok) throw new Error(`pdf failed: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${lead.clientName.replace(/[^a-zA-Z0-9]+/g, "-") || "Client"}-Quotation.pdf`;
      a.click();
      // Click handlers fetch the blob URL synchronously; Safari can be
      // flaky if it is revoked on the next tick instead of a small delay.
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch {
      toast.error("Failed to generate PDF. Save your changes and try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#23201b]">
      {/* Header bar */}
      <header className="flex items-center justify-between border-b border-[#3a362f] px-4 py-2.5 text-[#f3ecdd]">
        <div className="flex items-baseline gap-3">
          <h2 className="font-serif text-lg tracking-wide">Quotation</h2>
          <span className="text-xs text-[#a89e8c]">
            {lead.clientName} · {lead.eventName || lead.eventType}
            {dirty && <span className="ml-2 text-[#d89a7e]">— unsaved</span>}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-[#4a453c] bg-transparent text-[#f3ecdd] hover:bg-[#3a362f] hover:text-[#f3ecdd]"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            {downloading ? "Preparing…" : "Download PDF"}
          </Button>
          <Button
            size="sm"
            className="bg-[#b58a50] text-[#23201b] hover:bg-[#c9a86a]"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close quotation"
            className="text-[#f3ecdd] hover:bg-[#3a362f] hover:text-[#f3ecdd]"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Left: live preview */}
        <div className="relative min-w-0 flex-1 overflow-auto bg-[#37332c]">
          <div className="pointer-events-none sticky top-0 z-10 flex justify-end p-2">
            <div className="pointer-events-auto flex items-center gap-1 rounded bg-[#23201b]/80 p-1 text-[#f3ecdd]">
              <Minus
                className="size-3.5 cursor-pointer"
                onClick={() => setZoom((z) => ZOOMS[Math.max(0, ZOOMS.indexOf(z) - 1)] ?? z)}
              />
              <span className="w-9 text-center text-[10px]">{Math.round(zoom * 100)}%</span>
              <Plus
                className="size-3.5 cursor-pointer"
                onClick={() => setZoom((z) => ZOOMS[Math.min(ZOOMS.length - 1, ZOOMS.indexOf(z) + 1)] ?? z)}
              />
            </div>
          </div>
          <div style={{ zoom }} className="origin-top">
            <QuotationDocument data={data} />
          </div>
        </div>

        {/* Right: edit tables */}
        <aside className="w-[430px] shrink-0 overflow-y-auto border-l border-[#3a362f] bg-white">
          <QuoteEditor data={data} onChange={update} />
        </aside>
      </div>
    </div>
  );
}

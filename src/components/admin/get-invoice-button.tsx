"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { QuotationDialog, type QuotationLead } from "./quotation-dialog";

export function GetInvoiceButton({ lead }: { lead: QuotationLead }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
      >
        <FileText className="size-3.5" />
        Get Invoice
      </button>
      {open && <QuotationDialog lead={lead} onClose={() => setOpen(false)} />}
    </>
  );
}

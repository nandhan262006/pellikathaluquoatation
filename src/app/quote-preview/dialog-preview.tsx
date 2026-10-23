"use client";

import { QuotationDialog } from "@/components/admin/quotation-dialog";

export function DialogPreview() {
  return (
    <QuotationDialog
      lead={{
        id: 0,
        clientName: "Kavya",
        clientPhone: "8522888119",
        eventType: "wedding",
        eventName: "Wedding",
        estimateData: "",
        quotationData: "",
      }}
      onClose={() => {}}
    />
  );
}

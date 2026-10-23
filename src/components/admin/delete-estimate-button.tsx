"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteEstimateLead } from "@/lib/estimator/lead-actions";

export function DeleteEstimateButton({ id }: { id: number }) {
  const [deleted, setDeleted] = useState(false);
  const [pending, setPending] = useState(false);

  if (deleted) return null;

  async function handleClick() {
    if (pending) return;
    setPending(true);
    setDeleted(true);
    try {
      const res = await deleteEstimateLead(id);
      if (res?.success) {
        toast.success("Estimate deleted");
      } else {
        setDeleted(false);
        toast.error("Failed to delete estimate");
      }
    } catch {
      setDeleted(false);
      toast.error("Failed to delete estimate");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      <Trash2 className="size-3" />
      Delete
    </button>
  );
}

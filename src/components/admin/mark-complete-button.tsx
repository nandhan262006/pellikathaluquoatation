"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { markEstimateComplete } from "@/lib/estimator/lead-actions";

export function MarkCompleteButton({ id, currentStatus }: { id: number; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [pending, setPending] = useState(false);

  if (status === "completed") return null;

  async function handleClick() {
    if (pending) return;
    setPending(true);
    setStatus("completed");
    try {
      const res = await markEstimateComplete(id);
      if (res?.success) {
        toast.success("Marked as completed");
      } else {
        setStatus(currentStatus);
        toast.error("Failed to mark complete");
      }
    } catch {
      setStatus(currentStatus);
      toast.error("Failed to mark complete");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
    >
      <Check className="size-3" />
      Mark Complete
    </button>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { setAdminMarket } from "@/lib/admin/market-actions";
import type { Market } from "@/lib/estimator/types";

const OPTIONS: { market: Market; code: string; label: string }[] = [
  { market: "US", code: "+1", label: "US" },
  { market: "IN", code: "+91", label: "India" },
];

export function MarketToggle({ initial }: { initial: Market }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const select = (market: Market) => {
    startTransition(async () => {
      await setAdminMarket(market);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Market</span>
      <div className="inline-flex rounded-lg border border-border p-0.5" role="radiogroup" aria-label="Market">
        {OPTIONS.map((o) => {
          const selected = initial === o.market;
          return (
            <button
              key={o.market}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={pending}
              onClick={() => select(o.market)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60",
                selected
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="tabular-nums">{o.code}</span>
              <span>{o.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

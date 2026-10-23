"use client";

import { User, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEstimator } from "@/lib/estimator/state-provider";
import { COUNTRY_CODE } from "@/lib/estimator/format";

export function ClientInfoStep() {
  const { state, dispatch } = useEstimator();

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold">
          Let&apos;s get started
        </h1>
        <p className="text-sm text-muted-foreground">
          Tell us a bit about yourself so we can follow up with your estimate.
        </p>
      </header>

      <div className="flex flex-col gap-4 rounded-xl border border-border p-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="clientName" className="flex items-center gap-2 text-sm font-medium">
            <User className="size-4 text-muted-foreground" />
            Your Name
            <span className="text-destructive">*</span>
          </label>
          <Input
            id="clientName"
            required
            placeholder="Enter your full name"
            value={state.clientName}
            onChange={(e) =>
              dispatch({
                type: "SET_CLIENT_INFO",
                field: "clientName",
                value: e.target.value,
              })
            }
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="clientPhone" className="flex items-center gap-2 text-sm font-medium">
            <Phone className="size-4 text-muted-foreground" />
            Phone Number
            <span className="text-destructive">*</span>
          </label>
          <div className="flex items-stretch overflow-hidden rounded-lg border border-input bg-background focus-within:ring-1 focus-within:ring-primary">
            <span className="flex items-center border-r bg-muted/50 px-3 text-sm tabular-nums text-muted-foreground">
              {COUNTRY_CODE}
            </span>
            <Input
              id="clientPhone"
              type="tel"
              inputMode="numeric"
              required
              maxLength={10}
              placeholder="10-digit phone number"
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              value={state.clientPhone}
              onChange={(e) =>
                dispatch({
                  type: "SET_CLIENT_INFO",
                  field: "clientPhone",
                  value: e.target.value.replace(/\D/g, "").slice(0, 10),
                })
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}

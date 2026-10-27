"use client";

import { useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, SkipForward } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { STEPS } from "@/lib/estimator/state";
import { EstimatorProvider, useEstimator } from "@/lib/estimator/state-provider";
import type { EventTemplate } from "@/lib/estimator/types";
import { saveEstimateLead } from "@/lib/estimator/lead-actions";
import { EstimatePanel } from "./estimate-panel";
import { MobileEstimateBar } from "./mobile-bar";
import { StepNav } from "./step-nav";
import { AlbumStep } from "./steps/album-step";
import { CoverageOnlyStep } from "./steps/coverage-only-step";
import { AddOnStep } from "./steps/add-on-step";
import { DeliverablesStep } from "./steps/deliverables-step";
import { EstimateStep } from "./steps/estimate-step";
import { DownloadStep } from "./steps/download-step";
import { ClientInfoStep } from "./steps/client-info-step";
import { EventTypeStep } from "./steps/event-type-step";
import { SubEventsStep } from "./steps/sub-events-step";

export function Estimator({ templates }: { templates: EventTemplate[] }) {
  return (
    <EstimatorProvider templates={templates}>
      <EstimatorShell />
    </EstimatorProvider>
  );
}

const SKIPPABLE_STEPS = new Set([3, 4, 5]);

const SAVE_FAILED_COPY =
  "We couldn't save your estimate. Please try again — or call us at 8522888119 so we can help you book.";

function safeSessionGet(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSessionSet(key: string, value: string): void {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Private-browsing/quota limits only cost us reload dedupe.
  }
}

function safeSessionRemove(key: string): void {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    /* no-op */
  }
}

const SAVED_LEAD_STORAGE_KEY = "pellikathalu-saved-lead";
const TOAST_THROTTLE_MS = 30_000;

type LeadSavePayload = Parameters<typeof saveEstimateLead>[0];
type LeadSaveRequest = { key: string; payload: LeadSavePayload };

function doSave(
  req: LeadSaveRequest,
  refs: {
    savedDataRef: React.RefObject<string | null>;
    inFlightRef: React.RefObject<boolean>;
    pendingKeyRef: React.RefObject<LeadSaveRequest | null>;
    lastFailToastRef: React.RefObject<number>;
  },
) {
  refs.inFlightRef.current = true;
  const notifyFailure = () => {
    refs.savedDataRef.current = null;
    // Don't stack toasts when a client is offline and tweaks several fields.
    if (Date.now() - refs.lastFailToastRef.current > TOAST_THROTTLE_MS) {
      refs.lastFailToastRef.current = Date.now();
      toast.error(SAVE_FAILED_COPY);
    }
  };
  saveEstimateLead(req.payload)
    .then((res) => {
      if (res?.success) {
        refs.savedDataRef.current = req.key;
        safeSessionSet(SAVED_LEAD_STORAGE_KEY, req.key);
      } else {
        notifyFailure();
      }
    })
    .catch(notifyFailure)
    .finally(() => {
      refs.inFlightRef.current = false;
      // A newer key queued while this save was in flight must not be lost.
      const next = refs.pendingKeyRef.current;
      refs.pendingKeyRef.current = null;
      if (next && next.key !== refs.savedDataRef.current) doSave(next, refs);
    });
}

function EstimatorShell() {
  const { state, dispatch, estimate, deliverables, template } = useEstimator();
  const lastStep = STEPS.length - 1;
  const savedDataRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);
  const pendingKeyRef = useRef<LeadSaveRequest | null>(null);
  const lastFailToastRef = useRef(0);
  const refsRef = useRef({ savedDataRef, inFlightRef, pendingKeyRef, lastFailToastRef });

  const attemptSave = useCallback((req: LeadSaveRequest) => {
    doSave(req, refsRef.current);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let scheduled: LeadSaveRequest | null = null;

    // A reset clears eventTypeId — clear the dedupe markers with it so a
    // re-completed identical estimate is saved again as a fresh lead.
    if (!state.eventTypeId) {
      savedDataRef.current = null;
      safeSessionRemove(SAVED_LEAD_STORAGE_KEY);
    }

    // Never auto-save a zero-value lead: steps 3–5 are skippable, and an
    // empty estimate is not a real enquiry the studio can work from.
    if (
      state.step >= 7 &&
      state.clientName &&
      state.clientPhone &&
      state.eventTypeId &&
      template &&
      !estimate.isEmpty
    ) {
      // Capture late-validated fields so the narrow types survive into the
      // async save callbacks.
      const clientName = state.clientName;
      const clientPhone = state.clientPhone;
      const eventTypeId = state.eventTypeId;
      // Dedupe on quote content only — NOT on raw state, which includes
      // state.step (moving Estimate -> Download would otherwise re-save an
      // identical lead and create duplicates).
      const saveKey = JSON.stringify([
        clientName,
        clientPhone,
        eventTypeId,
        template.id,
        state.selectedSubEvents,
        state.subEventConfig,
        state.album,
        estimate.total,
      ]);
      const leadPayload: LeadSavePayload = {
        clientName,
        clientPhone,
        eventType: eventTypeId,
        eventName: template.name,
        estimateData: JSON.stringify({ state, estimate, deliverables }),
      };
      // The in-memory marker dedupes within this mount; sessionStorage
      // dedupes across reloads in the same tab.
      if (savedDataRef.current !== saveKey) {
        if (safeSessionGet(SAVED_LEAD_STORAGE_KEY) === saveKey) {
          savedDataRef.current = saveKey;
        } else if (!inFlightRef.current) {
          scheduled = { key: saveKey, payload: leadPayload };
          timer = setTimeout(() => {
            if (scheduled) attemptSave(scheduled);
          }, 700);
        } else {
          pendingKeyRef.current = { key: saveKey, payload: leadPayload };
        }
      }
    }

    return () => {
      // Flush a scheduled save on unmount instead of dropping it — the
      // debounce otherwise opens a small lost-lead window.
      if (timer && scheduled) {
        clearTimeout(timer);
        attemptSave(scheduled);
      }
    };
  }, [state, state.step, estimate, deliverables, template, attemptSave]);

  const canProceed = (() => {
    switch (state.step) {
      case 0:
        // The server requires exactly 10 digits — gate here so the lead is
        // never silently lost after the client passes through the flow.
        return (
          state.clientName.trim().length > 0 &&
          state.clientPhone.replace(/\D/g, "").length === 10
        );
      case 1:
        return !!state.eventTypeId;
      case 2:
        return state.selectedSubEvents.length > 0;
      case 3: {
        return state.selectedSubEvents.some((id) => {
          const cfg = state.subEventConfig[id];
          return cfg && (cfg.coverage.length > 0 || cfg.reels > 0);
        });
      }
      default:
        return true;
    }
  })();

  const next = () =>
    dispatch({ type: "SET_STEP", step: Math.min(lastStep, state.step + 1) });
  const prev = () =>
    dispatch({ type: "SET_STEP", step: Math.max(0, state.step - 1) });
  const skip = () =>
    dispatch({ type: "SET_STEP", step: Math.min(lastStep, state.step + 1) });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex items-center text-sm font-medium text-foreground hover:text-muted-foreground"
          >
            <Image
              src="/logo.webp"
              alt="Pellikathalu"
              width={226}
              height={36}
              className="h-9 w-auto"
            />
          </Link>
          <div className="flex flex-col leading-none text-right">
            <span className="text-xs text-muted-foreground">
              Event Cost Estimator
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl min-h-0 flex-1 px-4 py-2 overflow-y-auto">
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:gap-8">
          <div className="min-w-0 overflow-hidden">
            <StepNav />
            <div className="mt-6">
              {state.step === 0 && <ClientInfoStep />}
              {state.step === 1 && <EventTypeStep />}
              {state.step === 2 && <SubEventsStep />}
              {state.step === 3 && <CoverageOnlyStep />}
              {state.step === 4 && <AlbumStep />}
              {state.step === 5 && <AddOnStep />}
              {state.step === 6 && <DeliverablesStep />}
              {state.step === 7 && <EstimateStep />}
              {state.step === 8 && <DownloadStep />}
            </div>

            <div className="mt-8 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {state.step > 0 && (
                  <Button variant="outline" onClick={prev} className="rounded-[9999px]">
                    <ArrowLeft className="mr-1.5 size-4" />
                    Previous
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {SKIPPABLE_STEPS.has(state.step) && state.step < lastStep && (
                  <Button variant="ghost" onClick={skip} className="rounded-[9999px]">
                    Skip
                    <SkipForward className="ml-1.5 size-4" />
                  </Button>
                )}
                {state.step < lastStep && (
                  <Button onClick={next} disabled={!canProceed} className="rounded-[9999px]">
                    Next
                    <ArrowRight className="ml-1.5 size-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-xl border bg-card p-4">
              <EstimatePanel />
            </div>
          </aside>
        </div>
      </main>

      <MobileEstimateBar />
    </div>
  );
}

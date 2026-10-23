"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { defaultSubEventsFor } from "@/lib/estimator/state";
import { useEstimator } from "@/lib/estimator/state-provider";
import { Icon } from "../icons";

export function EventTypeStep() {
  const { templates, state, dispatch } = useEstimator();
  const [expanded, setExpanded] = useState<string | null>(null);
  const selectedId = state.eventTypeId;

  const select = (id: string) => {
    const template = templates.find((t) => t.id === id);
    if (!template) return;
    dispatch({
      type: "SET_EVENT_TYPE",
      eventTypeId: id,
      defaultSubEvents: defaultSubEventsFor(template),
      albumBasePages: template.album.basePages,
    });
    setExpanded(id);
  };

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold">
          What are you celebrating?
        </h1>
        <p className="text-sm text-muted-foreground">
          Pick an event type to load the relevant package template.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {templates.map((t) => {
          const isExpanded = expanded === t.id;
          const isSelected = selectedId === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => select(t.id)}
              aria-expanded={isExpanded}
              className={cn(
                "relative inline-flex items-center gap-2 rounded-[9999px] border px-4 py-2 text-sm transition-all duration-300",
                isExpanded
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : isSelected
                    ? "border-primary/40 bg-primary/5"
                    : "border-border hover:border-foreground/30 hover:shadow-sm",
              )}
            >
              <div
                className={cn(
                  "flex size-5 items-center justify-center rounded-full transition-colors duration-300",
                  isExpanded
                    ? "bg-primary/15 text-primary"
                    : isSelected
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground",
                )}
              >
                <Icon name={t.icon} className="size-3" />
              </div>
              <span className="font-medium">{t.name}</span>
              {isSelected && !isExpanded && (
                <span className="ml-1 size-1.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {(() => {
        const t = expanded ? templates.find((tpl) => tpl.id === expanded) : null;
        if (!t || !(t.description || t.tagline)) return null;
        return (
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t.description || t.tagline}
            </p>
          </div>
        );
      })()}
    </section>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { QuotationData, QuoteEvent, QuoteService } from "@/lib/quote/types";
import { Plus, Trash2 } from "lucide-react";

/** Derive a fitting icon key from free text; keeps admin edits hands-off. */
export function iconFor(text: string, fallback = "rings"): string {
  const t = text.toLowerCase();
  const table: [RegExp, string][] = [
    [/album|book/, "album"],
    [/screen|led|monitor/, "screen"],
    [/stream|live/, "stream"],
    [/drone/, "drone"],
    [/shoot|couple|pre-?wedding/, "couple"],
    [/social|media|chat|coverage/, "social"],
    [/camera|photo/, "camera"],
    [/video|film/, "video"],
    [/music|sangeet/, "music"],
    [/haldi/, "bowl"],
    [/mehendi|henna/, "henna"],
    [/kuthuru|bride/, "bride"],
    [/koduku|groom/, "groom"],
    [/plane|travel|trip/, "plane"],
    [/card|payment|pay/, "card"],
    [/gst|percent|tax|%/, "percent"],
    [/calendar|date|plan/, "calendar"],
    [/refund|cancel|advance/, "close"],
    [/phone|call/, "phone"],
    [/mail|email/, "mail"],
    [/location|studio|address/, "pin"],
    [/wedding|reception|engagement|ring/, "rings"],
  ];
  for (const [re, icon] of table) if (re.test(t)) return icon;
  return fallback;
}

interface EditorProps {
  data: QuotationData;
  onChange: (next: QuotationData) => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b pb-5">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

export function QuoteEditor({ data, onChange }: EditorProps) {
  const set = <K extends keyof QuotationData>(key: K, value: QuotationData[K]) =>
    onChange({ ...data, [key]: value });

  const setEvent = (i: number, patch: Partial<QuoteEvent>) => {
    const events = data.events.map((e, j) => {
      if (j !== i) return e;
      const next = { ...e, ...patch };
      if (patch.name !== undefined) next.icon = iconFor(next.name, "rings");
      return next;
    });
    set("events", events);
  };

  const setService = (i: number, patch: Partial<QuoteService>) => {
    const services = data.services.map((s, j) => {
      if (j !== i) return s;
      const next = { ...s, ...patch };
      if (patch.name !== undefined) next.icon = iconFor(next.name, "social");
      return next;
    });
    set("services", services);
  };

  return (
    <div className="flex flex-col gap-5 p-4">
      <Section title="Client & Quote">
        <Field label="Quote number">
          <Input value={data.quoteNumber} onChange={(e) => set("quoteNumber", e.target.value)} />
        </Field>
        <Field label="Client name">
          <Input value={data.clientName} onChange={(e) => set("clientName", e.target.value)} />
        </Field>
        <Field label="Client phone">
          <Input value={data.clientPhone} onChange={(e) => set("clientPhone", e.target.value)} />
        </Field>
        <Field label="Event type">
          <Input value={data.eventType} onChange={(e) => set("eventType", e.target.value)} />
        </Field>
        <Field label="Event date (display)">
          <Input value={data.eventDate} onChange={(e) => set("eventDate", e.target.value)} />
        </Field>
      </Section>

      <Section title="Our Story (Page 02)">
        {data.aboutParagraphs.map((p, i) => (
          <div key={i} className="flex items-start gap-2">
            <Textarea
              value={p}
              rows={3}
              onChange={(e) =>
                set(
                  "aboutParagraphs",
                  data.aboutParagraphs.map((x, j) => (j === i ? e.target.value : x)),
                )
              }
            />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Remove paragraph"
              onClick={() => set("aboutParagraphs", data.aboutParagraphs.filter((_, j) => j !== i))}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => set("aboutParagraphs", [...data.aboutParagraphs, ""])}
        >
          <Plus className="size-4" /> Add paragraph
        </Button>
      </Section>

      <Section title="Plan & Team (Page 03)">
        <Field label="Greeting name">
          <Input value={data.greetingName} onChange={(e) => set("greetingName", e.target.value)} />
        </Field>
        <Field label="Intro paragraph">
          <Textarea value={data.planIntro} rows={3} onChange={(e) => set("planIntro", e.target.value)} />
        </Field>
        <Field label="Team subline">
          <Input value={data.teamSubline} onChange={(e) => set("teamSubline", e.target.value)} />
        </Field>

        <div className="rounded border">
          <div className="grid grid-cols-[1fr_80px_1fr_32px] gap-1 bg-muted/50 p-2 text-[10px] font-medium uppercase text-muted-foreground">
            <span>Event</span>
            <span>Date</span>
            <span>Team</span>
            <span />
          </div>
          {data.events.map((ev, i) => (
            <div key={ev.id} className="grid grid-cols-[1fr_80px_1fr_32px] items-center gap-1 border-t p-1">
              <Input value={ev.name} onChange={(e) => setEvent(i, { name: e.target.value })} />
              <Input value={ev.date} onChange={(e) => setEvent(i, { date: e.target.value })} />
              <Input value={ev.team} onChange={(e) => setEvent(i, { team: e.target.value })} />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remove event"
                onClick={() => set("events", data.events.filter((_, j) => j !== i))}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <div className="border-t p-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                set("events", [
                  ...data.events,
                  { id: `ev-${Date.now()}`, name: "NEW EVENT", date: "", team: "1 Photographer / 1 Videographer", icon: "rings" },
                ])
              }
            >
              <Plus className="size-4" /> Add event
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Deliverables & Charges (Page 04)">
        <Field label="Photos headline">
          <Input value={data.photosApprox} onChange={(e) => set("photosApprox", e.target.value)} />
        </Field>
        <Field label="Photos body">
          <Textarea value={data.photosBody} rows={3} onChange={(e) => set("photosBody", e.target.value)} />
        </Field>
        <Field label="Videos headline">
          <Textarea value={data.videosApprox} rows={2} onChange={(e) => set("videosApprox", e.target.value)} />
        </Field>
        <Field label="Videos body">
          <Textarea value={data.videosBody} rows={3} onChange={(e) => set("videosBody", e.target.value)} />
        </Field>

        <div className="rounded border">
          <div className="grid grid-cols-[1fr_1fr_32px] gap-1 bg-muted/50 p-2 text-[10px] font-medium uppercase text-muted-foreground">
            <span>Charge label</span>
            <span>Amount</span>
            <span />
          </div>
          {data.charges.map((c, i) => (
            <div key={c.id} className="grid grid-cols-[1fr_1fr_32px] items-center gap-1 border-t p-1">
              <Input
                value={c.label}
                onChange={(e) =>
                  set("charges", data.charges.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))
                }
              />
              <Input
                value={c.amount}
                onChange={(e) =>
                  set("charges", data.charges.map((x, j) => (j === i ? { ...x, amount: e.target.value } : x)))
                }
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remove charge"
                onClick={() => set("charges", data.charges.filter((_, j) => j !== i))}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <div className="border-t p-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                set("charges", [...data.charges, { id: `ch-${Date.now()}`, label: "New Charge", amount: "₹ 0" }])
              }
            >
              <Plus className="size-4" /> Add charge row
            </Button>
          </div>
        </div>

        <Field label="Total (display)">
          <Input value={data.total} onChange={(e) => set("total", e.target.value)} />
        </Field>
        <Field label="Total in words">
          <Input value={data.totalWords} onChange={(e) => set("totalWords", e.target.value)} />
        </Field>
        <Field label="Exclusions note">
          <Input value={data.exclusionsNote} onChange={(e) => set("exclusionsNote", e.target.value)} />
        </Field>
      </Section>

      <Section title="Add-On Services (Page 05)">
        <Field label="Intro line">
          <Input value={data.addonsIntro} onChange={(e) => set("addonsIntro", e.target.value)} />
        </Field>

        <div className="rounded border">
          <div className="grid grid-cols-[1fr_1fr_60px_1fr_32px] gap-1 bg-muted/50 p-2 text-[10px] font-medium uppercase text-muted-foreground">
            <span>Service</span>
            <span>Price</span>
            <span>Incl.</span>
            <span>Unit / note</span>
            <span />
          </div>
          {data.services.map((s, i) => (
            <div key={s.id} className="grid grid-cols-[1fr_1fr_60px_1fr_32px] items-center gap-1 border-t p-1">
              <Input value={s.name} onChange={(e) => setService(i, { name: e.target.value })} />
              <Input value={s.price} onChange={(e) => setService(i, { price: e.target.value })} />
              <label className="flex items-center justify-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={s.included}
                  onChange={(e) => setService(i, { included: e.target.checked })}
                />
              </label>
              <Input value={s.unit ?? ""} onChange={(e) => setService(i, { unit: e.target.value })} />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remove service"
                onClick={() => set("services", data.services.filter((_, j) => j !== i))}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <div className="border-t p-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                set("services", [
                  ...data.services,
                  {
                    id: `svc-${Date.now()}`,
                    name: "New Service",
                    price: "Price on request",
                    included: false,
                    icon: "social",
                  },
                ])
              }
            >
              <Plus className="size-4" /> Add service
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Delivery Timeline (Page 06)">
        <div className="rounded border">
          <div className="grid grid-cols-[1fr_1fr_32px] gap-1 bg-muted/50 p-2 text-[10px] font-medium uppercase text-muted-foreground">
            <span>Output</span>
            <span>Timeline</span>
            <span />
          </div>
          {data.timeline.map((row, i) => (
            <div key={row.id} className="flex flex-col gap-1 border-t p-1">
              <div className="grid grid-cols-[1fr_1fr_32px] items-center gap-1">
                <Input
                  value={row.output}
                  onChange={(e) =>
                    set("timeline", data.timeline.map((x, j) => (j === i ? { ...x, output: e.target.value } : x)))
                  }
                />
                <Input
                  value={row.time}
                  onChange={(e) =>
                    set("timeline", data.timeline.map((x, j) => (j === i ? { ...x, time: e.target.value } : x)))
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove row"
                  onClick={() => set("timeline", data.timeline.filter((_, j) => j !== i))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="grid grid-cols-[1fr_1fr] gap-1">
                <Input
                  placeholder="Output detail (optional)"
                  value={row.outputDetail ?? ""}
                  onChange={(e) =>
                    set("timeline", data.timeline.map((x, j) => (j === i ? { ...x, outputDetail: e.target.value } : x)))
                  }
                />
                <Input
                  placeholder="Revisions"
                  value={row.revisions}
                  onChange={(e) =>
                    set("timeline", data.timeline.map((x, j) => (j === i ? { ...x, revisions: e.target.value } : x)))
                  }
                />
              </div>
            </div>
          ))}
          <div className="border-t p-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                set("timeline", [
                  ...data.timeline,
                  { id: `tl-${Date.now()}`, output: "New Output", time: "", revisions: "NA" },
                ])
              }
            >
              <Plus className="size-4" /> Add row
            </Button>
          </div>
        </div>
        <Field label="Timeline note">
          <Textarea value={data.timelineNote} rows={2} onChange={(e) => set("timelineNote", e.target.value)} />
        </Field>
      </Section>

      <Section title="Terms & Conditions (Page 07)">
        {data.terms.map((term, i) => (
          <div key={term.id} className="flex flex-col gap-1 rounded border p-2">
            <div className="flex items-center gap-1">
              <Input
                value={term.title}
                onChange={(e) =>
                  set("terms", data.terms.map((x, j) =>
                    j === i
                      ? { ...x, title: e.target.value, icon: iconFor(e.target.value, "calendar") }
                      : x,
                  ))
                }
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remove term"
                onClick={() => set("terms", data.terms.filter((_, j) => j !== i))}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
            <Textarea
              value={term.body}
              rows={2}
              onChange={(e) =>
                set("terms", data.terms.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)))
              }
            />
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            set("terms", [
              ...data.terms,
              { id: `term-${Date.now()}`, icon: "calendar", title: "New Term", body: "" },
            ])
          }
        >
          <Plus className="size-4" /> Add term
        </Button>
      </Section>

      <Section title="Contact (Page 08)">
        <Field label="Phone">
          <Input value={data.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} />
        </Field>
        <Field label="Email">
          <Input value={data.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
        </Field>
        <Field label="Studio / location">
          <Input value={data.contactStudio} onChange={(e) => set("contactStudio", e.target.value)} />
        </Field>
      </Section>
    </div>
  );
}

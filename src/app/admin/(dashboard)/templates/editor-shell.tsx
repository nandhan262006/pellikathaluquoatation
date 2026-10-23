"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  upsertTemplate,
  upsertSubEvent,
  deleteSubEvent,
  deleteTemplate,
  createOption,
  deleteOption,
} from "@/lib/admin/template-actions";
import type { OptionKind } from "@/lib/estimator/types";

interface SubEvent {
  id: number;
  subEventId: string;
  name: string;
  description: string;
  defaultSelected: number;
  maxReels: number | null;
  sortOrder: number;
  priceOverrides: string;
  templateId: number;
}

interface Template {
  id: number;
  typeId: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  isActive: number;
  defaultMaxReels: number;
  defaultReelPrice: number;
  coverageOptions: string;
  addOnOptions: string;
  defaultPrices: string;
  subEvents: SubEvent[];
}

interface CatalogOption {
  id: number;
  optionId: string;
  kind: OptionKind;
  label: string;
  icon: string;
  description: string;
  sortOrder: number;
}

const ICONS = ["heart", "cake", "flower", "baby", "home", "gift", "camera", "video", "aperture", "film", "drone", "monitor", "radio", "wand"];

type Tab = "events" | "subevents" | "reels" | "prices" | "options";

export function EditorShell({
  templates,
  options,
}: {
  templates: Template[];
  options: CatalogOption[];
}) {
  const [tab, setTab] = useState<Tab>("events");
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  const coverageOptions = options.filter((o) => o.kind === "coverage");
  const addOnOptions = options.filter((o) => o.kind === "addon");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1 border-b pb-1">
        {(["events", "subevents", "reels", "prices", "options"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-t-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === t
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "events" ? "1. Event Types" :
             t === "subevents" ? "2. Sub-Events" :
             t === "reels" ? "3. Reels & Albums" :
             t === "prices" ? "4. Default Prices" : "5. Add-ons & Coverage"}
          </button>
        ))}
      </div>

      {tab === "events" && (
        <EventsEditor templates={templates} coverageOptions={coverageOptions} addOnOptions={addOnOptions} />
      )}
      {tab === "subevents" && (
        <SubEventsEditor
          templates={templates}
          selectedTemplate={selectedTemplate}
          onSelectTemplate={setSelectedTemplate}
        />
      )}
      {tab === "reels" && <ReelsEditor templates={templates} />}
      {tab === "prices" && (
        <PricesEditor templates={templates} coverageOptions={coverageOptions} addOnOptions={addOnOptions} />
      )}
      {tab === "options" && <OptionsEditor options={options} />}
    </div>
  );
}

const NEW_ID = -1;

function EventsEditor({
  templates,
  coverageOptions,
  addOnOptions,
}: {
  templates: Template[];
  coverageOptions: CatalogOption[];
  addOnOptions: CatalogOption[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    typeId: "", name: "", tagline: "", description: "",
    icon: "heart", isActive: 1 as number,
    defaultMaxReels: 3, defaultReelPrice: 6000,
    coverageOptions: [] as string[],
    addOnOptions: [] as string[],
  });

  const startEdit = (t?: Template) => {
    if (t) {
      setForm({
        typeId: t.typeId, name: t.name, tagline: t.tagline,
        description: t.description, icon: t.icon, isActive: t.isActive,
        defaultMaxReels: t.defaultMaxReels,
        defaultReelPrice: t.defaultReelPrice,
        coverageOptions: safeParse(t.coverageOptions) ?? [],
        addOnOptions: safeParse(t.addOnOptions) ?? [],
      });
      setEditing(t.id);
    } else {
      setForm({ typeId: "", name: "", tagline: "", description: "", icon: "heart", isActive: 1, defaultMaxReels: 3, defaultReelPrice: 6000, coverageOptions: [], addOnOptions: [] });
      setEditing(NEW_ID);
    }
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const templateId = editing === NEW_ID ? undefined : editing ?? undefined;
      const existing = typeof templateId === "number" ? templates.find((t) => t.id === templateId) : null;
      await upsertTemplate({ ...form, id: templateId, defaultPrices: existing?.defaultPrices });
      toast.success("Saved");
      setEditing(null);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: number) => {
    if (!confirm("Delete this event type and all its sub-events?")) return;
    try {
      await deleteTemplate(id);
      toast.success("Deleted");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Button onClick={() => startEdit()} size="sm">+ New Event Type</Button>
      </div>

      {editing !== null && (
        <div className="rounded-xl border p-4 grid gap-3 sm:grid-cols-2">
          <div><Label>ID</Label><Input value={form.typeId} onChange={(e) => setForm({ ...form, typeId: e.target.value })} /></div>
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="sm:col-span-2"><Label>Tagline</Label><Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} /></div>
          <div className="sm:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="sm:col-span-2">
            <Label className="text-xs mb-1 block">Coverage Options</Label>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {coverageOptions.map((o) => (
                <label key={o.optionId} className="flex items-center gap-1.5 text-xs">
                  <input
                    type="checkbox"
                    className="size-3.5"
                    checked={form.coverageOptions.includes(o.optionId)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        coverageOptions: e.target.checked
                          ? [...form.coverageOptions, o.optionId]
                          : form.coverageOptions.filter((c) => c !== o.optionId),
                      })
                    }
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs mb-1 block">Add-on Options</Label>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {addOnOptions.map((o) => (
                <label key={o.optionId} className="flex items-center gap-1.5 text-xs">
                  <input
                    type="checkbox"
                    className="size-3.5"
                    checked={form.addOnOptions.includes(o.optionId)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        addOnOptions: e.target.checked
                          ? [...form.addOnOptions, o.optionId]
                          : form.addOnOptions.filter((a) => a !== o.optionId),
                      })
                    }
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label>Icon</Label>
            <select className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}>
              {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-2 pb-2">
            <input type="checkbox" id="ea" checked={Boolean(form.isActive)} onChange={(e) => setForm({ ...form, isActive: e.target.checked ? 1 : 0 })} className="size-4" />
            <Label htmlFor="ea">Active</Label>
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <Button onClick={save} disabled={saving}>Save</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="grid gap-2">
        {templates.map((t) => (
          <div key={t.id} className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{t.name}</span>
              {!t.isActive && <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Inactive</span>}
              <span className="text-xs text-muted-foreground">{t.subEvents.length} sub-events</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="xs" onClick={() => startEdit(t)}>Edit</Button>
              <Button variant="ghost" size="xs" className="text-destructive" onClick={() => del(t.id)}>×</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const NEW_SUB_ID = -1;

function SubEventsEditor({
  templates, selectedTemplate, onSelectTemplate,
}: {
  templates: Template[];
  selectedTemplate: number | null;
  onSelectTemplate: (id: number | null) => void;
}) {
  const router = useRouter();
  const tmpl = templates.find((t) => t.id === selectedTemplate);
  const [form, setForm] = useState({ subEventId: "", name: "", description: "", defaultSelected: false, maxReels: "", sortOrder: 0 });
  const [editing, setEditing] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const startEdit = (se?: SubEvent) => {
    if (se) {
      setForm({ subEventId: se.subEventId, name: se.name, description: se.description, defaultSelected: Boolean(se.defaultSelected), maxReels: se.maxReels?.toString() ?? "", sortOrder: se.sortOrder });
      setEditing(se.id);
    } else {
      setForm({ subEventId: "", name: "", description: "", defaultSelected: false, maxReels: "", sortOrder: tmpl?.subEvents.length ?? 0 });
      setEditing(NEW_SUB_ID);
    }
  };

  const save = async () => {
    if (!selectedTemplate || !form.subEventId || !form.name) { toast.error("ID and name required"); return; }
    if (saving) return;
    setSaving(true);
    try {
      // Editing an existing sub-event must carry through its stored
      // priceOverrides — upsertSubEvent only writes overrides when provided,
      // but passing {} explicitly would erase them.
      const existing =
        editing !== NEW_SUB_ID && editing
          ? tmpl?.subEvents.find((se) => se.id === editing)
          : null;
      await upsertSubEvent({
        id: editing === NEW_SUB_ID ? undefined : editing ?? undefined,
        subEventId: form.subEventId,
        name: form.name,
        description: form.description,
        defaultSelected: form.defaultSelected,
        maxReels: form.maxReels ? Number(form.maxReels) : null,
        sortOrder: form.sortOrder,
        priceOverrides: existing
          ? safeParse<Record<string, unknown>>(existing.priceOverrides) ?? {}
          : {},
        templateId: selectedTemplate,
      });
      toast.success("Saved");
      setEditing(null);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: number) => {
    if (!confirm("Delete this sub-event?")) return;
    try {
      await deleteSubEvent(id);
      toast.success("Deleted");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 flex-wrap">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => { onSelectTemplate(t.id); startEdit(); }}
            className={`rounded-[9999px] border px-3 py-1 text-sm transition-colors ${
              selectedTemplate === t.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {tmpl && (
        <>
          <div className="flex gap-2">
            <Button onClick={() => startEdit()} size="sm">+ Add Sub-Event</Button>
          </div>

          {editing !== null && (
            <div className="rounded-xl border p-4 grid gap-3 sm:grid-cols-2">
              <div><Label className="text-xs">ID</Label><Input value={form.subEventId} onChange={(e) => setForm({ ...form, subEventId: e.target.value })} /></div>
              <div><Label className="text-xs">Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label className="text-xs">Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="ds" checked={form.defaultSelected} onChange={(e) => setForm({ ...form, defaultSelected: e.target.checked })} className="size-4" />
                <Label htmlFor="ds" className="text-xs">Default selected</Label>
              </div>
              <div>
                <Label className="text-xs">Max Reels</Label>
                <Input type="number" value={form.maxReels} onChange={(e) => setForm({ ...form, maxReels: e.target.value })} />
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <Button size="sm" onClick={save} disabled={saving}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="grid gap-1">
            {tmpl.subEvents.map((se) => (
              <div key={se.id} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{se.name}</span>
                  <span className="text-xs text-muted-foreground">({se.subEventId})</span>
                  {se.defaultSelected && <span className="text-xs text-primary">*default</span>}
                  {se.maxReels && <span className="text-xs text-muted-foreground">max {se.maxReels} reels</span>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="xs" onClick={() => startEdit(se)}>Edit</Button>
                  <Button variant="ghost" size="xs" className="text-destructive" onClick={() => del(se.id)}>×</Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function safeParse<T = string[]>(val: string): T | null {
  try { return JSON.parse(val) as T; } catch { return null; }
}

function ReelsEditor({ templates }: { templates: Template[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<number | null>(null);
  const [maxReels, setMaxReels] = useState(3);
  const [saving, setSaving] = useState(false);

  const startEdit = (t?: Template) => {
    if (t) {
      setMaxReels(t.defaultMaxReels);
      setEditing(t.id);
    }
  };

  const save = async () => {
    if (!editing || saving) return;
    const t = templates.find((t) => t.id === editing);
    if (!t) return;
    setSaving(true);
    try {
      await upsertTemplate({
        id: editing,
        typeId: t.typeId, name: t.name, tagline: t.tagline,
        description: t.description, icon: t.icon, isActive: t.isActive,
        defaultMaxReels: maxReels,
        defaultReelPrice: t.defaultReelPrice,
        coverageOptions: safeParse(t.coverageOptions) ?? [], addOnOptions: safeParse(t.addOnOptions) ?? [],
        defaultPrices: t.defaultPrices,
      });
      toast.success("Saved");
      setEditing(null);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {templates.map((t) => (
        <div key={t.id} className="rounded-xl border p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium">{t.name}</span>
            <Button variant="outline" size="xs" onClick={() => startEdit(t)}>Edit</Button>
          </div>

          {editing === t.id ? (
            <div className="flex flex-col gap-3">
              <div className="max-w-[200px]">
                <Label className="text-xs">Max Reels</Label>
                <Input type="number" value={maxReels} onChange={(e) => setMaxReels(Number(e.target.value))} />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={save} disabled={saving}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Max reels: {t.defaultMaxReels}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function PricesEditor({
  templates,
  coverageOptions,
  addOnOptions,
}: {
  templates: Template[];
  coverageOptions: CatalogOption[];
  addOnOptions: CatalogOption[];
}) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [addonPrices, setAddonPrices] = useState<Record<string, string>>({});
  const [reelPrice, setReelPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const tmpl = templates.find((t) => t.id === selectedTemplate);

  const selectTemplate = (t: Template) => {
    setSelectedTemplate(t.id);
    const parsed = safeParse<{ coverage?: Record<string, number>; addOns?: Record<string, number>; reel?: { value: number } }>(t.defaultPrices);
    const cov: Record<string, string> = {};
    const add: Record<string, string> = {};
    if (parsed?.coverage) {
      for (const [key, val] of Object.entries(parsed.coverage)) cov[key] = String(val);
    }
    if (parsed?.addOns) {
      for (const [key, val] of Object.entries(parsed.addOns)) add[key] = String(val);
    }
    setPrices(cov);
    setAddonPrices(add);
    setReelPrice(parsed?.reel?.value ? String(parsed.reel.value) : String(t.defaultReelPrice));
  };

  const save = async () => {
    if (!selectedTemplate || !tmpl || saving) return;
    setSaving(true);
    const coverage: Record<string, number> = {};
    const addOns: Record<string, number> = {};
    for (const [key, val] of Object.entries(prices)) { if (val) coverage[key] = Number(val); }
    for (const [key, val] of Object.entries(addonPrices)) { if (val) addOns[key] = Number(val); }
    const reel = reelPrice ? { value: Number(reelPrice) } : undefined;
    const defaultPrices = JSON.stringify({ coverage, addOns, ...(reel ? { reel } : {}) });
    try {
      await upsertTemplate({
        id: selectedTemplate,
        typeId: tmpl.typeId, name: tmpl.name, tagline: tmpl.tagline,
        description: tmpl.description, icon: tmpl.icon, isActive: tmpl.isActive,
        defaultMaxReels: tmpl.defaultMaxReels,
        defaultReelPrice: reelPrice ? Number(reelPrice) : tmpl.defaultReelPrice,
        coverageOptions: safeParse(tmpl.coverageOptions) ?? [],
        addOnOptions: safeParse(tmpl.addOnOptions) ?? [],
        defaultPrices,
      });
      toast.success("Default prices saved");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 flex-wrap">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => selectTemplate(t)}
            className={`rounded-[9999px] border px-3 py-1 text-sm transition-colors ${
              selectedTemplate === t.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {tmpl && (
        <div className="rounded-xl border p-4 flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-medium mb-3">Coverage Prices</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {coverageOptions.map((o) => (
                <div key={o.optionId}>
                  <Label className="text-xs">{o.label}</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs"
                    placeholder="Price"
                    value={prices[o.optionId] ?? ""}
                    onChange={(e) => setPrices({ ...prices, [o.optionId]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3">Add-on Prices</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {addOnOptions.map((o) => (
                <div key={o.optionId}>
                  <Label className="text-xs">{o.label}</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs"
                    placeholder="Price"
                    value={addonPrices[o.optionId] ?? ""}
                    onChange={(e) => setAddonPrices({ ...addonPrices, [o.optionId]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3">Reel Price</h3>
            <div className="max-w-[200px]">
              <Label className="text-xs">Price per reel</Label>
              <Input
                type="number"
                className="h-8 text-xs"
                placeholder="6000"
                value={reelPrice}
                onChange={(e) => setReelPrice(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button onClick={save} disabled={saving}>Save Default Prices</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function OptionsEditor({ options }: { options: CatalogOption[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<{
    optionId: string;
    kind: OptionKind;
    label: string;
    icon: string;
    description: string;
  }>({ optionId: "", kind: "addon", label: "", icon: "wand", description: "" });
  const [saving, setSaving] = useState(false);

  const coverageOptions = options.filter((o) => o.kind === "coverage");
  const addOnOptions = options.filter((o) => o.kind === "addon");

  const save = async () => {
    if (!form.optionId || !form.label) { toast.error("ID and label required"); return; }
    if (saving) return;
    setSaving(true);
    try {
      await createOption(form);
      toast.success("Option added");
      setAdding(false);
      setForm({ optionId: "", kind: "addon", label: "", icon: "wand", description: "" });
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add option");
    } finally {
      setSaving(false);
    }
  };

  const del = async (optionId: string) => {
    if (!confirm(`Delete "${optionId}"? Templates that reference it will stop showing it.`)) return;
    try {
      await deleteOption(optionId);
      toast.success("Deleted");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setAdding(true)}>+ New Add-on / Coverage Option</Button>
      </div>

      {adding && (
        <div className="rounded-xl border p-4 grid gap-3 sm:grid-cols-2">
          <div>
            <Label className="text-xs">Kind</Label>
            <select
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm"
              value={form.kind}
              onChange={(e) => setForm({ ...form, kind: e.target.value as OptionKind })}
            >
              <option value="addon">Add-on</option>
              <option value="coverage">Coverage</option>
            </select>
          </div>
          <div>
            <Label className="text-xs">ID</Label>
            <Input value={form.optionId} placeholder="photo_booth" onChange={(e) => setForm({ ...form, optionId: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Label</Label>
            <Input value={form.label} placeholder="Photo Booth" onChange={(e) => setForm({ ...form, label: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Icon</Label>
            <select
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
            >
              {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs">Description</Label>
            <Input value={form.description} placeholder="Short description shown in the estimator" onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <Button size="sm" onClick={save} disabled={saving}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium mb-1">Add-ons</h3>
          {addOnOptions.map((o) => (
            <div key={o.optionId} className="flex items-center justify-between rounded-lg border p-2 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium truncate">{o.label}</span>
                <span className="text-xs text-muted-foreground truncate">({o.optionId})</span>
              </div>
              <Button variant="ghost" size="xs" className="text-destructive" onClick={() => del(o.optionId)}>×</Button>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium mb-1">Coverage</h3>
          {coverageOptions.map((o) => (
            <div key={o.optionId} className="flex items-center justify-between rounded-lg border p-2 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium truncate">{o.label}</span>
                <span className="text-xs text-muted-foreground truncate">({o.optionId})</span>
              </div>
              <Button variant="ghost" size="xs" className="text-destructive" onClick={() => del(o.optionId)}>×</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Pure state management for the estimator: reducer, initial state, helpers,
 * and a server-side sanitizer used to validate untrusted client input before
 * the PDF is rendered. No React here so it is fully testable in isolation.
 */
import type { EstimatorState, EventTemplate, ID, SubEventState } from "./types";

export const STEPS = [
  "Your Details",
  "Event Type",
  "Sub Events",
  "Coverage",
  "Albums",
  "Additional Services",
  "Deliverables",
  "Estimate",
  "Print / Save PDF",
] as const;

export const initialState: EstimatorState = {
  clientName: "",
  clientPhone: "",
  estimatedDate: "",
  eventTypeId: null,
  selectedSubEvents: [],
  subEventConfig: {},
  album: { required: false, typeId: null, sizeId: null, pages: 30, count: 1 },
  step: 0,
};

export type EstimatorAction =
  | { type: "SET_CLIENT_INFO"; field: "clientName" | "clientPhone"; value: string }
  | { type: "SET_ESTIMATED_DATE"; value: string }
  | {
      type: "SET_EVENT_TYPE";
      eventTypeId: ID;
      defaultSubEvents: ID[];
      albumBasePages: number;
    }
  | { type: "TOGGLE_SUB_EVENT"; subEventId: ID }
  | { type: "SET_STEP"; step: number }
  | { type: "TOGGLE_COVERAGE"; subEventId: ID; coverageId: ID }
  | { type: "TOGGLE_ADDON"; subEventId: ID; addOnId: ID }
  | { type: "SET_REELS"; subEventId: ID; reels: number }
  | { type: "SET_ALBUM_REQUIRED"; required: boolean }
  | {
      type: "SET_ALBUM_FIELD";
      field: "typeId" | "sizeId" | "pages" | "count";
      value: string | number;
    }
  | {
      type: "APPLY_RECOMMENDATION";
      suggest: { type: "coverage" | "addon"; id: ID };
      targetSubEvents: ID[];
    }
  | { type: "HYDRATE"; state: EstimatorState }
  | { type: "RESET" };

function emptySubEvent(id: ID): SubEventState {
  return { id, coverage: [], addOns: [], reels: 0 };
}

export function defaultSubEventsFor(template: EventTemplate): ID[] {
  return template.subEvents.filter((s) => s.defaultSelected).map((s) => s.id);
}

export function maxReelsFor(template: EventTemplate, subEventId: ID): number {
  const sub = template.subEvents.find((s) => s.id === subEventId);
  return sub?.maxReels ?? template.defaultMaxReels;
}

export function estimatorReducer(
  state: EstimatorState,
  action: EstimatorAction,
): EstimatorState {
  switch (action.type) {
    case "SET_CLIENT_INFO": {
      return {
        ...state,
        [action.field]: action.value,
      };
    }

    case "SET_ESTIMATED_DATE": {
      return { ...state, estimatedDate: action.value };
    }

    case "SET_EVENT_TYPE": {
      const config: Record<ID, SubEventState> = {};
      for (const id of action.defaultSubEvents) config[id] = emptySubEvent(id);
      return {
        ...state,
        eventTypeId: action.eventTypeId,
        selectedSubEvents: action.defaultSubEvents,
        subEventConfig: config,
        album: {
          required: false,
          typeId: null,
          sizeId: null,
          pages: action.albumBasePages,
          count: 1,
        },
      };
    }

    case "TOGGLE_SUB_EVENT": {
      const isSelected = state.selectedSubEvents.includes(action.subEventId);
      if (isSelected) {
        const subEventConfig = { ...state.subEventConfig };
        delete subEventConfig[action.subEventId];
        return {
          ...state,
          selectedSubEvents: state.selectedSubEvents.filter(
            (id) => id !== action.subEventId,
          ),
          subEventConfig,
        };
      }
      return {
        ...state,
        selectedSubEvents: [...state.selectedSubEvents, action.subEventId],
        subEventConfig: {
          ...state.subEventConfig,
          [action.subEventId]: emptySubEvent(action.subEventId),
        },
      };
    }

    case "SET_STEP":
      return { ...state, step: action.step };

    case "TOGGLE_COVERAGE": {
      const cfg = state.subEventConfig[action.subEventId];
      if (!cfg) return state;
      const has = cfg.coverage.includes(action.coverageId);
      return {
        ...state,
        subEventConfig: {
          ...state.subEventConfig,
          [action.subEventId]: {
            ...cfg,
            coverage: has
              ? cfg.coverage.filter((id) => id !== action.coverageId)
              : [...cfg.coverage, action.coverageId],
          },
        },
      };
    }

    case "TOGGLE_ADDON": {
      const cfg = state.subEventConfig[action.subEventId];
      if (!cfg) return state;
      const has = cfg.addOns.includes(action.addOnId);
      return {
        ...state,
        subEventConfig: {
          ...state.subEventConfig,
          [action.subEventId]: {
            ...cfg,
            addOns: has
              ? cfg.addOns.filter((id) => id !== action.addOnId)
              : [...cfg.addOns, action.addOnId],
          },
        },
      };
    }

    case "SET_REELS": {
      const cfg = state.subEventConfig[action.subEventId];
      if (!cfg) return state;
      return {
        ...state,
        subEventConfig: {
          ...state.subEventConfig,
          [action.subEventId]: { ...cfg, reels: action.reels },
        },
      };
    }

    case "SET_ALBUM_REQUIRED":
      return {
        ...state,
        album: { ...state.album, required: action.required },
      };

    case "SET_ALBUM_FIELD": {
      const album = { ...state.album };
      if (action.field === "typeId" || action.field === "sizeId") {
        album[action.field] = (action.value as string) || null;
      } else {
        const n = Number(action.value);
        album[action.field] = Number.isFinite(n) ? n : album[action.field];
      }
      return { ...state, album };
    }

    case "APPLY_RECOMMENDATION": {
      const next = { ...state.subEventConfig };
      for (const subId of action.targetSubEvents) {
        const cfg = next[subId];
        if (!cfg) continue;
        if (action.suggest.type === "coverage") {
          if (!cfg.coverage.includes(action.suggest.id)) {
            next[subId] = { ...cfg, coverage: [...cfg.coverage, action.suggest.id] };
          }
        } else {
          if (!cfg.addOns.includes(action.suggest.id)) {
            next[subId] = { ...cfg, addOns: [...cfg.addOns, action.suggest.id] };
          }
        }
      }
      return { ...state, subEventConfig: next };
    }

    case "HYDRATE":
      return { ...initialState, ...action.state };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

/**
 * Validate and clamp untrusted state (e.g. a POST body) against a template.
 * Used server-side before rendering the PDF so a tampered payload can never
 * produce an inconsistent or out-of-range estimate.
 */
export function sanitizeState(
  state: unknown,
  template: EventTemplate,
): EstimatorState {
  const s = (state ?? {}) as Partial<EstimatorState>;
  const validSubIds = new Set(template.subEvents.map((se) => se.id));
  const validCoverage = new Set(template.coverageOptions);
  const validAddOns = new Set(template.addOnOptions);
  const validTypes = new Set(template.album.types.map((t) => t.id));
  const validSizes = new Set(template.album.sizes.map((sz) => sz.id));

  const rawSelected = Array.isArray(s.selectedSubEvents) ? s.selectedSubEvents : [];
  const seen = new Set<ID>();
  const selectedSubEvents: ID[] = [];
  for (const id of rawSelected) {
    if (typeof id === "string" && validSubIds.has(id) && !seen.has(id)) {
      seen.add(id);
      selectedSubEvents.push(id);
    }
  }

  const rawConfig = (s.subEventConfig ?? {}) as Record<ID, SubEventState>;
  const subEventConfig: Record<ID, SubEventState> = {};
  for (const id of selectedSubEvents) {
    const raw = rawConfig[id];
    const reels = clampInt(raw?.reels, 0, maxReelsFor(template, id));
    subEventConfig[id] = {
      id,
      coverage: Array.isArray(raw?.coverage)
        ? raw.coverage.filter((c) => validCoverage.has(c))
        : [],
      addOns: Array.isArray(raw?.addOns)
        ? raw.addOns.filter((a) => validAddOns.has(a))
        : [],
      reels,
    };
  }

  const rawAlbum = (s.album ?? {}) as Partial<EstimatorState["album"]>;
  const album: EstimatorState["album"] = {
    required: Boolean(rawAlbum.required),
    typeId:
      typeof rawAlbum.typeId === "string" && validTypes.has(rawAlbum.typeId)
        ? rawAlbum.typeId
        : null,
    sizeId:
      typeof rawAlbum.sizeId === "string" && validSizes.has(rawAlbum.sizeId)
        ? rawAlbum.sizeId
        : null,
    pages: clampInt(rawAlbum.pages, 1, template.album.maxPages),
    count: clampInt(rawAlbum.count, 1, template.album.maxAlbums),
  };

  return {
    clientName:
      typeof s.clientName === "string" ? s.clientName.trim().slice(0, 80) : "",
    clientPhone: typeof s.clientPhone === "string" ? s.clientPhone.replace(/\D/g, "").slice(0, 10) : "",
    estimatedDate: isValidDateString(s.estimatedDate) ? s.estimatedDate : "",
    eventTypeId: template.id,
    selectedSubEvents,
    subEventConfig,
    album,
    step: clampInt(s.step, 0, STEPS.length - 1),
  };
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateString(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function clampInt(value: unknown, min: number, max: number): number {
  const n = Math.trunc(Number(value));
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

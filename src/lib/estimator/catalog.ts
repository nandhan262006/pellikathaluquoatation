/**
 * Shared option vocabulary for coverage and add-on services.
 *
 * Templates reference these by `id` and only carry pricing. Keeping labels,
 * icons and descriptions in one place means a copy change updates every event
 * template at once, and a future CMS template builder only stores ids + prices.
 */
import type { AddOnOption, CoverageOption, ID, OptionDefinition } from "./types";

export const COVERAGE_OPTIONS: CoverageOption[] = [
  {
    id: "traditional_photography",
    label: "Traditional Photography",
    icon: "camera",
    description: "Classic posed and event-coverage photography.",
  },
  {
    id: "traditional_videography",
    label: "Traditional Videography",
    icon: "video",
    description: "Full event coverage on video in a traditional style.",
  },
  {
    id: "candid_photography",
    label: "Candid Photography",
    icon: "aperture",
    description: "Unposed, documentary-style storytelling photos.",
  },
  {
    id: "cinematic_videography",
    label: "Cinematic Videography",
    icon: "film",
    description: "Film-grade cinematography with a highlight reel.",
  },
  {
    id: "drone",
    label: "Drone",
    icon: "drone",
    description: "Aerial coverage and sweeping venue shots.",
  },
];

export const ADD_ON_OPTIONS: AddOnOption[] = [
  {
    id: "led_screen",
    label: "LED Screen",
    icon: "monitor",
    description: "Large LED wall for live playback and visuals at the venue.",
  },
  {
    id: "live_streaming",
    label: "Live Streaming",
    icon: "radio",
    description: "Broadcast the event live for remote family and friends.",
  },
  {
    id: "ai_gallery",
    label: "AI Gallery",
    icon: "wand",
    description: "AI-powered event gallery with smart photo curation.",
  },
  {
    id: "instant_teaser",
    label: "Instant Teaser or Same-Day Teaser",
    icon: "film",
    description: "A quick highlight teaser or same-day edit screened at the event.",
  },
];

const COVERAGE_BY_ID = new Map(COVERAGE_OPTIONS.map((o) => [o.id, o]));
const ADD_ON_BY_ID = new Map(ADD_ON_OPTIONS.map((o) => [o.id, o]));

export function getCoverageOption(id: ID) {
  return COVERAGE_BY_ID.get(id);
}

export function getAddOnOption(id: ID) {
  return ADD_ON_BY_ID.get(id);
}

export function buildOptionCatalog(): Record<ID, OptionDefinition> {
  const map: Record<ID, OptionDefinition> = {};
  for (const o of COVERAGE_OPTIONS) map[o.id] = o;
  for (const o of ADD_ON_OPTIONS) map[o.id] = o;
  return map;
}

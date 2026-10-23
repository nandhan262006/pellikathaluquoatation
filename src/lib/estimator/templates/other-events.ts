import type { EventTemplate, ID, PriceRange } from "../types";
import {
  ALBUM_DEFAULTS,
  DEFAULT_ADDON_PRICES,
  DEFAULT_COVERAGE_PRICES,
  DEFAULT_MAX_REELS,
  DEFAULT_REEL_PRICE,
  commonRecommendations,
  deliverableRulesFor,
} from "./shared";

const ALL_COVERAGE: ID[] = [
  "traditional_photography",
  "traditional_videography",
  "candid_photography",
  "cinematic_videography",
  "drone",
];

const PARTY_ADDONS: ID[] = [
  "led_screen",
  "live_streaming",
  "ai_gallery",
  "instant_teaser",
];

const INTIMATE_ADDONS: ID[] = [
  "live_streaming",
  "ai_gallery",
  "instant_teaser",
];

const CORPORATE_ADDONS: ID[] = [
  "led_screen",
  "live_streaming",
  "ai_gallery",
  "instant_teaser",
];

const galaCoverage: Partial<Record<ID, PriceRange>> = {
  candid_photography: { value: 45000 },
  cinematic_videography: { value: 65000 },
};

export const birthdayTemplate: EventTemplate = {
  id: "birthday",
  name: "Birthday",
  tagline: "Birthdays, milestone parties and surprise celebrations.",
  description: "Capture every smile, cake cut and dance-floor moment.",
  icon: "cake",
  coverageOptions: ALL_COVERAGE,
  addOnOptions: PARTY_ADDONS,
  defaultCoveragePrices: DEFAULT_COVERAGE_PRICES,
  defaultAddOnPrices: DEFAULT_ADDON_PRICES,
  defaultReelPrice: DEFAULT_REEL_PRICE,
  defaultMaxReels: DEFAULT_MAX_REELS,
  subEvents: [
    { id: "family_party", name: "Family Party / Cocktail Party", defaultSelected: true },
    { id: "pre_shoot", name: "Pre Shoot / Cake Smash" },
    { id: "main_birthday", name: "Main Birthday Event" },
    { id: "other", name: "Other" },
  ],
  album: ALBUM_DEFAULTS,
  deliverableRules: deliverableRulesFor(ALL_COVERAGE, PARTY_ADDONS),
  recommendationRules: [
    {
      id: "rec-birthday-gallery",
      suggest: { type: "addon", id: "ai_gallery" },
      message: "An AI Gallery lets guests relive the celebration through smart-curated photos.",
      requiresAnySubEvent: ["family_party", "main_birthday"],
    },
    {
      id: "rec-birthday-reels",
      suggest: { type: "coverage", id: "candid_photography" },
      message: "Add Candid Photography for lively, spontaneous moments.",
      requiresAnySubEvent: ["family_party", "main_birthday"],
    },
  ],
};

export const halfSareeTemplate: EventTemplate = {
  id: "half_saree",
  name: "Saree or Dhothi Ceremony",
  tagline: "Traditional ceremonies, rituals and celebrations.",
  description: "Document the traditions, rituals and the celebration around them.",
  icon: "flower",
  coverageOptions: ALL_COVERAGE,
  addOnOptions: PARTY_ADDONS,
  defaultCoveragePrices: DEFAULT_COVERAGE_PRICES,
  defaultAddOnPrices: DEFAULT_ADDON_PRICES,
  defaultReelPrice: DEFAULT_REEL_PRICE,
  defaultMaxReels: DEFAULT_MAX_REELS,
  subEvents: [
    { id: "haldi", name: "Haldi", defaultSelected: true },
    { id: "mehendi", name: "Mehendi" },
    { id: "sangeet", name: "Sangeeth" },
    { id: "cocktail_party", name: "Cocktail Party" },
    { id: "main_event", name: "Main Event" },
    { id: "other", name: "Other" },
  ],
  album: ALBUM_DEFAULTS,
  deliverableRules: deliverableRulesFor(ALL_COVERAGE, PARTY_ADDONS),
  recommendationRules: [
    {
      id: "rec-half-saree-cinematic",
      suggest: { type: "coverage", id: "cinematic_videography" },
      message: "Cinematic Videography turns the ceremony into a beautiful film.",
      requiresAnySubEvent: ["main_event", "haldi"],
    },
    ...commonRecommendations().filter((r) => r.id !== "rec-candid-for-main"),
  ],
};

export const babyShowerTemplate: EventTemplate = {
  id: "baby_shower",
  name: "Baby Shower",
  tagline: "Blessings, games and tender moments with family.",
  description: "A warm, intimate celebration captured end to end.",
  icon: "baby",
  coverageOptions: ALL_COVERAGE,
  addOnOptions: INTIMATE_ADDONS,
  defaultCoveragePrices: DEFAULT_COVERAGE_PRICES,
  defaultAddOnPrices: DEFAULT_ADDON_PRICES,
  defaultReelPrice: DEFAULT_REEL_PRICE,
  defaultMaxReels: DEFAULT_MAX_REELS,
  subEvents: [
    { id: "welcome", name: "Welcome" },
    { id: "pooja", name: "Pooja", defaultSelected: true },
    { id: "blessings", name: "Blessings" },
    { id: "games", name: "Games" },
    { id: "photoshoot", name: "Photoshoot", defaultSelected: true },
    { id: "other", name: "Other" },
  ],
  album: ALBUM_DEFAULTS,
  deliverableRules: deliverableRulesFor(ALL_COVERAGE, INTIMATE_ADDONS),
  recommendationRules: [
    {
      id: "rec-baby-shower-stream",
      suggest: { type: "addon", id: "live_streaming" },
      message: "Live Streaming lets faraway family share the blessings.",
      requiresAnySubEvent: ["pooja", "blessings"],
    },
  ],
};

export const housewarmingTemplate: EventTemplate = {
  id: "housewarming",
  name: "Housewarming",
  tagline: "Pooja, homam and family portraits for your new home.",
  description: "Preserve the rituals and the joy of a new beginning.",
  icon: "home",
  coverageOptions: ALL_COVERAGE,
  addOnOptions: INTIMATE_ADDONS,
  defaultCoveragePrices: DEFAULT_COVERAGE_PRICES,
  defaultAddOnPrices: DEFAULT_ADDON_PRICES,
  defaultReelPrice: DEFAULT_REEL_PRICE,
  defaultMaxReels: DEFAULT_MAX_REELS,
  subEvents: [
    { id: "house_warming", name: "House Warming", defaultSelected: true },
    { id: "sathyanarayana_vratham", name: "Sathyanarayana Vratham" },
    { id: "other", name: "Other" },
  ],
  album: ALBUM_DEFAULTS,
  deliverableRules: deliverableRulesFor(ALL_COVERAGE, INTIMATE_ADDONS),
  recommendationRules: [
    {
      id: "rec-housewarming-candid",
      suggest: { type: "coverage", id: "candid_photography" },
      message: "Candid Photography captures the warmth of family gatherings.",
      requiresAnySubEvent: ["house_warming", "sathyanarayana_vratham"],
    },
  ],
};

export const anniversaryTemplate: EventTemplate = {
  id: "anniversary",
  name: "Anniversary",
  tagline: "Renewal of vows, cake cutting and a celebratory party.",
  description: "Celebrate milestones with coverage tailored to the occasion.",
  icon: "gift",
  coverageOptions: ALL_COVERAGE,
  addOnOptions: PARTY_ADDONS,
  defaultCoveragePrices: DEFAULT_COVERAGE_PRICES,
  defaultAddOnPrices: DEFAULT_ADDON_PRICES,
  defaultReelPrice: DEFAULT_REEL_PRICE,
  defaultMaxReels: DEFAULT_MAX_REELS,
  subEvents: [
    { id: "welcome", name: "Welcome" },
    { id: "cake_cutting", name: "Cake Cutting", defaultSelected: true },
    { id: "renewal_vows", name: "Renewal of Vows" },
    { id: "party", name: "Party", defaultSelected: true },
    { id: "photoshoot", name: "Couple Photoshoot" },
    { id: "other", name: "Other" },
  ],
  album: ALBUM_DEFAULTS,
  deliverableRules: deliverableRulesFor(ALL_COVERAGE, PARTY_ADDONS),
  recommendationRules: [
    {
      id: "rec-anniversary-cinematic",
      suggest: { type: "coverage", id: "cinematic_videography" },
      message: "A cinematic film of the vow renewal makes a treasured keepsake.",
      requiresAnySubEvent: ["renewal_vows", "party"],
    },
  ],
};

export const corporateTemplate: EventTemplate = {
  id: "corporate",
  name: "Corporate Event",
  tagline: "Conferences, launches, awards and gala dinners.",
  description: "Polished coverage for brand events and corporate functions.",
  icon: "building",
  coverageOptions: ALL_COVERAGE,
  addOnOptions: CORPORATE_ADDONS,
  defaultCoveragePrices: DEFAULT_COVERAGE_PRICES,
  defaultAddOnPrices: DEFAULT_ADDON_PRICES,
  defaultReelPrice: DEFAULT_REEL_PRICE,
  defaultMaxReels: DEFAULT_MAX_REELS,
  subEvents: [
    { id: "inauguration", name: "Inauguration", defaultSelected: true },
    { id: "speeches", name: "Speeches / Keynote" },
    { id: "panel", name: "Panel / Session" },
    { id: "awards", name: "Awards", defaultSelected: true },
    { id: "networking", name: "Networking" },
    { id: "gala_dinner", name: "Gala Dinner", coverage: galaCoverage },
    { id: "other", name: "Other" },
  ],
  album: ALBUM_DEFAULTS,
  deliverableRules: deliverableRulesFor(ALL_COVERAGE, CORPORATE_ADDONS),
  recommendationRules: [
    {
      id: "rec-corporate-stream",
      suggest: { type: "addon", id: "live_streaming" },
      message: "Live Streaming extends your event to remote employees and clients.",
      requiresAnySubEvent: ["speeches", "panel", "inauguration"],
    },
    {
      id: "rec-corporate-led",
      suggest: { type: "addon", id: "led_screen" },
      message: "An LED screen elevates keynotes and award moments.",
      requiresAnySubEvent: ["speeches", "awards", "gala_dinner"],
    },
  ],
};

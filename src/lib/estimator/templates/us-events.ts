import type { AlbumDefaults, EventTemplate, ID, PriceRange } from "../types";
import {
  DEFAULT_MAX_REELS,
  commonRecommendations,
  deliverableRulesFor,
} from "./shared";

/**
 * US market templates. Placeholder USD pricing — refine these in the admin
 * Estimator Editor ("Default Prices" tab) once real US rates are known.
 */

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

export const US_DEFAULT_COVERAGE_PRICES: Record<ID, PriceRange> = {
  traditional_photography: { value: 150 },
  traditional_videography: { value: 200 },
  candid_photography: { value: 450 },
  cinematic_videography: { value: 600 },
  drone: { value: 250 },
};

export const US_DEFAULT_ADDON_PRICES: Record<ID, PriceRange> = {
  led_screen: { value: 300 },
  live_streaming: { value: 200 },
  ai_gallery: { value: 300 },
  instant_teaser: { value: 250 },
};

export const US_DEFAULT_REEL_PRICE: PriceRange = { value: 75 };

export const US_ALBUM_DEFAULTS: AlbumDefaults = {
  types: [
    {
      id: "magazine",
      name: "Magazine Album",
      basePrice: { value: 220 },
      perPagePrice: { value: 3 },
    },
    {
      id: "premium",
      name: "Premium Photographic",
      basePrice: { value: 300 },
      perPagePrice: { value: 4 },
    },
    {
      id: "layflat",
      name: "Layflat Album",
      basePrice: { value: 450 },
      perPagePrice: { value: 6 },
    },
    {
      id: "coffee_table",
      name: "Coffee Table Album",
      basePrice: { value: 650 },
      perPagePrice: { value: 8 },
    },
  ],
  sizes: [
    { id: "12x36", name: '12" × 36"', multiplier: 1.0 },
    { id: "15x45", name: '15" × 45"', multiplier: 1.3 },
    { id: "20x60", name: '20" × 60"', multiplier: 1.8 },
    { id: "24x72", name: '24" × 72"', multiplier: 2.4 },
  ],
  basePages: 30,
  maxPages: 120,
  maxAlbums: 10,
  pageRate: 8,
};

const galaCoverage: Partial<Record<ID, PriceRange>> = {
  candid_photography: { value: 550 },
  cinematic_videography: { value: 750 },
};

export const usWeddingTemplate: EventTemplate = {
  id: "wedding_us",
  name: "Wedding",
  tagline: "Full wedding day coverage, from getting ready to the send-off.",
  description:
    "Build a complete photography & videography package for your wedding day.",
  icon: "heart",
  market: "US",
  coverageOptions: ALL_COVERAGE,
  addOnOptions: PARTY_ADDONS,
  defaultCoveragePrices: US_DEFAULT_COVERAGE_PRICES,
  defaultAddOnPrices: US_DEFAULT_ADDON_PRICES,
  defaultReelPrice: US_DEFAULT_REEL_PRICE,
  defaultMaxReels: DEFAULT_MAX_REELS,
  subEvents: [
    { id: "ceremony", name: "Ceremony", defaultSelected: true },
    { id: "reception", name: "Reception", defaultSelected: true },
    { id: "engagement_session", name: "Engagement Session" },
    { id: "rehearsal_dinner", name: "Rehearsal Dinner" },
    { id: "getting_ready", name: "Getting Ready" },
    { id: "other", name: "Other" },
  ],
  album: US_ALBUM_DEFAULTS,
  deliverableRules: deliverableRulesFor(ALL_COVERAGE, PARTY_ADDONS),
  recommendationRules: commonRecommendations(),
};

export const usEngagementTemplate: EventTemplate = {
  id: "engagement_us",
  name: "Engagement",
  tagline: "Proposals, engagement shoots and celebration parties.",
  description: "Capture the moment you said yes and the celebration around it.",
  icon: "camera",
  market: "US",
  coverageOptions: ALL_COVERAGE,
  addOnOptions: INTIMATE_ADDONS,
  defaultCoveragePrices: US_DEFAULT_COVERAGE_PRICES,
  defaultAddOnPrices: US_DEFAULT_ADDON_PRICES,
  defaultReelPrice: US_DEFAULT_REEL_PRICE,
  defaultMaxReels: DEFAULT_MAX_REELS,
  subEvents: [
    { id: "engagement_shoot", name: "Engagement Shoot", defaultSelected: true },
    { id: "proposal", name: "Proposal" },
    { id: "celebration_party", name: "Celebration Party" },
    { id: "other", name: "Other" },
  ],
  album: US_ALBUM_DEFAULTS,
  deliverableRules: deliverableRulesFor(ALL_COVERAGE, INTIMATE_ADDONS),
  recommendationRules: commonRecommendations(),
};

export const usBirthdayTemplate: EventTemplate = {
  id: "birthday_us",
  name: "Birthday",
  tagline: "Birthdays, milestone parties and surprise celebrations.",
  description: "Capture every smile, cake cut and dance-floor moment.",
  icon: "cake",
  market: "US",
  coverageOptions: ALL_COVERAGE,
  addOnOptions: PARTY_ADDONS,
  defaultCoveragePrices: US_DEFAULT_COVERAGE_PRICES,
  defaultAddOnPrices: US_DEFAULT_ADDON_PRICES,
  defaultReelPrice: US_DEFAULT_REEL_PRICE,
  defaultMaxReels: DEFAULT_MAX_REELS,
  subEvents: [
    { id: "main_party", name: "Main Party", defaultSelected: true },
    { id: "cake_cutting", name: "Cake Cutting" },
    { id: "games", name: "Games" },
    { id: "other", name: "Other" },
  ],
  album: US_ALBUM_DEFAULTS,
  deliverableRules: deliverableRulesFor(ALL_COVERAGE, PARTY_ADDONS),
  recommendationRules: commonRecommendations(),
};

export const usAnniversaryTemplate: EventTemplate = {
  id: "anniversary_us",
  name: "Anniversary",
  tagline: "Renewal of vows, dinner parties and couple portraits.",
  description: "Celebrate milestones with coverage tailored to the occasion.",
  icon: "gift",
  market: "US",
  coverageOptions: ALL_COVERAGE,
  addOnOptions: PARTY_ADDONS,
  defaultCoveragePrices: US_DEFAULT_COVERAGE_PRICES,
  defaultAddOnPrices: US_DEFAULT_ADDON_PRICES,
  defaultReelPrice: US_DEFAULT_REEL_PRICE,
  defaultMaxReels: DEFAULT_MAX_REELS,
  subEvents: [
    { id: "dinner_party", name: "Dinner Party", defaultSelected: true },
    { id: "vow_renewal", name: "Vow Renewal" },
    { id: "couple_shoot", name: "Couple Shoot" },
    { id: "other", name: "Other" },
  ],
  album: US_ALBUM_DEFAULTS,
  deliverableRules: deliverableRulesFor(ALL_COVERAGE, PARTY_ADDONS),
  recommendationRules: commonRecommendations(),
};

export const usCorporateTemplate: EventTemplate = {
  id: "corporate_us",
  name: "Corporate Event",
  tagline: "Conferences, launches, awards and gala dinners.",
  description: "Polished coverage for brand events and corporate functions.",
  icon: "building",
  market: "US",
  coverageOptions: ALL_COVERAGE,
  addOnOptions: CORPORATE_ADDONS,
  defaultCoveragePrices: US_DEFAULT_COVERAGE_PRICES,
  defaultAddOnPrices: US_DEFAULT_ADDON_PRICES,
  defaultReelPrice: US_DEFAULT_REEL_PRICE,
  defaultMaxReels: DEFAULT_MAX_REELS,
  subEvents: [
    { id: "conference", name: "Conference", defaultSelected: true },
    { id: "keynote", name: "Keynote / Speeches" },
    { id: "awards", name: "Awards", defaultSelected: true },
    { id: "networking", name: "Networking" },
    { id: "gala_dinner", name: "Gala Dinner", coverage: galaCoverage },
    { id: "other", name: "Other" },
  ],
  album: US_ALBUM_DEFAULTS,
  deliverableRules: deliverableRulesFor(ALL_COVERAGE, CORPORATE_ADDONS),
  recommendationRules: commonRecommendations(),
};

export const usBabyShowerTemplate: EventTemplate = {
  id: "baby_shower_us",
  name: "Baby Shower",
  tagline: "Blessings, games and tender moments with family.",
  description: "A warm, intimate celebration captured end to end.",
  icon: "baby",
  market: "US",
  coverageOptions: ALL_COVERAGE,
  addOnOptions: INTIMATE_ADDONS,
  defaultCoveragePrices: US_DEFAULT_COVERAGE_PRICES,
  defaultAddOnPrices: US_DEFAULT_ADDON_PRICES,
  defaultReelPrice: US_DEFAULT_REEL_PRICE,
  defaultMaxReels: DEFAULT_MAX_REELS,
  subEvents: [
    { id: "welcome", name: "Welcome", defaultSelected: true },
    { id: "games", name: "Games" },
    { id: "gift_opening", name: "Gift Opening" },
    { id: "photoshoot", name: "Photoshoot", defaultSelected: true },
    { id: "other", name: "Other" },
  ],
  album: US_ALBUM_DEFAULTS,
  deliverableRules: deliverableRulesFor(ALL_COVERAGE, INTIMATE_ADDONS),
  recommendationRules: commonRecommendations(),
};

export const usGraduationTemplate: EventTemplate = {
  id: "graduation_us",
  name: "Graduation",
  tagline: "Commencement ceremonies, portraits and celebration parties.",
  description: "Preserve the achievement with portraits and candid moments.",
  icon: "graduation",
  market: "US",
  coverageOptions: ALL_COVERAGE,
  addOnOptions: PARTY_ADDONS,
  defaultCoveragePrices: US_DEFAULT_COVERAGE_PRICES,
  defaultAddOnPrices: US_DEFAULT_ADDON_PRICES,
  defaultReelPrice: US_DEFAULT_REEL_PRICE,
  defaultMaxReels: DEFAULT_MAX_REELS,
  subEvents: [
    { id: "ceremony", name: "Commencement Ceremony", defaultSelected: true },
    { id: "portraits", name: "Portraits", defaultSelected: true },
    { id: "party", name: "Celebration Party" },
    { id: "other", name: "Other" },
  ],
  album: US_ALBUM_DEFAULTS,
  deliverableRules: deliverableRulesFor(ALL_COVERAGE, PARTY_ADDONS),
  recommendationRules: commonRecommendations(),
};

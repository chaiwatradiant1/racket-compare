// Shared visual + behavioral constants for the Racket Index.
// Re-exports the canonical Racket type from the data layer.

export type {
  Balance,
  Flex,
  PlayStyle,
  PriceRange,
  RadarKey,
  RadarAxis,
  Racket,
} from "@/data/rackets";

// ---------------------------------------------------------------------------
// App-level enums
// ---------------------------------------------------------------------------

export type Theme = "editorial" | "modern";
export type Density = "comfortable" | "compact";
export type RadarMode = "filled" | "stroke" | "hybrid";

export type CompareStrategy = "max" | "min" | "equal" | "neutral";

// ---------------------------------------------------------------------------
// Numeric / layout defaults
// ---------------------------------------------------------------------------

/** Max rackets that can sit in the compare set at once. */
export const SLOT_COUNT = 3;

/** Default card density on the grid. */
export const DENSITY: Density = "comfortable";

/** Default radar treatment (light fill + crisp stroke). */
export const RADAR_MODE: RadarMode = "hybrid";

// ---------------------------------------------------------------------------
// Color constants
// ---------------------------------------------------------------------------

/** Cinnabar — the single editorial accent, also the detail-radar series color. */
export const ACCENT = "oklch(54% 0.18 30)";

/**
 * Series colors for the overlaid compare radar / slot dots, in slot order.
 *
 * - Index 0: cinnabar  (oklch(54% 0.18 30))
 * - Index 1: ink-blue  (oklch(45% 0.12 240))
 * - Index 2: moss      (oklch(50% 0.10 150))
 */
export const SERIES_COLORS = [
  "oklch(54% 0.18 30)",  // cinnabar
  "oklch(45% 0.12 240)", // ink-blue
  "oklch(50% 0.10 150)", // moss
] as const;

// ---------------------------------------------------------------------------
// Radar configuration
// ---------------------------------------------------------------------------

/** The five radar axes used by the radar chart. */
export const RADAR_AXES = [
  { key: "power",           label: "Power" },
  { key: "speed",           label: "Speed" },
  { key: "maneuverability", label: "Maneuverability" },
  { key: "defense",         label: "Defense" },
  { key: "control",         label: "Control" },
] as const;

// ---------------------------------------------------------------------------
// Detail-page spec table rows
// ---------------------------------------------------------------------------

/** Rows for the detail-page specification table. */
export const SPEC_ROWS = [
  { key: "brand",             label: "Brand" },
  { key: "model",             label: "Model" },
  { key: "year",              label: "Year released" },
  { key: "weight",            label: "Weight class" },
  { key: "weightGrams",       label: "Weight (g)",       format: (v: number) => `${v} g` },
  { key: "balance",           label: "Balance" },
  { key: "balanceMm",         label: "Balance point",    format: (v: number) => `${v} mm` },
  { key: "flex",              label: "Shaft flex" },
  { key: "flexScore",         label: "Stiffness",        format: (v: number) => `${v} / 5` },
  { key: "frameMaterial",     label: "Frame material" },
  { key: "shaftMaterial",     label: "Shaft material" },
  { key: "stringTensionMax",  label: "Tension range" },
  { key: "tensionMaxLbs",     label: "Max tension",      format: (v: number) => `${v} lbs` },
  { key: "gripSize",          label: "Grip size" },
  { key: "stringPattern",     label: "Stringing pattern" },
  { key: "playStyle",         label: "Play style" },
  { key: "priceRange",        label: "Price tier" },
] as const;

// ---------------------------------------------------------------------------
// Detail-page play-attribute rows (radar + bar list)
// ---------------------------------------------------------------------------

/** Play attribute rows for the detail-page radar / bar list. */
export const PLAY_ROWS = [
  { key: "power",           label: "Power" },
  { key: "speed",           label: "Speed" },
  { key: "control",         label: "Control" },
  { key: "maneuverability", label: "Maneuverability" },
  { key: "defense",         label: "Defense" },
] as const;

// ---------------------------------------------------------------------------
// Compare-page side-by-side table rows
// ---------------------------------------------------------------------------

/**
 * Interface for a single compare table row.
 *
 * - `compare`: strategy used to determine best/worst highlights.
 *   - `"max"`     — higher numeric value is best
 *   - `"min"`     — lower numeric value is best
 *   - `"equal"`   — categorical; no highlighting (just shows equality)
 *   - `"neutral"` — numeric but neither best nor worst is meaningful
 * - `format`: optional display transform for the raw value.
 * - `group`: optional group label row inserted before this row.
 */
export interface CompareRow {
  key: string;
  label: string;
  compare: CompareStrategy;
  format?: (v: unknown) => string;
  group?: string;
}

/** Rows for the compare-page side-by-side table with best/worst highlights. */
export const COMPARE_ROWS: CompareRow[] = [
  // — spec fields —
  { key: "brand",            label: "Brand",           compare: "equal" },
  { key: "year",             label: "Year",            compare: "max",    format: (v) => `${v}` },
  { key: "weight",           label: "Weight class",    compare: "equal" },
  { key: "weightGrams",      label: "Weight",          compare: "min",    format: (v) => `${v} g` },
  { key: "balance",          label: "Balance",         compare: "equal" },
  { key: "balanceMm",        label: "Balance pt",      compare: "neutral", format: (v) => `${v} mm` },
  { key: "flex",             label: "Flex",            compare: "equal" },
  { key: "flexScore",        label: "Stiffness",       compare: "neutral", format: (v) => `${v}/5` },
  { key: "frameMaterial",    label: "Frame",           compare: "equal" },
  { key: "shaftMaterial",    label: "Shaft",           compare: "equal" },
  { key: "stringTensionMax", label: "Tension range",   compare: "equal" },
  { key: "tensionMaxLbs",    label: "Max tension",     compare: "max",    format: (v) => `${v} lbs` },
  { key: "gripSize",         label: "Grip size",       compare: "equal" },
  { key: "stringPattern",    label: "Stringing",       compare: "equal" },
  { key: "playStyle",        label: "Play style",      compare: "equal" },
  { key: "priceRange",       label: "Price tier",      compare: "equal" },
  // — play attributes —
  { key: "power",            label: "Power",           compare: "max",   format: (v) => `${v}/5`,  group: "Play attributes" },
  { key: "speed",            label: "Speed",           compare: "max",   format: (v) => `${v}/5` },
  { key: "control",          label: "Control",         compare: "max",   format: (v) => `${v}/5` },
  { key: "maneuverability",  label: "Maneuverability", compare: "max",   format: (v) => `${v}/5` },
  { key: "defense",          label: "Defense",         compare: "max",   format: (v) => `${v}/5` },
];

// ---------------------------------------------------------------------------
// Font-family constants
// ---------------------------------------------------------------------------

/** Serif stack: Instrument Serif, Georgia fallback. */
export const SERIF = "Instrument Serif, Georgia, serif";

/** Sans-serif stack: DM Sans, Inter, Helvetica, Arial fallback. */
export const SANS = "DM Sans, Inter, Helvetica, Arial, sans-serif";

/** Monospace stack: JetBrains Mono, Fira Code fallback. */
export const MONO = "JetBrains Mono, Fira Code, monospace";

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------

export const STORAGE_KEYS = {
  compareIds: "racket-compare-ids",
  theme: "racket-theme",
} as const;
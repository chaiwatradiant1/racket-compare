// Shared visual + behavioral constants.

export type Theme = "editorial" | "modern";
export type Density = "comfortable" | "compact";
export type RadarMode = "filled" | "stroke" | "hybrid";

/** Max rackets that can sit in the compare set at once. */
export const SLOT_COUNT = 3;

/** Default card density on the grid. */
export const DENSITY: Density = "comfortable";

/** Default radar treatment (light fill + crisp stroke). */
export const RADAR_MODE: RadarMode = "hybrid";

/** Cinnabar — the single editorial accent, also the detail-radar series color. */
export const ACCENT = "oklch(54% 0.18 30)";

/** Series colors for the overlaid compare radar / slot dots, in slot order. */
export const SERIES_COLORS = [
  "oklch(54% 0.18 30)", // cinnabar
  "oklch(45% 0.12 240)", // ink-blue
  "oklch(50% 0.10 150)", // moss
];

export const STORAGE_KEYS = {
  compareIds: "racket-compare-ids",
  theme: "racket-theme",
} as const;

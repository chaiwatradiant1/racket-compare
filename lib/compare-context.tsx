"use client";

// Client-side store for the compare set + theme. Lives above every page in the
// root layout so the compare drawer and picks persist across route changes and
// reloads (localStorage). Comparison state also rides in the /compare URL.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  DENSITY,
  RADAR_MODE,
  SLOT_COUNT,
  STORAGE_KEYS,
  type Density,
  type RadarMode,
  type Theme,
} from "@/lib/constants";

type IdsUpdater = string[] | ((current: string[]) => string[]);

interface CompareContextValue {
  compareIds: string[];
  slotCount: number;
  density: Density;
  radarMode: RadarMode;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setCompareIds: (next: IdsUpdater) => void;
  toggleCompare: (id: string) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextValue | null>(null);

function readStoredIds(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.compareIds) || "[]");
    return Array.isArray(saved) ? saved.slice(0, SLOT_COUNT) : [];
  } catch {
    return [];
  }
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareIds, setIds] = useState<string[]>([]);
  const [theme, setThemeState] = useState<Theme>("editorial");

  // Mirror the latest ids in a ref so the action callbacks stay referentially
  // stable while still resolving functional updates against fresh state.
  const idsRef = useRef(compareIds);
  idsRef.current = compareIds;

  // Hydrate from localStorage after mount (server renders defaults → no mismatch).
  useEffect(() => {
    const stored = readStoredIds();
    if (stored.length) {
      idsRef.current = stored;
      setIds(stored);
    }
    const storedTheme = localStorage.getItem(STORAGE_KEYS.theme);
    if (storedTheme === "modern" || storedTheme === "editorial") {
      setThemeState(storedTheme);
    }
  }, []);

  const setCompareIds = useCallback((next: IdsUpdater) => {
    const base = idsRef.current;
    const resolved = typeof next === "function" ? next(base) : next;
    const arr = resolved.filter(Boolean).slice(0, SLOT_COUNT);
    idsRef.current = arr;
    setIds(arr);
    try {
      localStorage.setItem(STORAGE_KEYS.compareIds, JSON.stringify(arr));
    } catch {
      /* storage unavailable — picks still live in memory + URL */
    }
  }, []);

  const toggleCompare = useCallback(
    (id: string) => {
      setCompareIds((curr) => {
        if (curr.includes(id)) return curr.filter((x) => x !== id);
        // At capacity: drop the oldest pick to make room (matches prototype).
        if (curr.length >= SLOT_COUNT) return [...curr.slice(1), id];
        return [...curr, id];
      });
    },
    [setCompareIds],
  );

  const removeFromCompare = useCallback(
    (id: string) => setCompareIds((curr) => curr.filter((x) => x !== id)),
    [setCompareIds],
  );

  const clearCompare = useCallback(() => setCompareIds([]), [setCompareIds]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEYS.theme, next);
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
  }, []);

  const toggleTheme = useCallback(
    () => setTheme(theme === "editorial" ? "modern" : "editorial"),
    [theme, setTheme],
  );

  const value: CompareContextValue = {
    compareIds,
    slotCount: SLOT_COUNT,
    density: DENSITY,
    radarMode: RADAR_MODE,
    theme,
    setTheme,
    toggleTheme,
    setCompareIds,
    toggleCompare,
    removeFromCompare,
    clearCompare,
  };

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return ctx;
}

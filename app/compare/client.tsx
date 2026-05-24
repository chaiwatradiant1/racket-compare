'use client';

// Full client-side compare page content moved from original page.tsx
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { RACKETS } from '@/data/rackets';
import type { Racket } from '@/data/rackets';
import { RadarChart } from '@/src/components/radar-chart';
import type { RadarSeries } from '@/src/components/radar-chart';
import { MicroLabel } from '@/src/components/primitives';
import {
  SLOT_COUNT,
  SERIES_COLORS,
  COMPARE_ROWS,
  ACCENT,
} from '@/src/lib/constants';
import type { CompareStrategy } from '@/src/lib/constants';

interface PickerSelectProps {
  slotIndex: number;
  rackets: Racket[];
  selectedId: string | null;
  usedIds: string[];
  onSelect: (slotIndex: number, id: string | null) => void;
}

const RADAR_AXES = [
  { key: 'power', label: 'Power' },
  { key: 'speed', label: 'Speed' },
  { key: 'maneuverability', label: 'Maneuverability' },
  { key: 'defense', label: 'Defense' },
  { key: 'control', label: 'Control' },
] as const;

function evaluateRow(
  values: (string | number)[],
  strategy: CompareStrategy,
): { bestIndex: number | null; worstIndex: number | null } {
  if (strategy === 'equal' || strategy === 'neutral') {
    return { bestIndex: null, worstIndex: null };
  }

  const numericValues = values.map((v) => {
    if (typeof v === 'number') return v;
    const parsed = Number(v);
    return isNaN(parsed) ? null : parsed;
  });

  if (numericValues.some((v) => v === null)) {
    return { bestIndex: null, worstIndex: null };
  }

  const nums = numericValues as number[];
  const isMax = strategy === 'max';
  let bestVal = isMax ? -Infinity : Infinity;
  let worstVal = isMax ? Infinity : -Infinity;
  let bestIndex: number | null = null;
  let worstIndex: number | null = null;

  nums.forEach((v, i) => {
    if (isMax) {
      if (v > bestVal) { bestVal = v; bestIndex = i; }
      if (v < worstVal) { worstVal = v; worstIndex = i; }
    } else {
      if (v < bestVal) { bestVal = v; bestIndex = i; }
      if (v > worstVal) { worstVal = v; worstIndex = i; }
    }
  });

  if (bestIndex === worstIndex) {
    return { bestIndex: null, worstIndex: null };
  }

  return { bestIndex, worstIndex };
}

function getRacketValue(racket: Racket, key: string): string | number | null {
  const val = (racket as unknown as Record<string, unknown>)[key];
  if (val === undefined || val === null) return null;
  if (typeof val === 'string' || typeof val === 'number') return val;
  return String(val);
}

function PickerSelect({
  slotIndex,
  rackets,
  selectedId,
  usedIds,
  onSelect,
}: PickerSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = selectedId
    ? rackets.find((r) => r.id === selectedId)
    : null;

  const filtered = useMemo(() => {
    return rackets.filter((r) => {
      if (r.id === selectedId) return true;
      if (usedIds.includes(r.id)) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        r.brand.toLowerCase().includes(q) ||
        r.model.toLowerCase().includes(q)
      );
    });
  }, [rackets, selectedId, usedIds, search]);

  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  function handleSelect(id: string | null) {
    onSelect(slotIndex, id);
    setOpen(false);
    setSearch('');
  }

  return (
    <div className="picker" ref={containerRef}>
      <button
        type="button"
        className="picker-btn"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected ? (
          <div className="picker-selected">
            <span className="picker-model">
              {selected.brand} {selected.model}
            </span>
          </div>
        ) : (
          <span className="picker-placeholder">Choose a racket…</span>
        )}
        <span className="picker-caret">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="picker-pop" role="listbox">
          <input
            ref={searchRef}
            type="text"
            className="picker-search"
            placeholder="Search rackets…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { setOpen(false); setSearch(''); }
            }}
          />

          {selectedId && (
            <button
              type="button"
              className="picker-option picker-option-clear"
              onClick={() => handleSelect(null)}
              role="option"
            >
              × Clear selection
            </button>
          )}

          <div className="picker-list">
            {filtered.length === 0 ? (
              <div className="picker-empty">No rackets found</div>
            ) : (
              filtered.map((r) => {
                const isActive = r.id === selectedId;
                return (
                  <button
                    key={r.id}
                    type="button"
                    className={`picker-option ${isActive ? 'picker-option-active' : ''}`}
                    onClick={() => handleSelect(r.id)}
                    role="option"
                    aria-selected={isActive}
                  >
                    <span className="picker-option-brand">{r.brand}</span>
                    <span className="picker-option-model">{r.model}</span>
                    <span className="picker-option-style">{r.playStyle}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComparePageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rackets = RACKETS;

  const idsParam = searchParams.get('ids') || '';
  const slotIds = useMemo<string[]>(() => {
    if (!idsParam) return [];
    return idsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, SLOT_COUNT);
  }, [idsParam]);

  const selectedRackets = useMemo(() => {
    return slotIds
      .map((id: string) => rackets.find((r: Racket) => r.id === id))
      .filter(Boolean) as Racket[];
  }, [slotIds, rackets]);

  const usedIds = useMemo(
    () => slotIds.filter((id) => id !== null),
    [slotIds],
  );

  const handleSelect = useCallback(
    (slotIndex: number, id: string | null) => {
      const next = [...slotIds];
      if (id === null) {
        next.splice(slotIndex, 1);
      } else {
        next[slotIndex] = id;
      }
      const filtered = next.filter(Boolean);
      const params = new URLSearchParams();
      if (filtered.length > 0) {
        params.set('ids', filtered.join(','));
      }
      router.replace(`/compare${params.toString() ? '?' + params.toString() : ''}`, {
        scroll: false,
      });
    },
    [slotIds, router],
  );

  const radarSeries: RadarSeries[] = useMemo(() => {
    return selectedRackets.map((r, i) => ({
      id: r.id,
      label: `${r.brand} ${r.model}`,
      color: SERIES_COLORS[i % SERIES_COLORS.length],
      values: {
        power: r.power,
        speed: r.speed,
        maneuverability: r.maneuverability,
        defense: r.defense,
        control: r.control,
      },
    }));
  }, [selectedRackets]);

  const hasEnough = selectedRackets.length >= 2;

  const tableRows = useMemo(() => {
    if (!hasEnough) return [];
    return COMPARE_ROWS.map((row) => {
      const values = selectedRackets.map((r) =>
        getRacketValue(r, row.key),
      ) as (string | number)[];
      const { bestIndex, worstIndex } = evaluateRow(values, row.compare);
      const formatted = values.map((v) => {
        if (v === null || v === undefined) return '—';
        return row.format ? row.format(v) : String(v);
      });
      return { ...row, formatted, bestIndex, worstIndex };
    });
  }, [hasEnough, selectedRackets]);

  const tableSections = useMemo(() => {
    if (!hasEnough) return [];
    const sections: { group: string | null; rows: typeof tableRows }[] = [];
    let currentGroup: string | null = null;
    let currentRows: typeof tableRows = [];
    for (const row of tableRows) {
      if (row.group && row.group !== currentGroup) {
        if (currentRows.length > 0) {
          sections.push({ group: currentGroup, rows: currentRows });
        }
        currentGroup = row.group;
        currentRows = [row];
      } else {
        currentRows.push(row);
      }
    }
    if (currentRows.length > 0) {
      sections.push({ group: currentGroup, rows: currentRows });
    }
    return sections;
  }, [tableRows, hasEnough]);

  return (
    <div className="page">
      <header className="compare-head">
        <MicroLabel>Racket Index</MicroLabel>
        <h1 className="compare-title">Compare</h1>
        <p className="compare-deck">
          Select 2–{SLOT_COUNT} rackets and compare their specs side-by-side.
        </p>
      </header>

      <hr className="rule" />

      <div className="compare-slots">
        {Array.from({ length: SLOT_COUNT }, (_, i) => (
          <div key={i} className="compare-slot">
            {selectedRackets[i] && (
              <span
                className="compare-slot-color"
                style={{ background: SERIES_COLORS[i % SERIES_COLORS.length] }}
              />
            )}
            <PickerSelect
              slotIndex={i}
              rackets={rackets}
              selectedId={slotIds[i] || null}
              usedIds={usedIds}
              onSelect={handleSelect}
            />
          </div>
        ))}
      </div>

      <hr className="rule" />

      {!hasEnough && (
        <div className="empty-state-compare empty-state">
          <p>Select at least 2 rackets to compare.</p>
          <span className="text-sm text-[var(--ink-soft)] font-mono uppercase tracking-wider">
            Use the pickers above to choose rackets
          </span>
        </div>
      )}

      {hasEnough && (
        <section className="compare-radar">
          <h2 className="section-title">Play Attributes</h2>
          <RadarChart
            axes={[...RADAR_AXES]}
            series={radarSeries}
            size={380}
            mode="hybrid"
            showLegend={true}
          />
        </section>
      )}

      {hasEnough && (
        <section className="compare-table-wrap">
          <h2 className="section-title">Specifications</h2>

          <div className="compare-table-note">
            <span className="legend-dot legend-dot-best" />
            Best in category
            <span className="legend-dot legend-dot-worst" style={{ marginLeft: 16 }} />
            Baseline
          </div>

          <div className="compare-table-scroll">
            <table className="compare-table">
              <thead>
                <tr>
                  <th className="compare-table-head-spec">Specification</th>
                  {selectedRackets.map((r, i) => (
                    <th key={r.id} className="compare-table-head-racket">
                      <span className="compare-table-head-color" style={{ background: SERIES_COLORS[i % SERIES_COLORS.length] }} />
                      <span className="compare-table-head-brand">{r.brand}</span>
                      <span className="compare-table-head-model">{r.model}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableSections.map((section, si) => (
                  <React.Fragment key={si}>
                    {section.group && (
                      <tr className="compare-table-group">
                        <th colSpan={selectedRackets.length + 1}>{section.group}</th>
                      </tr>
                    )}
                    {section.rows.map((row, ri) => (
                      <tr key={`${si}-${ri}`}>
                        <th>{row.label}</th>
                        {row.formatted.map((val, ci) => {
                          const isBest = row.bestIndex !== null && ci === row.bestIndex;
                          const isWorst = row.worstIndex !== null && ci === row.worstIndex;
                          const cellClass = [
                            isBest ? 'compare-cell-best' : '',
                            isWorst ? 'compare-cell-worst' : '',
                          ].filter(Boolean).join(' ');
                          return (
                            <td key={ci} className={cellClass}>
                              {val}
                              {isBest && <span className="compare-cell-tag">best</span>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
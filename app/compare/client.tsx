'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { RACKETS } from '@/data/rackets';
import type { Racket } from '@/data/rackets';
import { RadarChart } from '@/src/components/radar-chart';
import type { RadarSeries } from '@/src/components/radar-chart';
import { MicroLabel, Rule } from '@/src/components/primitives';
import {
  SLOT_COUNT,
  SERIES_COLORS,
  COMPARE_ROWS,
} from '@/src/lib/constants';
import type { CompareStrategy } from '@/src/lib/constants';

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
): Record<number, 'best' | 'worst'> {
  const result: Record<number, 'best' | 'worst'> = {};
  if (strategy === 'equal' || strategy === 'neutral') return result;
  const nums = values.map((v) => (typeof v === 'number' ? v : null));
  if (nums.some((n) => n === null)) return result;
  const n = nums as number[];
  const max = Math.max(...n);
  const min = Math.min(...n);
  if (max === min) return result;
  n.forEach((v, i) => {
    if (strategy === 'max') {
      if (v === max) result[i] = 'best';
      else if (v === min) result[i] = 'worst';
    } else {
      if (v === min) result[i] = 'best';
      else if (v === max) result[i] = 'worst';
    }
  });
  return result;
}

function getRacketValue(racket: Racket, key: string) {
  return (racket as unknown as Record<string, unknown>)[key] ?? null;
}

function PickerSelect({
  rackets, selectedId, usedIds, onChange,
}: {
  rackets: Racket[]; selectedId: string | null; usedIds: string[];
  onChange: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const selected = selectedId ? rackets.find((r) => r.id === selectedId) : null;
  const filtered = useMemo(() => rackets.filter((r) => {
    if (r.id === selectedId) return true;
    if (usedIds.includes(r.id)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return r.brand.toLowerCase().includes(q) || r.model.toLowerCase().includes(q);
  }), [rackets, selectedId, usedIds, search]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="picker" ref={ref}>
      <button type="button" className="picker-btn" onClick={() => setOpen((o) => !o)}>
        {selected ? (
          <div className="picker-selected">
            <MicroLabel>{selected.brand}</MicroLabel>
            <span className="picker-model">{selected.model}</span>
          </div>
        ) : (
          <span className="picker-placeholder">Pick a racket</span>
        )}
        <span className="picker-caret">▾</span>
      </button>
      {open && (
        <div className="picker-pop">
          <input className="picker-search" type="text" placeholder="Search by brand or model…"
            value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
          <ul className="picker-list">
            {filtered.length === 0 ? (
              <li className="picker-empty">No matches</li>
            ) : filtered.map((r) => (
              <li key={r.id}>
                <button type="button"
                  className={`picker-option ${r.id === selectedId ? 'picker-option-active' : ''}`}
                  onClick={() => { onChange(r.id); setOpen(false); setSearch(''); }}>
                  <span className="picker-option-brand">{r.brand}</span>
                  <span className="picker-option-model">{r.model}</span>
                  <span className="picker-option-style">{r.playStyle}</span>
                </button>
              </li>
            ))}
            {selectedId && (
              <li>
                <button type="button" className="picker-option picker-option-clear"
                  onClick={() => { onChange(null); setOpen(false); }}>
                  × Clear slot
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function ComparePageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const idsParam = searchParams.get('ids') || '';
  const slotIds = useMemo(() => {
    if (!idsParam) return [] as string[];
    return idsParam.split(',').map((s) => s.trim()).filter(Boolean).slice(0, SLOT_COUNT);
  }, [idsParam]);

  const picked = useMemo(
    () => slotIds.map((id) => RACKETS.find((r) => r.id === id) || null).filter(Boolean) as Racket[],
    [slotIds],
  );

  const handleChange = useCallback((index: number, id: string | null) => {
    const next = [...slotIds];
    if (id === null) { next.splice(index, 1); } else { next[index] = id; }
    const filtered = next.filter(Boolean);
    const q = filtered.length ? `?ids=${filtered.join(',')}` : '';
    router.replace(`/compare${q}`);
  }, [slotIds, router]);

  const radarSeries: RadarSeries[] = useMemo(
    () => picked.map((r, i) => ({
      id: r.id, label: `${r.brand} ${r.model}`,
      color: SERIES_COLORS[i % SERIES_COLORS.length],
      values: { power: r.power, speed: r.speed, control: r.control, maneuverability: r.maneuverability, defense: r.defense },
    })), [picked],
  );

  const tableRows = useMemo(() => {
    if (picked.length < 2) return [];
    return COMPARE_ROWS.map((row) => {
      const vals = picked.map((r) => getRacketValue(r, row.key)).filter((v): v is string | number => v !== null);
      const verdict = evaluateRow(vals, row.compare);
      const formatted = vals.map((v) => {
        if (v == null) return '—';
        return row.format ? row.format(v as string | number) : String(v);
      });
      return { ...row, formatted, verdict };
    });
  }, [picked]);

  return (
    <main className="page page-compare">
      <header className="compare-head">
        <MicroLabel>Compare</MicroLabel>
        <h1 className="compare-title">Side by side. Spec & shape.</h1>
        <p className="compare-deck">
          Choose {slotIds.length}/{SLOT_COUNT} rackets. The radar overlays their play attributes;
          the table below highlights the best and worst values per row.
        </p>
      </header>

      <Rule thick />

      <section className="compare-slots">
        {Array.from({ length: SLOT_COUNT }, (_, i) => (
          <div key={i} className="compare-slot">
            <MicroLabel>Slot {String(i + 1).padStart(2, '0')}</MicroLabel>
            <PickerSelect
              rackets={RACKETS}
              selectedId={slotIds[i] || null}
              usedIds={slotIds.filter((_, j) => j !== i)}
              onChange={(id) => handleChange(i, id)}
            />
            {picked[i] && (
              <div className="compare-slot-color" style={{ background: SERIES_COLORS[i % SERIES_COLORS.length] }} />
            )}
          </div>
        ))}
      </section>

      {picked.length < 2 ? (
        <section className="empty-state empty-state-compare">
          <MicroLabel>Waiting room</MicroLabel>
          <p>Pick at least two rackets to begin the comparison.</p>
        </section>
      ) : (
        <>
          <Rule />
          <section className="compare-radar">
            <MicroLabel>Play attributes</MicroLabel>
            <h2 className="section-title">Overlaid radar — {picked.length} rackets, five axes.</h2>
            <RadarChart axes={[...RADAR_AXES]} series={radarSeries} size={520} mode="hybrid" />
          </section>

          <Rule />

          <section className="compare-table-wrap">
            <MicroLabel>Specifications</MicroLabel>
            <h2 className="section-title">Row-by-row.</h2>
            <div className="compare-table-scroll">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th scope="col" className="compare-table-head-spec">Spec</th>
                    {picked.map((r, i) => (
                      <th key={r.id} scope="col" className="compare-table-head-racket">
                        <span className="compare-table-head-color" style={{ background: SERIES_COLORS[i % SERIES_COLORS.length] }} />
                        <span className="compare-table-head-brand">{r.brand}</span>
                        <span className="compare-table-head-model">{r.model}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row) => {
                    const rowKey = `${row.key}-${row.label}`;
                    return (
                      <React.Fragment key={rowKey}>
                        {(row as { group?: string }).group && (
                          <tr className="compare-table-group">
                            <th colSpan={picked.length + 1}>
                              <MicroLabel>{(row as { group: string }).group}</MicroLabel>
                            </th>
                          </tr>
                        )}
                        <tr>
                          <th scope="row">{(row as { label: string }).label}</th>
                          {picked.map((_, ci) => {
                            const formatted = (row as { formatted: string[] }).formatted;
                            const verdict = (row as { verdict: Record<number, 'best' | 'worst'> }).verdict;
                            const v = formatted[ci] ?? '—';
                            const status = verdict[ci];
                            return (
                              <td key={ci} className={`compare-cell ${status ? `compare-cell-${status}` : ''}`}>
                                {v}
                                {status && <span className="compare-cell-tag">{status}</span>}
                              </td>
                            );
                          })}
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="compare-table-note">
              <span className="legend-dot legend-dot-best" /> Best for the metric
              &nbsp;·&nbsp;
              <span className="legend-dot legend-dot-worst" /> Worst.
            </p>
          </section>
        </>
      )}
    </main>
  );
}
'use client';

import { useState, useEffect } from 'react';
import type { Racket } from '@/data/rackets';
import { MicroLabel } from '../primitives';

interface CompareDrawerProps {
  rackets: Racket[];
  compareIds: string[];
  slotCount: number;
  onOpen: (id: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onGoCompare: () => void;
}

export function CompareDrawer({
  rackets,
  compareIds,
  slotCount,
  onOpen,
  onRemove,
  onClear,
  onGoCompare,
}: CompareDrawerProps) {
  const [collapsed, setCollapsed] = useState(false);
  const slots = Array.from({ length: slotCount }, (_, i) => compareIds[i] || null);
  const empty = compareIds.length === 0;

  // Auto-expand when rackets are added
  useEffect(() => {
    if (!empty) setCollapsed(false);
  }, [empty]);

  // Collapsed pill — appears when empty OR when user toggles closed
  if (empty || collapsed) {
    return (
      <button
        type="button"
        className="compare-drawer-pill"
        onClick={() => setCollapsed(false)}
        aria-label="Open compare drawer"
      >
        <span className="compare-drawer-pill-label">Compare</span>
        <span className="compare-drawer-pill-count">
          {compareIds.length}/{slotCount}
        </span>
      </button>
    );
  }

  return (
    <div className="compare-drawer">
      <div className="compare-drawer-inner">
        <div className="compare-drawer-label">
          <MicroLabel>Compare</MicroLabel>
          <span className="compare-drawer-count">
            {compareIds.length}/{slotCount}
          </span>
        </div>
        <ul className="compare-drawer-slots">
          {slots.map((id, i) => {
            const r = id ? rackets.find((x) => x.id === id) : null;
            return (
              <li key={i} className={`drawer-slot ${r ? '' : 'drawer-slot-empty'}`}>
                {r ? (
                  <>
                    <button
                      type="button"
                      className="drawer-slot-body"
                      onClick={() => onOpen(r.id)}
                      title={`${r.brand} ${r.model}`}
                    >
                      <span className="drawer-slot-brand">{r.brand}</span>
                      <span className="drawer-slot-model">{r.model}</span>
                    </button>
                    <button
                      type="button"
                      className="drawer-slot-remove"
                      onClick={() => onRemove(r.id)}
                      aria-label={`Remove ${r.model}`}
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <span className="drawer-slot-placeholder">— —</span>
                )}
              </li>
            );
          })}
        </ul>
        <div className="compare-drawer-actions">
          <button type="button" className="link-btn" onClick={onClear}>
            Clear
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={compareIds.length < 2}
            onClick={onGoCompare}
          >
            Compare →
          </button>
          <button
            type="button"
            className="drawer-collapse"
            onClick={() => setCollapsed(true)}
            aria-label="Collapse compare drawer"
          >
            ▾
          </button>
        </div>
      </div>
    </div>
  );
}
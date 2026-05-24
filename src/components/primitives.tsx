'use client';

import type { ReactNode } from 'react';
import type { Racket, PlayStyle } from '@/data/rackets';

// ──────────────────────────────────────────────
// Placeholder — striped image slot for rackets
// ──────────────────────────────────────────────
export function Placeholder({
  label = 'racket',
  aspect = '4/5',
  className = '',
}: {
  label?: string;
  aspect?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: aspect }}
      aria-label={label}
    >
      {/* Diagonal striped background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, oklch(92% 0.005 30) 0px, oklch(92% 0.005 30) 2px, oklch(86% 0.015 30) 2px, oklch(86% 0.015 30) 8px)',
        }}
      />
      {/* Catalog / label centered on top */}
      <span className="absolute left-1/2 top-2 -translate-x-1/2 font-mono text-[10px] text-black/40">
        {label}
      </span>
    </div>
  );
}

// ──────────────────────────────────────────────
// Tag — play style badge
// ──────────────────────────────────────────────
export function Tag({
  children,
  tone = 'ink',
  className = '',
}: {
  children: ReactNode;
  tone?: 'ink' | 'outline';
  className?: string;
}) {
  const base = 'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium leading-none';
  const toneClass =
    tone === 'ink'
      ? 'bg-black text-white'
      : 'border border-black bg-transparent text-black';

  return <span className={`${base} ${toneClass} ${className}`}>{children}</span>;
}

// ──────────────────────────────────────────────
// Rule — hairline divider
// ──────────────────────────────────────────────
export function Rule({
  thick = false,
  className = '',
}: {
  thick?: boolean;
  className?: string;
}) {
  return (
    <hr
      className={`w-full border-t ${
        thick
          ? 'border-t-[3px] border-double border-t-[var(--rule)]'
          : 'border-t border-t-[var(--rule)]'
      } ${className}`}
    />
  );
}

// ──────────────────────────────────────────────
// MicroLabel — tiny ALL-CAPS label
// ──────────────────────────────────────────────
export function MicroLabel({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${className}`}
    >
      {children}
    </span>
  );
}

// ──────────────────────────────────────────────
// playStyleTone — helper: map play style to Tag tone
// ──────────────────────────────────────────────
function playStyleTone(style: PlayStyle): 'ink' | 'outline' {
  switch (style) {
    case 'Power':
    case 'Speed':
      return 'ink';
    case 'Control':
    case 'All-Around':
      return 'outline';
  }
}

// ──────────────────────────────────────────────
// RacketCard — grid card for a single racket
// ──────────────────────────────────────────────
export function RacketCard({
  racket,
  density = 'comfortable',
  onOpen,
  inCompare = false,
  onToggleCompare,
}: {
  racket: Racket;
  density?: 'comfortable' | 'compact';
  onOpen: (id: string) => void;
  inCompare?: boolean;
  onToggleCompare: (id: string) => void;
}) {
  const compact = density === 'compact';

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-lg border border-[var(--rule)] bg-[var(--card-bg)] ${
        compact ? 'gap-1 p-2' : 'gap-2 p-3'
      }`}
    >
      {/* ── Media / image slot ── */}
      <button
        type="button"
        className="relative w-full overflow-hidden rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        onClick={() => onOpen(racket.id)}
        aria-label={`Open ${racket.brand} ${racket.model}`}
      >
        <Placeholder label={`${racket.brand} ${racket.model}`} aspect="3/4" />
        <span className="absolute bottom-2 left-2 font-mono text-[10px] text-black/40">
          № {racket.no}
        </span>
      </button>

      {/* ── Header: brand + model ── */}
      <header className="flex flex-col">
        <MicroLabel>{racket.brand}</MicroLabel>
        <h3
          className="cursor-pointer font-serif font-bold leading-tight hover:underline"
          onClick={() => onOpen(racket.id)}
        >
          {racket.model}
        </h3>
      </header>

      {/* ── Spec grid: WGT | BAL | FLX | TNS ── */}
      <dl className={`grid grid-cols-4 gap-x-1 ${compact ? 'text-[10px]' : 'text-xs'}`}>
        <SpecCell label="WGT" value={racket.weight.split(' ')[0]} />
        <SpecCell
          label="BAL"
          value={racket.balance.replace('Head-', 'H-')}
        />
        <SpecCell label="FLX" value={racket.flex} />
        <SpecCell label="TNS" value={String(racket.tensionMaxLbs)} />
      </dl>

      {/* ── Footer: play style tag + compare toggle ── */}
      <footer className={`flex items-center justify-between ${compact ? '' : 'mt-1'}`}>
        <Tag tone={playStyleTone(racket.playStyle)}>{racket.playStyle}</Tag>
        <button
          type="button"
          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
            inCompare
              ? 'bg-black text-white'
              : 'border border-black bg-transparent text-black hover:bg-black hover:text-white'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompare(racket.id);
          }}
          aria-pressed={inCompare}
        >
          {inCompare ? '✓ In compare' : '+ Compare'}
        </button>
      </footer>
    </article>
  );
}

// ──────────────────────────────────────────────
// SpecCell — internal helper for the 4-column grid
// ──────────────────────────────────────────────
function SpecCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <dt className="text-[9px] font-semibold uppercase tracking-wider text-black/50">
        {label}
      </dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
import { Suspense } from 'react';
import { MicroLabel } from '@/src/components/primitives';
import ComparePageClient from './client';

function CompareFallback() {
  return (
    <main className="page page-compare">
      <header className="compare-head">
        <MicroLabel>Compare</MicroLabel>
        <h1 className="compare-title">Side by shape.</h1>
        <p className="compare-deck">Loading…</p>
      </header>
    </main>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<CompareFallback />}>
      <ComparePageClient />
    </Suspense>
  );
}
import { Suspense } from 'react';
import ComparePageClient from './client';

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="page"><p className="empty-state">Loading compare…</p></div>}>
      <ComparePageClient />
    </Suspense>
  );
}
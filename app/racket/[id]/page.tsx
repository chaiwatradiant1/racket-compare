// Server wrapper — generates all racket IDs for static export
// This file is a SERVER component (no 'use client'), can export generateStaticParams
import { RACKETS } from '@/data/rackets';
import RacketDetailClient from './client';

export function generateStaticParams() {
  return RACKETS.map((r) => ({ id: r.id }));
}

export default function RacketDetailPage() {
  return <RacketDetailClient />;
}

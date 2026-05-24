'use client';

import { CompareProvider } from '@/lib/compare-context';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <CompareProvider>{children}</CompareProvider>;
}

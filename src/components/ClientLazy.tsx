import { Suspense, type ReactNode } from 'react';

import { useHydrated } from '../hooks/useHydrated.ts';

/**
 * A lazy component that only mounts in the browser, after React has taken over the
 * prerendered page (specs/08-prerender.md). Until then the fallback is plain HTML, so the
 * prerender and the first browser render match, instead of a Suspense boundary the prerender
 * cannot finish (React error 419).
 */
export function ClientLazy({ fallback, children }: { fallback: ReactNode; children: ReactNode }) {
  const hydrated = useHydrated();
  return hydrated ? <Suspense fallback={fallback}>{children}</Suspense> : fallback;
}

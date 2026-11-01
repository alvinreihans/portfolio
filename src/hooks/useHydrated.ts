import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * False while a page is prerendered and while React takes over that HTML (hydration), true
 * afterwards and for anything mounted later. Lets a component render browser-only details
 * (random scene, screen width, canvas textures) without the first browser render differing
 * from the prerendered HTML (specs/08-prerender.md, section 3).
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

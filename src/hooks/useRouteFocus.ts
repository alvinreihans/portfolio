import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

/**
 * After a client-side navigation, moves focus to the new page's <h1> so screen
 * readers announce the change, or scrolls to and focuses the #section for hash
 * links (specs/04-pages.md, "Perilaku antar halaman").
 */
export function useRouteFocus() {
  const { pathname, hash, key } = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    const firstRender = isFirstRender.current;
    isFirstRender.current = false;
    // On the initial load the browser keeps its own focus unless a #section was requested.
    if (firstRender && !hash) return;

    const target = hash
      ? document.getElementById(decodeURIComponent(hash.slice(1)))
      : document.querySelector('main h1');
    if (!(target instanceof HTMLElement)) return;

    if (hash) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }, [pathname, hash, key]);
}

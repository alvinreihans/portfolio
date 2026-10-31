import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router';

/**
 * After a client-side navigation, moves focus to the new page's <h1> so screen
 * readers announce the change, or scrolls to and focuses the #section for hash
 * links (specs/04-pages.md, "Perilaku antar halaman").
 */
export function useRouteFocus() {
  const { pathname, hash, key } = useLocation();
  const isFirstRender = useRef(true);
  const previousPathname = useRef(pathname);
  // Scroll position before the navigation. Scroll events arrive after the commit, so this
  // still holds the old position when the layout effect below runs.
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      lastScrollY.current = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // A layout effect, so the scroll below happens before the browser paints the jump.
  useLayoutEffect(() => {
    const firstRender = isFirstRender.current;
    const samePage = previousPathname.current === pathname;
    isFirstRender.current = false;
    previousPathname.current = pathname;
    // On the initial load the browser keeps its own focus unless a #section was requested.
    if (firstRender && !hash) return;

    const target = hash
      ? document.getElementById(decodeURIComponent(hash.slice(1)))
      : document.querySelector('main h1');
    if (!(target instanceof HTMLElement)) return;

    if (hash) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduceMotion && !firstRender) {
        // <ScrollRestoration> has already jumped straight to the section. Go back to where
        // the visitor was (or the top of a newly opened page) so the smooth scroll has a
        // distance to animate.
        window.scrollTo({ top: samePage ? lastScrollY.current : 0, behavior: 'instant' });
      }
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }, [pathname, hash, key]);
}

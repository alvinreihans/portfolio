import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router';

/**
 * After a client-side navigation, moves focus to the new page's <h1> so screen
 * readers announce the change, or scrolls to and focuses the #section for hash
 * links. A link to the page that is already open scrolls smoothly back to the top
 * (specs/04-pages.md, "Perilaku antar halaman").
 */
export function useRouteFocus() {
  const { pathname, hash, key } = useLocation();
  // POP is the browser's back or forward button; its scroll position is restored, not changed.
  const navigationType = useNavigationType();
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

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (hash) {
      if (!reduceMotion && !firstRender) {
        // <ScrollRestoration> has already jumped straight to the section. Go back to where
        // the visitor was (or the top of a newly opened page) so the smooth scroll has a
        // distance to animate.
        window.scrollTo({ top: samePage ? lastScrollY.current : 0, behavior: 'instant' });
      }
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    } else if (samePage && navigationType !== 'POP' && !reduceMotion && lastScrollY.current > 0) {
      // Same page, no #section (the logo on the home page): <ScrollRestoration> has already
      // jumped to the top. Go back to where the visitor was and glide up from there.
      window.scrollTo({ top: lastScrollY.current, behavior: 'instant' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }, [pathname, hash, key, navigationType]);
}

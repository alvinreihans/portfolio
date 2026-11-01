import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';

import { PageSky } from '../components/home/PageSky.tsx';
import { SceneryFooter } from '../components/home/SceneryFooter.tsx';
import { SiteHeader } from '../components/SiteHeader.tsx';
import { useRouteFocus } from '../hooks/useRouteFocus.ts';

export function RootLayout() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  useRouteFocus();
  // The enter animation is for moving between pages (Q4.28), not the first load: there it hid
  // the prerendered text until the animation could run (specs/08-prerender.md).
  const [firstPath] = useState(pathname);
  const [navigated, setNavigated] = useState(false);
  if (!navigated && pathname !== firstPath) setNavigated(true);

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#content"
        className="sr-only rounded-md bg-card px-3 py-2 font-semibold focus:not-sr-only focus:fixed focus:top-3 focus:left-4 focus:z-50 focus:flex focus:min-h-11 focus:items-center"
      >
        {t('skipToContent')}
      </a>
      <SiteHeader />
      {/* Every page has a page-wide sky behind its content and ends in the pixel scene with
          Contact (specs/07-scenery.md, Q7.9). */}
      <div className="relative flex flex-1 flex-col">
        <PageSky />
        <main
          id="content"
          tabIndex={-1}
          className="relative mx-auto w-full max-w-[1200px] flex-1 px-6 py-16"
        >
          {/* Keyed by path, so a new page plays the enter animation; a #section on the same
              page does not (specs/04-pages.md, Q4.28). */}
          <div key={pathname} className={navigated ? 'page-enter' : undefined}>
            <Outlet />
          </div>
        </main>
      </div>
      <SceneryFooter />
      <ScrollRestoration />
    </div>
  );
}

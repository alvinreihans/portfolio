import { useTranslation } from 'react-i18next';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';

import { PageSky } from '../components/home/PageSky.tsx';
import { SceneryFooter } from '../components/home/SceneryFooter.tsx';
import { SiteFooter } from '../components/SiteFooter.tsx';
import { SiteHeader } from '../components/SiteHeader.tsx';
import { useRouteFocus } from '../hooks/useRouteFocus.ts';

export function RootLayout() {
  const { t } = useTranslation();
  const isHome = useLocation().pathname === '/';
  useRouteFocus();

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#content"
        className="sr-only rounded-md bg-card px-3 py-2 font-semibold focus:not-sr-only focus:fixed focus:top-3 focus:left-4 focus:z-50"
      >
        {t('skipToContent')}
      </a>
      <SiteHeader />
      {/* The home page has a page-wide sky behind its content and ends in the pixel scene
          (specs/07-scenery.md); other pages keep the plain footer (Q7.5). */}
      <div className="relative flex flex-1 flex-col">
        {isHome && <PageSky />}
        <main
          id="content"
          tabIndex={-1}
          className="relative mx-auto w-full max-w-[1200px] flex-1 px-6 py-16"
        >
          <Outlet />
        </main>
      </div>
      {isHome ? <SceneryFooter /> : <SiteFooter />}
      <ScrollRestoration />
    </div>
  );
}

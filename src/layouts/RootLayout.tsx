import { useTranslation } from 'react-i18next';
import { Outlet, ScrollRestoration } from 'react-router';

import { SiteFooter } from '../components/SiteFooter.tsx';
import { SiteHeader } from '../components/SiteHeader.tsx';
import { useRouteFocus } from '../hooks/useRouteFocus.ts';

export function RootLayout() {
  const { t } = useTranslation();
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
      <main id="content" tabIndex={-1} className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-16">
        <Outlet />
      </main>
      <SiteFooter />
      <ScrollRestoration />
    </div>
  );
}

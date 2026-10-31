import { useTranslation } from 'react-i18next';
import { Link, Outlet, ScrollRestoration } from 'react-router';

import { LanguageToggle } from '../components/LanguageToggle.tsx';
import { ThemeToggle } from '../components/ThemeToggle.tsx';

// Navbar details, theme button, and footer arrive in later slices (specs/04-pages.md).
export function RootLayout() {
  const { t } = useTranslation();

  return (
    <>
      <header className="theme-fade bg-nav">
        <nav className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-6">
          <Link to="/" className="font-bold">
            alvinreihans
          </Link>
          <div className="flex items-center gap-3 text-sm font-medium">
            <Link to="/cv" className="px-2">
              {t('nav.cv')}
            </Link>
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </nav>
      </header>
      <main id="content" className="mx-auto max-w-[1200px] px-6 py-16">
        <Outlet />
      </main>
      <ScrollRestoration />
    </>
  );
}

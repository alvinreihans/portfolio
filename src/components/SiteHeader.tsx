import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';

import { LanguageToggle } from './LanguageToggle.tsx';
import { MobileMenu } from './MobileMenu.tsx';
import { NAV_LINKS } from './navLinks.ts';
import { ThemeToggle } from './ThemeToggle.tsx';

export function SiteHeader() {
  const { t } = useTranslation();
  const { key } = useLocation();

  return (
    <header className="theme-fade sticky top-0 z-40 bg-nav">
      <nav className="relative mx-auto flex h-16 max-w-[1200px] items-center gap-2 px-6">
        <Link to="/" className="mr-auto font-bold">
          alvinreihans
        </Link>
        <ul className="hidden items-center gap-1 text-sm font-medium sm:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className="flex min-h-11 items-center px-2 underline-offset-[6px] hover:underline hover:decoration-accent"
              >
                {t(link.labelKey)}
              </Link>
            </li>
          ))}
        </ul>
        <ThemeToggle />
        <LanguageToggle />
        <MobileMenu key={key} />
      </nav>
    </header>
  );
}

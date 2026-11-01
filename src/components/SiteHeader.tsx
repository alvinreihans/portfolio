import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';

import { useHeroActionsVisible } from './home/heroActions.ts';
import { LanguageToggle } from './LanguageToggle.tsx';
import { MobileMenu } from './MobileMenu.tsx';
import { NAV_LINKS } from './navLinks.ts';
import { ThemeToggle } from './ThemeToggle.tsx';

export function SiteHeader() {
  const { t } = useTranslation();
  const { key, pathname } = useLocation();
  const heroActionsVisible = useHeroActionsVisible();

  // On the home page the links wait in the hero until its action row scrolls away.
  // They are only visually hidden: screen readers still reach them, and keyboard
  // focus reveals them (specs/04-pages.md, Q4.13).
  const linksHidden = pathname === '/' && heroActionsVisible !== false;

  return (
    <header className="theme-fade sticky top-0 z-40 bg-nav">
      <nav
        aria-label={t('nav.label')}
        className="relative mx-auto flex h-16 max-w-[1200px] items-center gap-2 px-6"
      >
        <Link to="/" className="mr-auto flex min-h-11 items-center font-bold">
          alvinreihans
        </Link>
        <ul
          className={`hidden items-center gap-1 text-sm font-medium transition-opacity focus-within:pointer-events-auto focus-within:opacity-100 motion-reduce:transition-none sm:flex ${
            linksHidden
              ? 'pointer-events-none opacity-0 duration-[140ms]'
              : 'opacity-100 duration-200'
          }`}
        >
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className="flex min-h-11 min-w-11 items-center justify-center px-2 underline-offset-[6px] hover:underline hover:decoration-accent"
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

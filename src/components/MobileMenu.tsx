import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { NAV_LINKS } from './navLinks.ts';

type Rect = [x: number, y: number, width: number, height: number];

const BARS: Rect[] = [
  [0, 1, 8, 1],
  [0, 4, 8, 1],
  [0, 7, 8, 1],
];
const CROSS: Rect[] = [
  [0, 1, 2, 1],
  [6, 1, 2, 1],
  [1, 2, 2, 1],
  [5, 2, 2, 1],
  [2, 3, 4, 1],
  [3, 4, 2, 1],
  [2, 5, 4, 1],
  [1, 6, 2, 1],
  [5, 6, 2, 1],
  [0, 7, 2, 1],
  [6, 7, 2, 1],
];

// Below 640px the nav links move into this menu (specs/04-pages.md, "Perilaku navbar").
// The parent remounts it on every navigation, which closes it after a link is chosen.
export function MobileMenu() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <div className="sm:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
        onClick={() => setOpen((value) => !value)}
        className="grid size-11 cursor-pointer place-items-center rounded-md hover:bg-chip"
      >
        <svg viewBox="0 0 8 9" className="size-5" shapeRendering="crispEdges" aria-hidden="true">
          {(open ? CROSS : BARS).map(([x, y, width, height]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width={width} height={height} fill="currentColor" />
          ))}
        </svg>
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="theme-fade absolute inset-x-0 top-16 border-b border-line bg-nav px-6 pb-4"
      >
        <ul className="flex flex-col">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <Link to={link.to} className="flex min-h-11 items-center font-medium">
                {t(link.labelKey)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

import { useTranslation } from 'react-i18next';

import { toggle, useTheme } from '../theme/store.ts';

type Rect = [x: number, y: number, width: number, height: number];

// Pixel icons drawn on a small grid, matching the sky decorations in the mockup.
const SUN: Rect[] = [
  [3, 0, 3, 1],
  [1, 1, 7, 1],
  [0, 2, 9, 4],
  [1, 6, 7, 1],
  [3, 7, 3, 1],
];
const MOON: Rect[] = [
  [2, 0, 3, 1],
  [1, 1, 2, 1],
  [0, 2, 2, 4],
  [1, 6, 2, 1],
  [2, 7, 3, 1],
];

export function ThemeToggle() {
  const theme = useTheme();
  const { t } = useTranslation();

  // The icon shows the active theme; the label names the action (specs/02-design-system.md).
  const label = theme === 'day' ? t('theme.switchToNight') : t('theme.switchToDay');
  const rects = theme === 'day' ? SUN : MOON;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="grid size-11 cursor-pointer place-items-center rounded-md hover:bg-chip"
    >
      <svg
        viewBox={theme === 'day' ? '0 0 9 8' : '0 0 8 8'}
        className="size-5"
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        {rects.map(([x, y, width, height]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={width} height={height} fill="currentColor" />
        ))}
      </svg>
    </button>
  );
}

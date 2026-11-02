import { useTranslation } from 'react-i18next';

import { toggle, useTheme } from '../theme/store.ts';
import { PixelIcon } from './PixelIcon.tsx';
import { MOON, SUN } from './pixelIcons.ts';

export function ThemeToggle() {
  const theme = useTheme();
  const { t } = useTranslation();

  // The icon shows the active theme; the label names the action (specs/02-design-system.md).
  const label = theme === 'day' ? t('theme.switchToNight') : t('theme.switchToDay');

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="grid size-11 cursor-pointer place-items-center rounded-md hover:bg-chip"
    >
      {/* Both icons, switched by data-theme, so prerendered pages show the right one before
          React takes over (specs/08-prerender.md). */}
      <PixelIcon icon={SUN} className="night:hidden" />
      <PixelIcon icon={MOON} className="hidden night:block" />
    </button>
  );
}

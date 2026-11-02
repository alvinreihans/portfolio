import { useTranslation } from 'react-i18next';

import type { Language } from '../i18n/detect.ts';
import { saveLanguage } from '../i18n/storage.ts';
import { PixelIcon } from './PixelIcon.tsx';
import { FLAG_ID, FLAG_US } from './pixelIcons.ts';

/** Matches the fade-out duration in index.css (`[data-lang-switch='out']`). */
const FADE_OUT_MS = 120;

// One button showing the flag of the active language; pressing it switches to the other
// language. The label names the action (specs/02-design-system.md, Q2.6).
export function LanguageToggle() {
  const { t, i18n } = useTranslation();
  const current: Language = i18n.resolvedLanguage === 'en' ? 'en' : 'id';
  const label = t('language.switch');

  // The page text fades out, the language changes while it is hidden, and it fades back in
  // (specs/03-i18n.md, Q3.8). Reduced motion switches at once.
  function switchLanguage() {
    const next: Language = current === 'id' ? 'en' : 'id';
    saveLanguage(next);
    const root = document.documentElement;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      void i18n.changeLanguage(next);
      return;
    }
    root.dataset.langSwitch = 'out';
    window.setTimeout(() => {
      void i18n.changeLanguage(next).then(() => {
        requestAnimationFrame(() => delete root.dataset.langSwitch);
      });
    }, FADE_OUT_MS);
  }

  return (
    <button
      type="button"
      onClick={switchLanguage}
      aria-label={label}
      title={label}
      className="grid size-11 cursor-pointer place-items-center rounded-md hover:bg-chip"
    >
      <PixelIcon icon={current === 'id' ? FLAG_ID : FLAG_US} />
    </button>
  );
}

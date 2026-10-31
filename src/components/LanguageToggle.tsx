import { useTranslation } from 'react-i18next';

import type { Language } from '../i18n/detect.ts';
import { saveLanguage } from '../i18n/storage.ts';
import { PixelIcon } from './PixelIcon.tsx';
import { FLAG_ID, FLAG_US } from './pixelIcons.ts';

// One button showing the flag of the active language; pressing it switches to the other
// language. The label names the action (specs/02-design-system.md, Q2.6).
export function LanguageToggle() {
  const { t, i18n } = useTranslation();
  const current: Language = i18n.resolvedLanguage === 'en' ? 'en' : 'id';
  const label = t('language.switch');

  function switchLanguage() {
    const next: Language = current === 'id' ? 'en' : 'id';
    saveLanguage(next);
    void i18n.changeLanguage(next);
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

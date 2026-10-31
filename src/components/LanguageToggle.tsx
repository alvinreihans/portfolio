import { useTranslation } from 'react-i18next';

import { LANGUAGES, type Language } from '../i18n/detect.ts';
import { saveLanguage } from '../i18n/storage.ts';

// Language names stay in their own language, so they are not translated.
const NAMES: Record<Language, string> = { id: 'Bahasa Indonesia', en: 'English' };

export function LanguageToggle() {
  const { t, i18n } = useTranslation();

  function choose(language: Language) {
    saveLanguage(language);
    void i18n.changeLanguage(language);
  }

  return (
    <div role="group" aria-label={t('language.label')} className="flex rounded-md bg-chip p-[3px]">
      {LANGUAGES.map((language) => (
        <button
          key={language}
          type="button"
          lang={language}
          // The accessible name keeps the visible code so voice control users can say it.
          aria-label={`${language.toUpperCase()} (${NAMES[language]})`}
          aria-pressed={i18n.resolvedLanguage === language}
          onClick={() => choose(language)}
          className="min-h-10 min-w-11 cursor-pointer rounded text-xs font-semibold text-muted aria-pressed:bg-card aria-pressed:text-ink aria-pressed:shadow-sm"
        >
          {language.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
